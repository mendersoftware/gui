import React from 'react';
var AppStore = require('../../stores/app-store');
var LocalStore = require('../../stores/local-store');
var AppActions = require('../../actions/app-actions');
var Repository = require('./repository.js');

import { Router, Route, Link } from 'react-router';
import Snackbar from 'material-ui/Snackbar';

function getState() {
  return {
    artifacts: AppStore.getArtifactsRepo(),
    groups: AppStore.getGroups(),
    selected: null,
    snackbar: AppStore.getSnackbar()
  }
}

var Artifacts = React.createClass({
  getInitialState: function() {
    return getState()
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  componentDidMount: function() {
    this._getArtifacts();
    this._getGroups();
    this._getDevices();
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
      if (this.props.params.artifactVersion) {
        // selected artifacts
        var artifact = AppStore.getSoftwareArtifact("name", this.props.params.artifactVersion);
        this.setState({selected: artifact});
      }
    }
  },
  _startLoading: function(bool) {
     this.setState({doneLoading: !bool});
  },
  _getArtifacts: function() {
    var callback = {
      success: function(artifacts) {
        setTimeout(function() {
          this.setState({doneLoading: true, artifacts:artifacts});
        }.bind(this), 300);
      }.bind(this),
      error: function(err) {
        var errormsg = err || "Please check your connection";
        AppActions.setSnackbar("Artifacts couldn't be loaded. " +errormsg);
        this.setState({doneLoading: true});
      }.bind(this)
    };
    AppActions.getArtifacts(callback);
  },
  _getGroups: function() {
    var callback = {
      success: function (groups) {
        this.setState({groups: groups});
        this._getGroupDevices(groups);
      }.bind(this),
      error: function(err) {
        console.log(err);
      }
    };
    AppActions.getGroups(callback);
  },
  _getDevices: function() {
    AppActions.getDevices({
      success: function(devices) {
        if (!devices.length) {
          AppActions.getNumberOfDevicesForAdmission(function(count) {
            if (count) {
              this.setState({hasPending:true});
            }
          }.bind(this));
        } else {
          var allDevices = [];
          for (var i=0; i<devices.length;i++) {
            allDevices.push(devices[i]);
          }
          this.setState({hasDevices:true, allDevices: allDevices});
        }
      }.bind(this),
      error: function(err) {
        console.log("Error: " +err);
      }
    });
  },
  _getGroupDevices: function(groups) {
    // get list of devices for each group and save them to state 
    var i, group;
    var callback = {
      success: function(devices) {
        var tmp = {};
        var devs = [];
        for (var x=0;x<devices.length;x++) {
          // get full details, not just id
          devs.push(AppStore.getSingleDevice(devices[x]));
        }
        tmp[group] = devs;
        this.setState({groupDevices:tmp});
      }.bind(this)
    }
    for (i=0;i<groups.length;i++) {
      group = groups[i];
      AppActions.getGroupDevices(groups[i], callback);
    }
  },
  render: function() {
    var artifact_link = (
      <span>
        Download latest artifact 
        <a href='https://s3-eu-west-1.amazonaws.com/yocto-builds/latest/latest.tar.gz' target='_blank'> here </a>
         and upload the artifact file to the Mender server
      </span>
    );
    
    return (
      <div className="contentContainer">
        <div className="relative overflow-hidden">
          <Repository groupDevices={this.state.groupDevices} allDevices={this.state.allDevices} refreshArtifacts={this._getArtifacts} startLoader={this._startLoading} loading={!this.state.doneLoading} setStorage={this._setStorage} selected={this.state.selected} artifacts={this.state.artifacts} groups={this.state.groups} hasPending={this.state.hasPending} hasDevices={this.state.hasDevices} />
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

module.exports = Artifacts;