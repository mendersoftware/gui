import React from 'react';
var AppStore = require('../../stores/app-store');
var LocalStore = require('../../stores/local-store');
var AppActions = require('../../actions/app-actions');
var Repository = require('./repository.js');

import { Router, Route, Link } from 'react-router';

function getState() {
  return {
    software: AppStore.getSoftwareRepo(),
    groups: AppStore.getGroups(),
    uploadTODO: localStorage.getItem("uploaded04"),
    updateTODO: localStorage.getItem("updateTODO"),
    selected: null,
  }
}

var Software = React.createClass({
  getInitialState: function() {
    return getState()
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  componentDidMount: function() {
    AppActions.getImages();
  },
  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },
  _setStorage: function(key, value) {
    AppActions.setLocalStorage(key, value);
  },
  _onChange: function() {
    this.setState(getState());

    if (this.props.params) {
      if (this.props.params.softwareVersion) {
        // selected software
        var image = AppStore.getSoftwareImage("name", this.props.params.softwareVersion);
        this.setState({selected: image});
      }
    }
  },
  render: function() {
    var message = this.state.uploadTODO ? "//TODO Deploy the new image to all devices" : "//TODO Upload Version 0.4 from /folder1/folder2/menderQemuv04.tar.gz" ;
    return (
      <div className="contentContainer">
        <div className={this.state.updateTODO ? "hidden" : null}>
          <div className="margin-bottom onboard">
            <div className="close" onClick={this._setStorage.bind(null, "updateTODO", true)}/>
            <h3>{message}</h3>
            <Link className={this.state.uploadTODO ? "float-right margin-right" : "hidden"} to="/updates">Go to updates</Link>
          </div>
        </div>
        <div className="relative overflow-hidden">
          <Repository setStorage={this._setStorage} selected={this.state.selected} software={this.state.software} groups={this.state.groups} />
        </div>
      </div>
    );
  }
});

module.exports = Software;