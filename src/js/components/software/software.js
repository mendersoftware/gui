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
   this._getImages();
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
  _startLoading: function() {
     this.setState({doneLoading: false});
  },
  _getImages: function() {
    var callback = {
      success: function(images) {
        setTimeout(function() {
          this.setState({doneLoading: true, software:images});
        }.bind(this), 300);
      }.bind(this),
      error: function(err) {
        setTimeout(function() {
          this.setState({doneLoading: true});
        }.bind(this), 300);
      }.bind(this)
    };
    AppActions.getImages(callback);
  },
  render: function() {
    var image_link = (
      <span>
        Download latest image 
        <a href='https://s3-eu-west-1.amazonaws.com/yocto-builds/latest/latest.tar.gz' target='_blank'> here </a>
         and upload the image file to the Mender server
      </span>
    );
    
    return (
      <div className="contentContainer">
        <div className="relative overflow-hidden">
          <Repository refreshImages={this._getImages} startLoader={this._startLoading} loading={!this.state.doneLoading} setStorage={this._setStorage} selected={this.state.selected} software={this.state.software} groups={this.state.groups} />
        </div>
      </div>
    );
  }
});

module.exports = Software;