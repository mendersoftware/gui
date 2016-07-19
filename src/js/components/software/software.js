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
    AppActions.getImages(function() {
      this.setState({doneLoading: true});
    }.bind(this));
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
    var image_link = (
      <span>
        Download latest image 
        <a href='https://s3-eu-west-1.amazonaws.com/yocto-builds/latest/latest.tar.gz' target='_blank'> here </a>
         and upload the image file to the Mender server
      </span>
    );
    var message = this.state.uploadTODO ? "Deploy the new image to your devices" : image_link;
    return (
      <div className="contentContainer">
        <div className={this.state.updateTODO ? "hidden" : null}>
          <div className="margin-bottom onboard">
            <div className="close" onClick={this._setStorage.bind(null, "updateTODO", true)}/>
            <h3><span className="todo">//TODO:</span> {message}</h3>
            <Link className={this.state.uploadTODO ? "todo link" : "hidden"} to="/deployments">> Go to deployments</Link>
          </div>
        </div>
        <div className="relative overflow-hidden">
          <Repository loading={!this.state.doneLoading} setStorage={this._setStorage} selected={this.state.selected} software={this.state.software} groups={this.state.groups} />
        </div>
      </div>
    );
  }
});

module.exports = Software;