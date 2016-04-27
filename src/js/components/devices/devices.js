import React from 'react';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

var Groups = require('./groups');
var DeviceList = require('./devicelist');
var Unauthorized = require('./unauthorized');

import { Router, Route, Link } from 'react-router';

function getState() {
  return {
    groups: AppStore.getGroups(),
    selectedGroup: AppStore.getSelectedGroup(),
    devices: AppStore.getDevices(),
    allDevices: AppStore.getAllDevices(),
    selectedDevices: AppStore.getSelectedDevices(),
    filters: AppStore.getFilters(),
    attributes: AppStore.getAttributes(),
    images: AppStore.getSoftwareRepo(),
    unauthorized: AppStore.getUnauthorized(),
    hideTODO: localStorage.getItem("devicesNextStep"),
  }
}

var Devices = React.createClass({
  getInitialState: function() {
    return getState()
  },
  componentWillMount: function() {
    AppActions.getImages();
    AppStore.changeListener(this._onChange);
    var filters = [];
    if (this.props.params) {
      if (this.props.params.groupId) {
        AppActions.selectGroup(Number(this.props.params.groupId));
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
  componentDidMount: function() {
    //AppActions.getAuthorized();
    //AppActions.getDevices();
  },
  _closeOnboard: function() {
    AppActions.setLocalStorage("devicesNextStep", true);
  },
  _onChange: function() {
    this.setState(getState());
  },
  _updateFilters: function(filters) {
    AppActions.updateFilters(filters);
  },
  render: function() {
    return (
      <div className="margin-top">
       <div className="leftFixed">
          <Groups groups={this.state.groups} selectedGroup={this.state.selectedGroup} allDevices={this.state.allDevices} />
        </div>
        <div className="rightFluid padding-right">
          <div className={this.state.hideTODO || this.state.unauthorized.length ? "hidden" : null}>
            <div className="margin-top margin-bottom onboard">
              <div className="close" onClick={this._closeOnboard}/>
              <h3>//TODO Upload a new software image</h3>
              <Link to="/software" className="float-right">Go to software</Link>
            </div>
          </div>
          <div className={this.state.unauthorized.length ? null : "hidden"}>
            <Unauthorized unauthorized={this.state.unauthorized} />
          </div>
          <DeviceList filters={this.state.filters} attributes={this.state.attributes} onFilterChange={this._updateFilters} images={this.state.images} selectedDevices={this.state.selectedDevices} groups={this.state.groups} devices={this.state.devices} selectedGroup={this.state.selectedGroup} />
        </div>
      </div>
    );
  }
});

module.exports = Devices;