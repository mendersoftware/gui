import React from 'react';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var update = require('react-addons-update');

var Groups = require('./groups');
var DeviceList = require('./devicelist');
var Unauthorized = require('./unauthorized');

import Snackbar from 'material-ui/Snackbar';

import { Router, Route, Link } from 'react-router';

function getState() {
  return {
    groups: AppStore.getGroups(),
    groupsForList: AppStore.getGroups(),
    selectedGroup: AppStore.getSelectedGroup(),
    pendingDevices: AppStore.getPendingDevices(),
    devices: AppStore.getGroupDevices(),
    allDevices: AppStore.getAllDevices(),
    selectedDevices: AppStore.getSelectedDevices(),
    filters: AppStore.getFilters(),
    attributes: AppStore.getAttributes(),
    images: AppStore.getSoftwareRepo(),
    snackbar: AppStore.getSnackbar()
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
    this._refreshAdmissions();
    this._refreshDevices();
    this._refreshGroups();

    AppActions.getImages({
      success: function(images) {
        this.setState({images:images})
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
    AppStore.removeChangeListener(this._onChange);
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.selectedGroup != this.state.selectedGroup) this._refreshDevices();
  },
  _onChange: function() {
    this.setState(this.getInitialState());
  },
  _refreshDevices: function() {
    var callback = {
      success: function(devices) {
        this.setState({devices:  AppStore.getGroupDevices()});
        AppActions.setSnackbar("");
        setTimeout(function() {
          this.setState({doneLoading:true});
        }.bind(this), 300);
      }.bind(this),
      error: function(err) {
        this.setState({doneLoading:true, devices:[]});
        console.log(err);
        var errormsg = err.error || "Please check your connection";
        AppActions.setSnackbar("Devices couldn't be loaded. " +errormsg);
      }.bind(this)
    };
    this.setState({doneLoading:false});
    if (!this.state.selectedGroup) {
      AppActions.getDevices(callback);
    } else {
      AppActions.getGroupDevices(this.state.selectedGroup, callback);
    }
    
  },
  _refreshAdmissions: function() {
    AppActions.getDevicesForAdmission(function(devices) {
      var pending = [];
      for (var i=0;i<devices.length;i++) {
        if (devices[i].status === "pending") {
          pending.push(devices[i]);
        }
      }
      this.setState({pendingDevices: pending });
    }.bind(this));
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
  _handleSelectDevice: function(device) {
    console.log(device);
  },
  render: function() {
    return (
      <div className="margin-top">
       <div className="leftFixed">
          <Groups groups={this.state.groups} selectedGroup={this.state.selectedGroup} allDevices={this.state.allDevices} />
        </div>
        <div className="rightFluid padding-right">
          <div className={this.state.pendingDevices.length&&this.state.doneLoading ? null : "hidden"}>
            <Unauthorized refresh={this._refreshDevices} refreshAdmissions={this._refreshAdmissions} pending={this.state.pendingDevices} />
          </div>
          <DeviceList refreshGroups={this._refreshGroups} selectedField={this.state.selectedField} changeSelect={this._changeTmpGroup} addGroup={this._addTmpGroup} loading={!this.state.doneLoading} selectedDevice={this._handleSelectDevice} filters={this.state.filters} attributes={this.state.attributes} onFilterChange={this._updateFilters} images={this.state.images} selectedDevices={this.state.selectedDevices} groups={this.state.groupsForList} devices={this.state.devices} selectedGroup={this.state.selectedGroup} />
        </div>
        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          autoHideDuration={5000}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
});

module.exports = Devices;