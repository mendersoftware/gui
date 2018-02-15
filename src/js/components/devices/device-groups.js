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
import Snackbar from 'material-ui/Snackbar';
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
	  		attributes: AppStore.getAttributes(),
	  		snackbar: AppStore.getSnackbar(),
	  		createGroupDialog: false,
	  		devices: [],
	  		pageNo: 1,
	  		pageLength: 20,
	  		loading: true,
	  		tmpDevices: [],
	  		refreshDeviceLength: 10000,
		};
	},

	componentDidMount() {
		clearAllRetryTimers();
		var self = this;
		var filters = [];
    
      if (self.props.params.filters) {
        var str = decodeURIComponent(self.props.params.filters);
        var obj = str.split("&");
        for (var i=0;i<obj.length;i++) {
          var f = obj[i].split("=");
          filters.push({key:f[0], value:f[1]});
        }
        self._onFilterChange(filters);
      } else {
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

	    if (prevProps.currentTab !== this.props.currentTab) {
	    	clearInterval(this.deviceTimer);
	    	this.setState({filters: [{key:'', value:''}]});
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
	_refreshGroups: function() {
	    var self = this;
	    var groupDevices = {};
	    var callback = {
	      success: function (groups) {
	        self.setState({groups: groups});

	        for (var i=0;i<groups.length;i++) {
	          groupDevices[groups[i]] = 0;
	          setNum(groups[i], i);
	          function setNum(group, idx) {
	            
	            AppActions.getNumberOfDevicesInGroup(function(noDevs) {
	              groupDevices[group] = noDevs;
	              self.setState({groupDevices: groupDevices});
	            }, group);
	          }
	        }

	      },
	      error: function(err) {
	        console.log(err);
	      }
	    };
	    AppActions.getGroups(callback);
	},

	_handleGroupChange: function(group, numDev) {
		var self = this;
		clearInterval(self.deviceTimer);
		setTimeout(function() {
			AppActions.setSnackbar("");
		}, 4000);
		this.setState({loading: true, selectedGroup: group, groupCount: numDev, pageNo:1, filters: [{key:'', value:''}]}, function() {
	    	self.deviceTimer = setInterval(self._getDevices, self.state.refreshDeviceLength);
			self._getDevices();
		});
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
		          self._removeSingleDevice(i, devices.length, devices[i].id, i===devices.length-1 ? finalCallback : null);
		        }
		    },
		    error: function(err) {
		        console.log(err);
		    }
    	};

	    AppActions.getDevices(callback, 1, 100, this.state.selectedGroup, null);
	    var finalCallback = function() {

	     	self._toggleDialog("removeGroup");
	     	AppActions.setSnackbar("Group was removed successfully");
	     	self.setState({selectedGroup: null, pageNo:1, groupCount: self.props.allCount}, function() {
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
	           AppActions.setSnackbar("The " + pluralize("devices", length) + " " + pluralize("were", length) + " removed from the group");
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
       var callback =  {
        success: function(devices) {
          self.setState({devices: devices, loading: false, pageLoading: false});
        },
        error: function(error) {
          console.log(error);
          var errormsg = err.error || "Please check your connection.";
          self.setState({loading: false});
          setRetryTimer(err, "devices", "Devices couldn't be loaded. " + errormsg, self.state.refreshDeviceLength);
        }
      };
      AppActions.getDevices(callback, this.state.pageNo, this.state.pageLength, this.state.selectedGroup);
	},
	 
	_getDeviceById: function(id) {
		var self = this;
		var callback =  {
        success: function(device) {
          self.setState({devices: [device], loading: false, pageLoading: false});
        },
        error: function(error) {
          if (error.res.statusCode === 404) {
          	 self.setState({loading: false, devices: []});
          } else {
          	var errormsg = err.error || "Please check your connection.";
	          self.setState({loading: false});
	          setRetryTimer(err, "devices", "Device couldn't be loaded. " + errormsg, self.state.refreshDeviceLength);
          }
        }
      };
		AppActions.getDeviceById(id, callback);
	},

	_getInventoryForDevice: function(device, originCallback) {
	    // get inventory for single device
	    var callback = {
	      success: function(device) {
	        originCallback(device);
	      },
	      error: function(err) {
	        console.log(err);
	        originCallback(null);
	      }
	    };
	    AppActions.getDeviceById(device.device_id, callback);
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
	          self.setState({createGroupDialog: false, addGroup: false, tmpGroup: "", selectedField:""});
	          AppActions.setSnackbar("The group was updated successfully");
	          self._refreshGroups();
	          setTimeout(function() {
	          	self._handleGroupChange(group, self.state.groupDevices[group]+length);
	          },300);
	          
	        }
	      },
	      error: function(err) {
	        console.log(err);
	        var errMsg = err.res.body.error || "";
	        AppActions.setSnackbar(preformatWithRequestID(err.res, "Group could not be updated: " + errMsg));
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
				AppActions.setSnackbar("Group was removed successfully");
		     	self.setState({loading:true, selectedGroup: null, pageNo:1, groupCount: self.props.allCount}, function() {
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
    var id;
    // check filters for ID, this is temporary until full filtering functionality
    for (var i=0;i<filters.length;i++) {
      if (filters[i].key === "id") {
        id = filters[i].value;
        break;
      }
    }

    if (id) {
    	// get single device by id
    	self.setState({filters: filters}, function() {
    		self._getDeviceById(id);
    	});
    } else {
    	self.setState({filters: filters}, function() {
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

	  	var groupCount = this.state.groupCount ? this.state.groupCount : this.props.allCount;

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
				{!this.state.selectedGroup ?
				<Filters attributes={this.state.attributes} filters={this.state.filters} onFilterChange={this._onFilterChange} /> : null
				}
				<div className="leftFixed">
		          	<Groups
		            openGroupDialog={this._toggleDialog.bind(null, "createGroupDialog")}
		            changeGroup={this._handleGroupChange}
		            groups={this.state.groups}
		            groupDevices={this.state.groupDevices}
		            selectedGroup={this.state.selectedGroup}
		            allCount={this.props.allCount}
		            acceptedCount={this.props.acceptedDevices}
		            showHelptips={this.props.showHelptips} />
	        	</div>
	        	<div className="rightFluid">
		            <FlatButton onClick={this._toggleDialog.bind(null, "removeGroup")} style={styles.exampleFlatButton} className={this.state.selectedGroup ? null : 'hidden' } label="Remove group" labelPosition="after">
		          		<FontIcon style={styles.exampleFlatButtonIcon} className="material-icons">delete</FontIcon>
		        	</FlatButton>
		          	
		          	<DeviceList
		          		pageNo={this.state.pageNo}
		          		addDevicesToGroup={this._addDevicesToGroup} 
		          		removeDevicesFromGroup={this._removeDevicesFromGroup} 
		          		loading={this.state.loading} 
		          		rejectOrDecomm={this.props.rejectOrDecomm} 
		          		currentTab={this.props.currentTab} 
		          		allCount={this.props.allCount} 
		          		groupCount={groupCount} 
		          		styles={this.props.styles} 
		          		group={this.state.selectedGroup} 
		          		devices={this.state.devices}
		          		paused={this.props.paused}
		          		showHelptips={this.props.showHelptips} />
		          	
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
			        addListOfDevices={this._createGroupFromDialog}
		         />

		        <Snackbar
		          open={this.state.snackbar.open}
		          message={this.state.snackbar.message}
		          autoHideDuration={8000}
		        />
			</div>

		);

	}

});

DeviceGroups.contextTypes = {
  router: PropTypes.object
};

module.exports = DeviceGroups;