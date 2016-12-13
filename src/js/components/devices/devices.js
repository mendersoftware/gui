import React from 'react';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var update = require('react-addons-update');

var Groups = require('./groups');
var DeviceList = require('./devicelist');
var Unauthorized = require('./unauthorized');
var DevicePicker = require('./devicepicker');

var Pagination = require('rc-pagination');
var Loader = require('../common/loader');
require('../common/prototype/Array.prototype.equals');

import Snackbar from 'material-ui/Snackbar';

import { Router, Route, Link } from 'react-router';

function getState() {
  return {
    groups: AppStore.getGroups(),
    groupsForList: AppStore.getGroups(),
    selectedGroup: AppStore.getSelectedGroup(),
    pendingDevices: AppStore.getPendingDevices(),
    selectedDevices: AppStore.getSelectedDevices(),
    filters: AppStore.getFilters(),
    attributes: AppStore.getAttributes(),
    artifacts: AppStore.getArtifactsRepo(),
    snackbar: AppStore.getSnackbar(),
    devices: AppStore.getGroupDevices(),
    totalDevices: AppStore.getTotalDevices()
  }
}

var Devices = React.createClass({
  getInitialState: function() {
    return getState();
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  componentDidMount: function() {
    this.setState({doneLoading:false});
    this.deviceTimer = setInterval(this._refreshDevices, 10000);
    this.admissionTimer = setInterval(this._refreshAdmissions, 60000);
    this._refreshAll();
  },
  _refreshAll: function() {
    this._refreshAdmissions();
    this._refreshDevices();
    this._refreshGroups();

    AppActions.getArtifacts({
      success: function(artifacts) {
        this.setState({artifacts:artifacts})
      }.bind(this)
    });

    var filters = [];
    if (this.props.params) {
      if (this.props.params.group) {
        AppActions.selectGroup(this.props.params.group);
        this.setState({selectedGroup:this.props.params.group});
      }
      if (this.props.params.filters) {
        var str = decodeURIComponent(this.props.params.filters);
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
    clearInterval(this.deviceTimer);
    AppStore.removeChangeListener(this._onChange);
    AppActions.selectGroup(null);
    this._updateFilters([{key:'', value:''}]);
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.selectedGroup !== this.state.selectedGroup) {
      clearInterval(this.deviceTimer);
      this._refreshGroups();
      this._refreshDevices(1);
      this.deviceTimer = setInterval(this._refreshDevices, 10000);
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
        this.setState({doneLoading:true, devices: devices, devLoading:false});
        AppActions.setSnackbar("");
      }.bind(this),
      error: function(err) {
        this.setState({doneLoading:true, devLoading:false, devices:[]});
        console.log(err);
        var errormsg = err.error || "Please check your connection";
        AppActions.setSnackbar("Devices couldn't be loaded. " +errormsg);
      }.bind(this)
    };

    var groupCallback = {
      success: function(deviceList, links) {
        getDevicesFromIDs(deviceList, function(devices) {
          AppActions.setGroupDevices(devices);
          self.setState({doneLoading:true, devices:devices, devLoading:false});
          AppActions.setSnackbar("");
        });
      }.bind(this),
      error: function(err) {
        this.setState({doneLoading:true, devLoading:false, devices:[]});
        console.log(err);
        var errormsg = err.error || "Please check your connection";
        AppActions.setSnackbar("Devices couldn't be loaded. " +errormsg);
      }.bind(this)
    };

    function getDevicesFromIDs(list, callback) {
      var devices = [];
      var idx = 0;
      for (var i=0;i<list.length;i++) {
        AppActions.getDeviceById(list[i], {
          success: function(device) {
            idx++;
            devices.push(device);
            if (idx===list.length) { callback(devices); }
          },
          error: function(err) {
            console.log(err);
          }
        });
      }
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

    AppActions.getDevicesForAdmission(function(devices, links) {
      self.setState({pendingDevices: devices, authLoading:false});
    }, pageNo, perPage);
  },
  _refreshGroups: function() {
    var callback = {
      success: function (groups) {
        this.setState({groups: groups});
      }.bind(this),
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
    this.setState({currentPage: pageNo, devLoading:true}, this._refreshDevices(pageNo));
    this.deviceTimer = setInterval(this._refreshDevices, 10000);
  },
  _handleAdmPageChange: function(pageNo) {
    clearInterval(this.admissionTimer);
    this.setState({currentAdmPage: pageNo, authLoading:true}, this._refreshAdmissions(pageNo));
    this.admissionTimer = setInterval(this._refreshAdmissions, 60000);
  },
  _handleGroupChange: function(group) {
    this.setState({currentPage: 1, doneLoading:false}, AppActions.selectGroup(group));
  },
  _handleGroupDialog: function () {
    this.setState({openGroupDialog: !this.state.openGroupDialog, selectedDevices: []});
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
    AppActions.getDevices(callback, 1, per, searchterm);
  },
  render: function() {
    return (
      <div className="margin-top">
       <div className="leftFixed">
          <Groups
            openGroupDialog={this._handleGroupDialog}
            changeGroup={this._handleGroupChange}
            groupList={this.state.groups}
            selectedGroup={this.state.selectedGroup}
            allDevices={this.state.allDevices}
            totalDevices={this.state.totalDevices} />
        </div>
        <div className="rightFluid padding-right">
          <div className={this.state.pendingDevices.length ? "fadeIn onboard" : "hidden"}>
            <Unauthorized showLoader={this._showLoader} refresh={this._refreshDevices} refreshAdmissions={this._refreshAdmissions} pending={this.state.pendingDevices} />
            <div>
              {this.state.totalAdmDevices ? <Pagination simple pageSize={20} current={this.state.currentAdmPage || 1} total={this.state.totalAdmDevices} onChange={this._handleAdmPageChange} /> : null }
             
              {this.state.authLoading ?  <div className="smallLoaderContainer"><Loader show={true} /></div> : null}
            </div>
          </div>
          <Loader show={!this.state.doneLoading} />
          <DeviceList 
            redirect={this._redirect}
            refreshDevices={this._refreshDevices}
            refreshGroups={this._refreshGroups}
            selectedField={this.state.selectedField}
            changeSelect={this._changeTmpGroup}
            addGroup={this._addTmpGroup}
            filters={this.state.filters}
            attributes={this.state.attributes}
            onFilterChange={this._updateFilters}
            artifacts={this.state.artifacts}
            loading={this.state.devLoading}
            selectedDevices={this.state.selectedDevices}
            groups={this.state.groupsForList}
            devices={this.state.devices || []}
            selectedGroup={this.state.selectedGroup} />
            {this.state.totalDevices ? <Pagination simple pageSize={20} current={this.state.currentPage || 1} total={this.state.numDevices} onChange={this._handlePageChange} /> : null }
            {this.state.devLoading ?  <div className="smallLoaderContainer"><Loader show={true} /></div> : null}
        </div>
        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          autoHideDuration={5000}
          onRequestClose={this.handleRequestClose}
        />
        <DevicePicker
          open={this.state.openGroupDialog || false}
          refreshGroups={this._refreshGroups}
          selectedDevices={this.state.selectedDevices}
          pickerDevices={this.state.pickerDevices || []}
          groupList={this.state.groups}
          toggleDialog={this._handleGroupDialog}
          getPickerDevices={this._handlePickerRequest}
          hasNext={this.state.hasNextPicker}
          changeGroup={this._handleGroupChange}
          loadingDevices={this.state.pickerLoading}
        />
      </div>
    );
  }
});

Devices.contextTypes = {
  router: React.PropTypes.object
};

module.exports = Devices;
