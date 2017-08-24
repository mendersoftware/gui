import React from 'react';
import PropTypes from 'prop-types';
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var update = require('react-addons-update');

var Groups = require('./groups');
var DeviceList = require('./devicelist');
var Unauthorized = require('./unauthorized');
var DevicePicker = require('./devicepicker');

var Pagination = require('rc-pagination');
var _en_US = require('rc-pagination/lib/locale/en_US');
var Loader = require('../common/loader');
var pluralize = require('pluralize');
require('../common/prototype/Array.prototype.equals');
var createReactClass = require('create-react-class');

import Snackbar from 'material-ui/Snackbar';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import { List, ListItem } from 'material-ui/List';

import { Router, Route, Link } from 'react-router';

function getState() {
  return {
    groups: AppStore.getGroups(),
    groupsForList: AppStore.getGroups(),
    selectedGroup: AppStore.getSelectedGroup(),
    pendingDevices: AppStore.getPendingDevices(),
    filters: AppStore.getFilters(),
    attributes: AppStore.getAttributes(),
    artifacts: AppStore.getArtifactsRepo(),
    snackbar: AppStore.getSnackbar(),
    totalDevices: AppStore.getTotalDevices(),
    user: AppStore.getCurrentUser(),
    refreshDeviceLength: 10000,
    refreshAdmissionLength: 20000,
  }
}

var Devices = createReactClass({
  getInitialState: function() {
    return getState();
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  componentDidMount: function() {
    this.setState({doneLoading:false});
    clearAllRetryTimers();
    this.deviceTimer = setInterval(this._refreshDevices, this.state.refreshDeviceLength);
    this.admissionTimer = setInterval(this._refreshAdmissions, this.state.refreshAdmissionLength);
    this._refreshAll();
  },
  _handleGroupsChange: function(group) {
    AppActions.selectGroup(group);
    this.setState({doneLoading:false, selectedGroup:group});
    this._refreshGroups();
  },
  _refreshAll: function() {
    var self = this;
    this._refreshAdmissions();
    this._refreshDevices();
    this._refreshGroups();

    AppActions.getArtifacts({
      success: function(artifacts) {
        self.setState({artifacts:artifacts})
      }
    });

    var filters = [];
    if (self.props.params) {
      if (self.props.params.group) {
        AppActions.selectGroup(self.props.params.group);
        self.setState({selectedGroup:self.props.params.group});
      }
      if (self.props.params.filters) {
        var str = decodeURIComponent(self.props.params.filters);
        var obj = str.split("&");
        for (var i=0;i<obj.length;i++) {
          var f = obj[i].split("=");
          filters.push({key:f[0], value:f[1]});
        }
        this._updateFilters(filters);
      }
    }
  },
  componentWillUnmount: function () {
    this._pauseTimers(true);
    clearAllRetryTimers();
    AppStore.removeChangeListener(this._onChange);
    AppActions.selectGroup(null);
    this._updateFilters([{key:'', value:''}]);
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.selectedGroup !== this.state.selectedGroup) {
      clearInterval(this.deviceTimer);
      this._refreshGroups();
      this._refreshDevices(1);
      this.deviceTimer = setInterval(this._refreshDevices, this.state.refreshDeviceLength);
    }
  },
  _onChange: function() {
    this.setState(this.getInitialState());
  },
  _refreshDevices: function(page, per_page) {
    var self = this;

    if (typeof page !=="undefined") {
       this.setState({currentPage:page});
    }
    if (typeof per_page !=="undefined") {
       this.setState({perPage:per_page});
    }
    var pageNo = typeof page !=="undefined" ? page : this.state.currentPage;
    var perPage = typeof per_page !=="undefined" ? per_page : this.state.perPage;

    var allCallback = {
      success: function(devices, links) {
        // clear countdown and snackbar
        clearRetryTimer("devices");
        AppActions.setSnackbar("");
        self.setState({doneLoading:true, devices: devices, devLoading:false});
        if (self.state.paused) {
          self._pauseTimers(false);      // unpause timers
        };
      },
      error: function(err) {
        self.setState({doneLoading:true, devLoading:false});
        console.log(err);
        var errormsg = err || "Please check your connection.";
        setRetryTimer("devices", "Devices couldn't be loaded. " + errormsg, self.state.refreshDeviceLength);
      }
    };

    var groupCallback = {
      success: function(deviceList, links) {
        // clear countdown and snackbar
        clearRetryTimer("devices");
        AppActions.setSnackbar("");
        var sorted = deviceList.sort();
        getDevicesFromIDs(sorted, function(devices) {
          self.setState({doneLoading:true, devLoading:false, devices:devices});
        });
      },
      error: function(err) {
        self.setState({doneLoading:true, devLoading:false});
        console.log(err);
        var errormsg = err || "Please check your connection";
        setRetryTimer("devices", "Devices couldn't be loaded. " + errormsg, self.state.refreshDeviceLength);
      }
    };

    function getDevicesFromIDs(list, callback) {
      var devices = [];
     
      list.forEach( function(id, index) {
        AppActions.getDeviceById(id, {
          success: function(device) {
            devices[index] = device;
            if (index===list.length-1) { callback(devices); }
          },
          error: function(err) {
            console.log(err);
          }
        });
      });
    }

    if (!this.state.selectedGroup) {
      AppActions.getDevices(allCallback, pageNo, perPage);
      AppActions.getNumberOfDevices(function(noDevs) {
        self.setState({totalDevices: noDevs, numDevices: noDevs});
      });
    } else {
      AppActions.getDevices(groupCallback, pageNo, perPage, this.state.selectedGroup);
      AppActions.getNumberOfDevices(function(noDevs) {
        self.setState({numDevices: noDevs});
      }, this.state.selectedGroup);
    }

  },
  _refreshAdmissions: function(page, per_page) {
    var self = this;
    AppActions.getNumberOfDevicesForAdmission(function(noDevs) {
      self.setState({totalAdmDevices: noDevs});
    });

    if (typeof page !=="undefined") {
       this.setState({admPageNo:page});
    }
    if (typeof per_page !=="undefined") {
       this.setState({admPerPage:per_page});
    }
    var pageNo = typeof page !=="undefined" ? page : this.state.admPageNo;
    var perPage = typeof per_page !=="undefined" ? per_page : this.state.admPerPage;

    var callback = {
      success: function(devices, links) {
        // clear countdown and snackbar
        clearRetryTimer("admission");
        self.setState({pendingDevices: devices, authLoading: false});
        self._pauseTimers(false);      // unpause timers
      },
      error: function(err) {
        var errormsg = err || "Please check your connection.";
        setRetryTimer("admission", "Pending devices couldn't be loaded. " + errormsg, self.state.refreshAdmissionLength);
      }

    };

    AppActions.getDevicesForAdmission(callback, pageNo, perPage);
  },
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
            AppActions.getNumberOfDevices(function(noDevs) {
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
  _addTmpGroup: function(name) {
    // use a tmp group so as not to affect the groups in state
    var groups = update(this.state.groups, {$push: [name]});
    this.setState({groupsForList: groups, selectedField: name});
  },
  _changeTmpGroup: function(group) {
    this.setState({selectedField: group});
  },
  _updateFilters: function(filters) {
    AppActions.updateFilters(filters);
  },
  _handleRequestClose: function() {
    AppActions.setSnackbar("");
  },
  _showLoader: function(bool) {
    this.setState({doneLoading: !bool});
  },
  _redirect: function(params) {
    this.context.router.push(params.route);
  },
  _handlePageChange: function(pageNo) {
    clearInterval(this.deviceTimer);
    this.setState({currentPage: pageNo, devLoading:true, expandedRow: null, expandedDevice: {}}, this._refreshDevices(pageNo));
    this.deviceTimer = setInterval(this._refreshDevices, this.state.refreshDeviceLength);
  },
  _handleAdmPageChange: function(pageNo) {
    clearInterval(this.admissionTimer);
    this.setState({currentAdmPage: pageNo, authLoading:true, expandedAdmRow: null}, this._refreshAdmissions(pageNo));
    this.admissionTimer = setInterval(this._refreshAdmissions, this.state.refreshAdmissionLength);
  },
  _handleGroupChange: function(group) {
    this.setState({currentPage: 1, doneLoading:false, expandedRow: null, expandedDevice: {}}, AppActions.selectGroup(group)); 
  },
  _handleGroupDialog: function () {
    this._pauseTimers(!this.state.openGroupDialog);
    this.setState({openGroupDialog: !this.state.openGroupDialog, pickerDevices: []});
  },
  _handlePickerRequest: function(perPage, searchterm) {
    this.setState({pickerLoading:true});
    var self = this;
    var per = perPage || 20;
    var callback = {
      success: function(devices, links) {
        self.setState({pickerDevices: devices, hasNextPicker: (typeof links.next !== "undefined"), pickerLoading:false});
        AppActions.setSnackbar("");
      },
      error: function(err) {
        console.log(err);
        var errormsg = err.error || "Please check your connection";
        AppActions.setSnackbar("Devices couldn't be loaded. " +errormsg);
      }
    };
    AppActions.getDevices(callback, 1, per, null, searchterm);
  },
  _pauseTimers: function(val) {
    var self = this;
    // clear dropdown value - can move this
    this.setState({selectedField: '', paused: val});
    clearInterval(self.deviceTimer);
    clearInterval(self.admissionTimer);
    if (!val) {
      self.deviceTimer = setInterval(self._refreshDevices, self.state.refreshDeviceLength);
      
      self.admissionTimer = setInterval(self._refreshAdmissions, self.state.refreshAdmissionLength);
    }
  },
  _handleRows: function(rows) {
    this.setState({selectedRows: rows});
  },
  dialogToggle: function (ref) {
    var state = {};
    state[ref] = !this.state[ref];
    this.setState(state);
  },
  closeDialogs: function() {
    this.setState({remove: false, block: false, schedule: false});
  },
  _blockDialog: function(device, remove) {
    if (remove) {
      this.setState({remove: true, block: false, blockDevice: device});
    } else {
      this.setState({block: true, remove: false, blockDevice: device});
    }
  },
  _blockDevice: function(accepted) {
    // if device already accepted (accepted===true), set true to use devauth api
    // otherwise use device admn api
    var self = this;
    self.closeDialogs();
    self._pauseTimers(true); // pause periodic calls to device apis until finished authing devices

    var callback = {
      success: function(data) {
        AppActions.setSnackbar("Device was rejected successfully");
        self._refreshAdmissions();
        self._refreshDevices();
        self.setState({expandedAdmRow: null});
        if (accepted) { self._setDeviceDetails(self.state.blockDevice) }
      },
      error: function(err) {
        AppActions.setSnackbar("There was a problem rejecting the device: "+err);
      }
    };

    if (accepted) {
      AppActions.blockDevice(self.state.blockDevice, callback);
    } else {
      AppActions.rejectDevice(self.state.blockDevice, callback);
    }
    
  },
  _acceptDevice: function(devices) {
    /*
    * function for accepting a single device from expanded device details, for a previously blocked device, via devauth api
    */
    var self = this;
    var callback = {
      success: function(data) {
        AppActions.setSnackbar("Device was authorized");
        self._refreshAdmissions();
        self.setState({expandedAdmRow: null});
        self._setDeviceDetails(devices[0]);
      },
      error: function(err) {
        AppActions.setSnackbar("There was a problem authorizing the device: "+err);
      }
    };
    // 'devices' is an array but will always be length 1 as it comes from expanded single device row
    AppActions.reacceptDevice(devices[0], callback);
  },

  _authorizeDevices: function(devices) {
    /*
    * function for authorizing group of devices via devadmn API
    */
    var self = this;

    self.setState({doneLoading: false});

    // make into chunks of 5 devices
    var arrays = [], size = 5;
    var deviceList = devices.slice();
    while (deviceList.length > 0) {
      arrays.push(deviceList.splice(0, size));
    }
    
    var i = 0;
    var success = 0;
    var loopArrays = function(arr) {
      self._pauseTimers(true); // pause periodic calls to device apis until finished authing devices
      // for each chunk, authorize one by one
      self._authorizeBatch(arr[i], function(num) {
        success = success+num;
        i++;
        if (i < arr.length) {
          loopArrays(arr);   
        } else {
          setTimeout(function() {
            AppActions.setSnackbar(success + " " + pluralize("devices", success) + " " + pluralize("were", success) + " authorized");
          }, 2000);
          self._refreshDevices();
          self._refreshAdmissions();
          self.setState({doneLoading: true, expandedAdmRow: null, expandedRow: null});
        }
      });
    }
    loopArrays(arrays);
  },
  _authorizeBatch(devices, callback) {
    // authorize the batch of devices one by one, callback when finished
    var i = 0;
    var fail = 0;
    var singleCallback = {
      success: function(data) {
        i++;
        if (i===devices.length) {
          callback(i);
        }
      }.bind(this),
      error: function(err) {
        fail++;
        i++;
        AppActions.setSnackbar("There was a problem authorizing the device: "+err);
        if (i===devices.length) {
          callback(i-fail);
        }
      }
    };

    devices.forEach( function(device, index) {
      AppActions.acceptDevice(device, singleCallback);
    });
  },

  _decommissionDevice: function() {
    var self = this;
    var callback = {
      success: function(data) {
        AppActions.setSnackbar("Device was successfully decommissioned");
        self.closeDialogs();
        self.setState({expandedRow:null, expandedDevice:null});
        self._refreshDevices();
      },
      error: function(err) {
        AppActions.setSnackbar("There was a problem decommissioning the device: "+err);
      }
    };
    AppActions.decommissionDevice(self.state.blockDevice, callback);
  },

  /*
  * Handle selecting of a row in child device list
  */
  _clickRow: function(device, rowNumber) {
    clearInterval(this.inventoryInterval);
    
    // check device is not already expanded, if so, close it
    if (!this.state.expandedDevice || (device.id !== this.state.expandedDevice.id)) {
      this.setState({expandedRow: rowNumber, expandedDevice: device});
      this._setDeviceDetails(device);

      // if no inventory yet, keep updating for inventory data while expanded
      if (!device.attributes) {
        this.inventoryInterval = setInterval(function() {
          if (this.state.devices[rowNumber].attributes) {
            device.attributes = this.state.devices[rowNumber].attributes;
            this.setState({expandedDevice: device});
            clearInterval(this.inventoryInterval);
          }
        }.bind(this), 5000);
      }
    } else {
      this.setState({expandedRow: null, expandedDevice: {}});
    }
  },


  /*
  * Handle selecting of a row in pending authorization device list
  */
  _clickAdmRow: function(rowNumber) {
    // check device is not already expanded, if so, close it
    if (rowNumber !== this.state.expandedAdmRow) {
      this.setState({expandedAdmRow: rowNumber});
    } else {
      this.setState({expandedAdmRow: null});
    }
  },


  /*
  * Get full device identity details for single selected device
  */
  _setDeviceDetails: function(device) {
    var self = this;
    var callback = {
      success: function(data) {
        device.auth_sets = data.auth_sets;
        device.id_data = JSON.parse(data.id_data);
        device.id = data.id;
        device.created_ts = data.created_ts;
        self.setState({expandedDevice: device});
      },
      error: function(err) {
        console.log("Error: " + err);
      }
    };
    AppActions.getDeviceIdentity(device.id, callback);
  },

  render: function() {
    var decommissionActions =  [
      <div style={{marginRight:"10px", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this.closeDialogs} />
      </div>
    ];
    var blockActions =  [
      <div style={{marginRight:"10px", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this.closeDialogs} />
      </div>,
      <RaisedButton
        label="Block device"
        secondary={true}
        onClick={this._blockDevice.bind(null, false)}
        icon={<FontIcon style={{marginTop:"-4px"}} className="material-icons">cancel</FontIcon>} />
    ];

    var styles = {
      listStyle: {
        fontSize: "12px",
        paddingTop: "10px",
        paddingBottom: "10px"
      },
      sortIcon: {
        verticalAlign: 'middle',
        marginLeft: "10px",
        color: "#8c8c8d",
        cursor: "pointer",
      }
    }

    return (
      <div className="margin-top">
       <div className="leftFixed">
          <Groups
            openGroupDialog={this._handleGroupDialog}
            changeGroup={this._handleGroupChange}
            groupList={this.state.groups}
            groupDevices={this.state.groupDevices}
            selectedGroup={this.state.selectedGroup}
            allDevices={this.state.allDevices}
            totalDevices={this.state.totalDevices} />
        </div>
        <div className="rightFluid padding-right">
          <div className={this.state.pendingDevices.length ? "fadeIn onboard" : "hidden"}>
            <Unauthorized 
              styles={styles} 
              block={this._blockDialog} 
              pauseRefresh={this._pauseTimers}
              addTooltip={this.props.addTooltip}
              showLoader={this._showLoader} 
              refresh={this._refreshDevices} 
              refreshAdmissions={this._refreshAdmissions} 
              pending={this.state.pendingDevices} 
              total={this.state.totalAdmDevices}
              expandedAdmRow={this.state.expandedAdmRow}
              expandRow={this._clickAdmRow}
              authorizeDevices={this._authorizeDevices}
              disabled={this.state.paused} />
            <div>
              {this.state.totalAdmDevices ? <Pagination locale={_en_US} simple pageSize={20} current={this.state.currentAdmPage || 1} total={this.state.totalAdmDevices} onChange={this._handleAdmPageChange} /> : null }
             
              {this.state.authLoading ?  <div className="smallLoaderContainer"><Loader show={true} /></div> : null}
            </div>
          </div>
          <Loader show={!this.state.doneLoading} />
          <DeviceList
            styles={styles}
            addTooltip={this.props.addTooltip} 
            redirect={this._redirect}
            refreshDevices={this._refreshDevices}
            groupsChanged={this._handleGroupsChange}
            selectedField={this.state.selectedField}
            changeSelect={this._changeTmpGroup}
            addGroup={this._addTmpGroup}
            filters={this.state.filters}
            attributes={this.state.attributes}
            onFilterChange={this._updateFilters}
            artifacts={this.state.artifacts}
            loading={this.state.devLoading}
            groups={this.state.groupsForList}
            devices={this.state.devices || []}
            selectedGroup={this.state.selectedGroup}
            page={this.state.currentPage}
            pauseRefresh={this._pauseTimers}
            block={this._blockDialog}
            accept={this._acceptDevice}
            expandRow={this._clickRow}
            expandedRow={this.state.expandedRow}
            expandedDevice={this.state.expandedDevice} />
            {this.state.totalDevices ? <Pagination locale={_en_US} simple pageSize={20} current={this.state.currentPage || 1} total={this.state.numDevices} onChange={this._handlePageChange} /> : null }
            {this.state.devLoading ?  <div className="smallLoaderContainer"><Loader show={true} /></div> : null}
        </div>
        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          autoHideDuration={8000}
          bodyStyle={{maxWidth: this.state.snackbar.maxWidth}}
          onRequestClose={this.handleRequestClose}
        />
        <DevicePicker
          user={this.state.user}
          open={this.state.openGroupDialog || false}
          refreshGroups={this._refreshGroups}
          pickerDevices={this.state.pickerDevices || []}
          groupList={this.state.groups}
          toggleDialog={this._handleGroupDialog}
          getPickerDevices={this._handlePickerRequest}
          hasNext={this.state.hasNextPicker}
          changeGroup={this._handleGroupChange}
          loadingDevices={this.state.pickerLoading}
        />


        <Dialog
          open={this.state.block || false}
          title='Block this device?'
          actions={blockActions}
          autoDetectWindowHeight={true}
          bodyStyle={{paddingTop:"0", fontSize:"13px"}}
          contentStyle={{overflow:"hidden", boxShadow:"0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)"}}
          >

          <p>
            This device will be rejected and blocked from making authorization requests in the future.
          </p>
        </Dialog>

        <Dialog
          open={this.state.remove || false}
          title='Block or decommission device?'
          actions={decommissionActions}
          autoDetectWindowHeight={true}
          bodyStyle={{paddingTop:"0", fontSize:"13px"}}
          contentStyle={{overflow:"hidden", boxShadow:"0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)"}}
          >
          {this.state.blockDevice ? <ListItem className="margin-bottom-small" style={styles.listStyle} disabled={true} primaryText="Device ID" secondaryText={this.state.blockDevice.id}  />: null}
          <div className="split-dialog">
            <div className="align-center">
              <div>
                <FontIcon className="material-icons" style={{marginTop:6, marginBottom:6, marginRight:6, verticalAlign: "middle", color:"#c7c7c7"}}>cancel</FontIcon>
                <h3 className="inline align-middle">Block</h3>
              </div>
              <p>
                De-authorize this device and block it from making authorization requests in the future.
              </p>
              <RaisedButton onClick={this._blockDevice.bind(null, true)} className="margin-top-small" secondary={true} label={"Block device"} icon={<FontIcon style={{marginTop:"-4px"}} className="material-icons">cancel</FontIcon>} />
            </div>
          </div>
          <div className="split-dialog left-border">
            <div className="align-center">
              <div>
                <FontIcon className="material-icons" style={{marginTop:6, marginBottom:6, marginRight:6, verticalAlign: "middle", color:"#c7c7c7"}}>delete_forever</FontIcon>
                <h3 className="inline align-middle">Decommission</h3>
              </div>
              <p>
                Decommission this device and remove all device data. This action is not reversible.
              </p>
              <RaisedButton onClick={this._decommissionDevice} className="margin-top-small" secondary={true} label={"Decommission device"} icon={<FontIcon style={{marginTop:"-4px"}} className="material-icons">delete_forever</FontIcon>} />
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
});

Devices.contextTypes = {
  router: PropTypes.object
};

module.exports = Devices;
