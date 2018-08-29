import React from 'react';
var createReactClass = require('create-react-class');

var Groups = require('./groups');
var GroupSelector = require('./groupselector');
var CreateGroup = require('./create-group');
var DeviceList = require('./devicelist');
var Filters = require('./filters');
var Loader = require('../common/loader');
var pluralize = require('pluralize');
var Pagination = require('rc-pagination');
var _en_US = require('rc-pagination/lib/locale/en_US');

import PropTypes from 'prop-types';
import { Router, Route } from 'react-router';
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
import { isEmpty, preformatWithRequestID } from '../../helpers.js';

var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

import { Tabs, Tab } from 'material-ui/Tabs';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

var DeviceGroups = createReactClass({
	getInitialState() {
		return {
			groups: AppStore.getGroups(),
  		selectedGroup: AppStore.getSelectedGroup(),
  		addGroup: false,
  		removeGroup: false,
  		groupInvalid: true,
  		filters: AppStore.getFilters(),
  		attributes: AppStore.getFilterAttributes(),
  		createGroupDialog: false,
  		devices: [],
  		pageNo: 1,
  		pageLength: 20,
  		loading: true,
  		tmpDevices: [],
  		refreshDeviceLength: 10000,
  		isHosted: (window.location.hostname === "hosted.mender.io")
		};
	},

	componentDidMount() {
		clearAllRetryTimers();
		var self = this;
		var filters = [];

		if (self.props.params.filters) {
			self._refreshGroups();
			var str = decodeURIComponent(self.props.params.filters);
			var obj = str.split("&");
			for (var i=0;i<obj.length;i++) {
				var f = obj[i].split("=");
				filters.push({key:f[0], value:f[1]});
			}
		  self._onFilterChange(filters);
		} else {
			// no group, no filters, all devices
	    	this.deviceTimer = setInterval(this._getDevices, this.state.refreshDeviceLength);
		    this._refreshAll();
	  	}
	},

	componentWillUnmount() {
		clearInterval(this.deviceTimer);
		clearAllRetryTimers();
	},

	componentDidUpdate: function(prevProps, prevState) {
	    if (prevState.selectedGroup !== this.state.selectedGroup) {
	      this._refreshGroups();
	    }

	    if (prevProps.acceptedDevices !== this.props.acceptedDevices) {
	    	clearInterval(this.deviceTimer);   	
	    	if (this.props.currentTab==="Device groups") {	
	    		this.deviceTimer = setInterval(this._getDevices, this.state.refreshDeviceLength);
	    		this._refreshAll();
	    	}
	    }

	    if (prevProps.currentTab !== this.props.currentTab) {
	    	clearInterval(this.deviceTimer);
	    	if (prevProps.currentTab) { this.setState({filters: []});}
	    	if (this.props.currentTab==="Device groups") {	
	    		this.deviceTimer = setInterval(this._getDevices, this.state.refreshDeviceLength);
	    		this._refreshAll();
	    	}
	    }
	},

	_refreshAll: function() {
		this._refreshGroups();
    this._getDevices();
	},


	 /*
	 * Groups
	 */
	_refreshGroups: function(cb) {
	    var self = this;
	    var callback = {
	      success: function (groups) {
	        self.setState({groups: groups});
	        if (cb) { cb(); }
	      },
	      error: function(err) {
	        console.log(err);
	      }
	    };
	    AppActions.getGroups(callback);
	},

	_handleGroupChange: function(group) {
		var self = this;

		clearInterval(self.deviceTimer);
		
		// get number of devices in group first for pagination
    AppActions.getNumberOfDevicesInGroup(function(count) {
      self.setState({loading: true, selectedGroup: group, groupCount: count, pageNo:1, filters: []}, function() {
		    self.deviceTimer = setInterval(self._getDevices, self.state.refreshDeviceLength);
				self._getDevices();
			});
    }, group);

	},

	_toggleDialog: function(ref) {
		var state = {};
    	state[ref] = !this.state[ref];
    	this.setState(state);
	},

	_removeCurrentGroup: function() {
	    var self = this;
	    clearInterval(self.deviceTimer);
	    var callback = {
		    success: function(devices, link) {
		      	// should handle "next page"
		        // returns all group devices ids
		        for (var i=0;i<devices.length; i++) {
		          self._removeSingleDevice(i, devices.length, devices[i].id, (i===devices.length-1) ? finalCallback : null);
		        }
		    },
		    error: function(err) {
		        console.log(err);
		    }
    	};

    	var params = this.state.selectedGroup ? "group="+this.state.selectedGroup : "";
	    AppActions.getDevices(callback, 1, this.state.groupCount, params);
	    var finalCallback = function() {

	     	self._toggleDialog("removeGroup");
	     	AppActions.setSnackbar("Group was removed successfully", 5000);
	     	self.setState({selectedGroup: null, pageNo:1, groupCount: self.props.acceptedDevices}, function() {
	     		setTimeout(function() {
	     			self.deviceTimer = setInterval(self._getDevices, self.state.refreshDeviceLength);
	     			self._refreshAll();
	     		}, 100);
	     	});
	    };
	},

 	_removeSingleDevice: function(idx, length, device, parentCallback) {
 		// remove single device from group
	    var self = this;
	    clearInterval(self.deviceTimer);
	    var callback = {
	      success: function(result) {
	        if (idx===length-1) {
	          // if parentcallback, whole group is being removed
	          if (parentCallback && typeof parentCallback === "function") {
	            // whole group removed
	            parentCallback();
	          } else {
	           AppActions.setSnackbar("The " + pluralize("devices", length) + " " + pluralize("were", length) + " removed from the group", 5000);
	           self._refreshAll();
	          }
	        }
	      },
	      error: function(err) {
	        console.log(err);
	      }
	    };
	    AppActions.removeDeviceFromGroup(device, this.state.selectedGroup, callback);
	},


	/*
	* Devices
	*/ 
	
	_getDevices: function() {
	  	var self = this;
      var groupCallback =  {
        success: function(devices) {
        	if (devices.length && devices[0].attributes && self.state.isHosted) { AppActions.setFilterAttributes(devices[0].attributes) }
        	self.setState({devices: devices});
        	// for each device, get device identity info
          	for (var i=0; i<devices.length; i++) {
          		var count = 0;
          		// have to call each time - accepted list can change order 
          		self._getDeviceDetails(devices[i].id, i, function(id_data, index) {
          			count++;
        				devices[index].id_attributes = id_data;
     						if (count === devices.length) {
     							// only set state after all devices id data retrieved
          				self.setState({devices: devices, loading: false, pageLoading: false});
     						}
          		});
          	}
        },
        error: function(err) {
          console.log(err);
          var errormsg = err.error || "Please check your connection.";
          self.setState({loading: false});
          setRetryTimer(err, "devices", "Devices couldn't be loaded. " + errormsg, self.state.refreshDeviceLength);
        }
      };

      
      var callback =  {
        success: function(devices) {
          self.setState({groupCount: self.props.acceptedDevices}, function() {
          	// for each device, get inventory
          	for (var i=0; i<devices.length; i++) {
          		var gotAttrs = false;
          		var count = 0;
          		devices[i].id_attributes = devices[i].attributes;
          		// have to call inventory each time - accepted list can change order so must refresh inventory too
          		self._getInventoryForDevice(devices[i].device_id, i, function(inventory, index) {
          			count++;
        				devices[index].attributes = inventory.attributes;
        				devices[index].updated_ts = inventory.updated_ts;
        				if (!gotAttrs && inventory.attributes && self.state.isHosted) { AppActions.setFilterAttributes(inventory.attributes); gotAttrs = true; }
 
     						if (count === devices.length) {
     							// only set state after all devices inventory retrieved
     							self.setState({devices: devices, loading: false, pageLoading: false, attributes: AppStore.getFilterAttributes()});
     						}
          		});
          	}
          	if (!devices.length) {
          		// if none, stop loading spinners
          		self.setState({devices: devices, loading: false, pageLoading: false, attributes: AppStore.getFilterAttributes()});
          	}
          });
        },
        error: function(err) {
          console.log(err);
          var errormsg = err.error || "Please check your connection.";
          self.setState({loading: false});
          setRetryTimer(err, "devices", "Devices couldn't be loaded. " + errormsg, self.state.refreshDeviceLength);
        }
      };

      var hasFilters = this.state.filters.length && this.state.filters[0].value;

    	if (this.state.selectedGroup || hasFilters) {
    		var params = this.state.selectedGroup ? "group="+this.state.selectedGroup : "";
    		if (hasFilters) {
    			var str = [];
				  for (var i=0; i<this.state.filters.length;i++) {
				  	if(this.state.filters[i].key && this.state.filters[i].value) {
				    	str.push(encodeURIComponent(this.state.filters[i].key) + "=" + encodeURIComponent(this.state.filters[i].value));
						}
					}
  				params = str.join("&");
    		}
    		// if a group or filters, must use inventory API
    		AppActions.getDevices(groupCallback, this.state.pageNo, this.state.pageLength, params);
      } else {
      	// otherwise, show accepted from device adm
      	AppActions.getDevicesByStatus(callback, "accepted", this.state.pageNo, this.state.pageLength);
      }
     
	},

	 
	_getDeviceById: function(id) {
		// filter the list to show a single device only
		var self = this;
		var callback =  {
        success: function(devices) {
        	var device = devices.length ? [devices[0]] : [];
        	if (device[0]) { device[0].id_attributes = JSON.parse(device[0].device_identity); }
          self.setState({devices: device, loading: false, pageLoading: false, groupCount:devices.length}, function() {
          	if (devices.length) {
	          	self._getInventoryForDevice(id, 0, function(inventory, index) {
	      				device[0].attributes = inventory.attributes;
	      				device[0].updated_ts = inventory.updated_ts;
	      				self.setState({devices: device});
	          	});
          	}
          });
        },
        error: function(err) {
          if (err.res.statusCode === 404) {
          	 self.setState({loading: false, devices: []});
          } else {
          	var errormsg = err.error || "Please check your connection.";
	          self.setState({loading: false});
	          setRetryTimer(err, "devices", "Device couldn't be loaded. " + errormsg, self.state.refreshDeviceLength);
          }
        }
      };

     // do this via admn not inventory
		AppActions.getAuthSets(callback, id);
	},

	  /*
  * Get full device identity details for single selected device
  */
  _getDeviceDetails: function(device_id, index,  originCallback) {
    var self = this;
    var callback = {
      success: function(data) {
        originCallback(JSON.parse(data.id_data), index);
      },
      error: function(err) {
        console.log("Error: " + err);
      }
    };
    AppActions.getDeviceIdentity(device_id, callback);
  },

	_getInventoryForDevice: function(device_id, index, originCallback) {
	    // get inventory for single device
	    var callback = {
	      success: function(device) {
	        originCallback(device, index);
	      },
	      error: function(err) {
	      	if (err.res.statusCode !== 404) {
	      		// don't show error if 404 - device hasn't received inventory yet
	      		 console.log(err);
	      	}
	        originCallback(null, index);
	      }
	    };
	    AppActions.getDeviceById(device_id, callback);
	},

	_handlePageChange: function(pageNo) {
    	var self = this;
    	self.setState({pageLoading: true, pageNo: pageNo}, () => {self._getDevices()});
  	},


  	// Edit groups from device selection
  	_addDevicesToGroup: function(devices) {
  		var self = this;
  		// (save selected devices in state, open dialog)
  		this.setState({tmpDevices: devices}, function() {
  			self._toggleDialog("addGroup");
  		});
  	},

  	_validate: function(invalid, group) {
	    var name = invalid ? "" : group;
	    this.setState({groupInvalid: invalid, tmpGroup: name});
	},
	_changeTmpGroup: function(group) {
		var self = this;
    	this.setState({selectedField: group, tmpGroup: group});
  	},
  	_addToGroup: function() {
  		this._addListOfDevices(this.state.tmpDevices, this.state.selectedField || this.state.tmpGroup);
  	},

  	_createGroupFromDialog: function(devices, group) {
  		var self = this;
	    for (var i=0;i<devices.length;i++) {
	      var group = encodeURIComponent(group);
	      self._addDeviceToGroup(group, devices[i], i, devices.length);
	    }
  	},

	_addListOfDevices: function(rows, group) {
		var self = this;
	    for (var i=0;i<rows.length;i++) {
	      var group = encodeURIComponent(group);
	      self._addDeviceToGroup(group, self.state.devices[rows[i]], i, rows.length);
	    }
	},

	_addDeviceToGroup: function(group, device, idx, length) {
	    var self = this;
	    var callback = {
	      success: function() {
	        if (idx === length-1) {
	          // reached end of list
	          self.setState({createGroupDialog: false, addGroup: false, tmpGroup: "", selectedField:"", }, function() {
	          	AppActions.setSnackbar("The group was updated successfully", 5000);
		          self._refreshGroups(function() {
		          	self._handleGroupChange(group);
		          });
		        
	          });
	        }
	      },
	      error: function(err) {
	        console.log(err);
	        var errMsg = err.res.body.error || "";
	        AppActions.setSnackbar(preformatWithRequestID(err.res, "Group could not be updated: " + errMsg), null, "Copy to clipboard");
	      }
	    };
	    AppActions.addDeviceToGroup(group, device.device_id || device.id, callback);
	},

	_removeDevicesFromGroup: function(rows) {
		var self = this;
		var callback;
		clearInterval(self.deviceTimer);
		// if rows.length === groupCount
		// group now empty, go to all devices 
		if (rows.length >= self.state.groupCount) {
			callback = function() {
				AppActions.setSnackbar("Group was removed successfully", 5000);
		     	self.setState({loading:true, selectedGroup: null, pageNo:1, groupCount: self.props.acceptedDevices}, function() {
		     		self._refreshAll();
		     	});
			};
		}

		// if rows.length = number on page but < groupCount
		// move page back to pageNO 1 in callback
		else if (self.state.devices.length <= rows.length) {
			callback = function() {
				self.setState({pageNo:1, pageLoading:true, groupCount: self.state.groupCount-rows.length}, function() {
			     	self._refreshAll();
		     	});
			};
		}

		for (var i=0;i<rows.length;i++) {
			self._removeSingleDevice(i, rows.length, self.state.devices[rows[i]].id, callback);
		}
	},

	_onFilterChange: function(filters) {
    var self = this;
    clearInterval(self.deviceTimer);
    var id, group;
    // check filters for ID or group, this is temporary until full filtering functionality
    for (var i=0;i<filters.length;i++) {
      if (filters[i].key === "id") {
        id = filters[i].value;
        break;
      } else if (filters[i].key === "group") {
    		group = filters[i].value;
    		break;
      }
    }

    if (id) {
    	// get single device by id
    	self.setState({filters: filters, pageNo:1}, function() {
    		self._getDeviceById(id);
    	});
    } else if (group) {
    	self.setState({selectedGroup: group});
			self._refreshGroups(function() {
				self._handleGroupChange(group);
			});
    } else {
    	self.setState({filters: filters, pageNo:1}, function() {
    		self.deviceTimer = setInterval(self._getDevices, self.state.refreshDeviceLength);
      	self._getDevices();
    	});
    }
   
  },

	render: function() {
		// Add to group dialog 
		var addActions = [
	      <div style={{marginRight:"10px", display:"inline-block"}}>
	        <FlatButton
	          label="Cancel"
	          onClick={this._toggleDialog.bind(null, "addGroup")} />
	      </div>,
	      <RaisedButton
	        label="Add to group"
	        primary={true}
	        onClick={this._addToGroup}
	        ref="save" 
	        disabled={this.state.groupInvalid} />
	    ];

	  	var removeActions = [
	      <div style={{marginRight:"10px", display:"inline-block"}}>
	        <FlatButton
	          label="Cancel"
	          onClick={this._toggleDialog.bind(null, "removeGroup")} />
	      </div>,
	      <RaisedButton
	        label="Remove group"
	        primary={true}
	        onClick={this._removeCurrentGroup} />
	    ];

	  	var groupCount = this.state.groupCount ? this.state.groupCount : this.props.acceptedDevices;

	    var styles = {
	      exampleFlatButtonIcon: {
	        height: '100%',
	        display: 'inline-block',
	        verticalAlign: 'middle',
	        float: 'left',
	        paddingLeft: '12px',
	        lineHeight: '36px',
	        marginRight: "-6px",
	        color:"#679BA5",
	        fontSize:'16px'
	      },
	      exampleFlatButton: {
	        fontSize:'12px',
	        marginLeft:"10px",
	        float:"right",
	        marginTop: "10px",
	      },
		};

		return (	
			<div className="margin-top">
			
				<div className="leftFixed">
		      <Groups
            openGroupDialog={this._toggleDialog.bind(null, "createGroupDialog")}
            changeGroup={this._handleGroupChange}
            groups={this.state.groups}
            selectedGroup={this.state.selectedGroup}
            allCount={this.props.allCount}
            acceptedCount={this.props.acceptedDevices}
            showHelptips={this.props.showHelptips} />
      	</div>
	      <div className="rightFluid" style={{paddingTop:"0"}}>

      		{!this.state.selectedGroup ?
						<Filters globalSettings={this.props.globalSettings} attributes={this.state.attributes} filters={this.state.filters} onFilterChange={this._onFilterChange} isHosted={this.state.isHosted} /> : null
					}

          <FlatButton onClick={this._toggleDialog.bind(null, "removeGroup")} style={styles.exampleFlatButton} className={this.state.selectedGroup ? null : 'hidden' } label="Remove group" labelPosition="after">
          		<FontIcon style={styles.exampleFlatButtonIcon} className="material-icons">delete</FontIcon>
        	</FlatButton>
          	
        	<DeviceList
        		docsVersion={this.props.docsVersion}
        		pageNo={this.state.pageNo}
        		addDevicesToGroup={this._addDevicesToGroup} 
        		removeDevicesFromGroup={this._removeDevicesFromGroup} 
        		loading={this.state.loading} 
        		rejectOrDecomm={this.props.rejectOrDecomm} 
        		currentTab={this.props.currentTab} 
        		allCount={this.props.allCount}
        		acceptedCount={this.props.acceptedDevices}
        		groupCount={groupCount} 
        		styles={this.props.styles} 
        		group={this.state.selectedGroup} 
        		devices={this.state.devices}
        		paused={this.props.paused}
        		showHelptips={this.props.showHelptips}
        		globalSettings={this.props.globalSettings}
        		openSettingsDialog={this.props.openSettingsDialog} />
          	
          	{this.state.devices.length && !this.state.loading ?
          	<div className="margin-top">
           		<Pagination locale={_en_US} simple pageSize={this.state.pageLength} current={this.state.pageNo} total={groupCount} onChange={this._handlePageChange} />
             		{this.state.pageLoading ?  <div className="smallLoaderContainer"><Loader show={true} /></div> : null}
          	</div> : null }
        	</div>

        <Dialog
          ref="addGroup"
          open={this.state.addGroup}
          title="Add selected devices to group"
          actions={addActions}
          autoDetectWindowHeight={true}
          bodyStyle={{fontSize: "13px"}}>  
          <GroupSelector devices={this.state.tmpDevices.length} willBeEmpty={this.state.willBeEmpty} tmpGroup={this.state.tmpGroup} selectedGroup={this.state.selectedGroup} changeSelect={this._changeTmpGroup} validateName={this._validate} groups={this.state.groups} selectedField={this.state.selectedField} />
        </Dialog>

        <Dialog
        	ref="removeGroup"
	        open={this.state.removeGroup}
	        title="Remove this group?"
	        actions={removeActions}
	        autoDetectWindowHeight={true}
	        bodyStyle={{fontSize: "13px"}}>  
	        <p>This will remove the group from the list. Are you sure you want to continue?</p>
        </Dialog>


        <CreateGroup
        	ref="createGroupDialog"
        	toggleDialog={this._toggleDialog}
	        open={this.state.createGroupDialog}
	        groups={this.state.groups}
	        changeGroup={this._handleGroupChange}
	        globalSettings={this.props.globalSettings}
	        addListOfDevices={this._createGroupFromDialog}
	        acceptedCount={this.props.acceptedDevices}
        />

			</div>

		);

	}

});

DeviceGroups.contextTypes = {
  router: PropTypes.object
};

module.exports = DeviceGroups;