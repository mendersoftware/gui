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
    hideTODO: localStorage.getItem("hideTODO"),
    groupTODO: localStorage.getItem("groupNextStep"),
    authTODO: localStorage.getItem("authStep")
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
    this.setState({hideTODO: true});
    AppActions.setLocalStorage("hideTODO", true);
  },
  _onChange: function() {

    if (!this.state.groupTODO) {
      if (this.state.groups[1]) {
        if (this.state.groups[1].devices.length===2) {
          setTimeout(function() {
            // avoid dispatcher clash
            AppActions.setLocalStorage("groupNextStep", true);
          },1);
        }
      }
    }

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
          <div className={this.state.hideTODO ? "hidden" : null}>
            <div className={this.state.unauthorized.length || !this.state.groupTODO ? "hidden" : null}>
              <div className="margin-top margin-bottom onboard">
                <div className="close" onClick={this._closeOnboard}/>
                <h3><span className="todo">//TODO</span> Upload a new software image</h3>
                <Link to="/software" className="todo link">> Go to software</Link>
              </div>
            </div>
            <div className={this.state.groupTODO || this.state.unauthorized.length ? "hidden" : null}>
              <div className="margin-top margin-bottom onboard">
                <div className="close" onClick={this._closeOnboard}/>
                <h3><span className="todo">//TODO</span> Create a new group with these devices</h3>
              </div>
            </div>
           <div className={!this.state.authTODO && this.state.unauthorized.length ? null : "hidden" }>
              <div className="margin-top margin-bottom onboard">
                <div className="close" onClick={this._closeOnboard}/>
                <h3><span className="todo">//TODO</span> Authorize the 2 pending devices</h3>
              </div>
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