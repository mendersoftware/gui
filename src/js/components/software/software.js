import React from 'react';
var AppStore = require('../../stores/app-store');
var LocalStore = require('../../stores/local-store');
var AppActions = require('../../actions/app-actions');
var Repository = require('./repository.js');

import { Router, Route, Link } from 'react-router';
import Snackbar from 'material-ui/Snackbar';

function getState() {
  return {
    software: AppStore.getSoftwareRepo(),
    groups: AppStore.getGroups(),
    selected: null,
    snackbar: AppStore.getSnackbar()
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
        var errormsg = err || "Please check your connection";
        AppActions.setSnackbar("Images couldn't be loaded. " +errormsg);
        this.setState({doneLoading: true});
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

module.exports = Software;