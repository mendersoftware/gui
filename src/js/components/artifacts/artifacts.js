import React from 'react';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var Repository = require('./repository.js');
var createReactClass = require('create-react-class');

import { Router, Route, Link } from 'react-router';
import Snackbar from 'material-ui/Snackbar';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

function getState() {
  return {
    artifacts: AppStore.getArtifactsRepo(),
    groups: AppStore.getGroups(),
    selected: null,
    snackbar: AppStore.getSnackbar(),
    remove: false
  }
}

var Artifacts = createReactClass({
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
  _removeDialog: function(artifact) {
    AppActions.setSnackbar("");
    if (artifact) {
      this.setState({remove: true, artifact: artifact});
    } else {
      this.setState({remove: false, artifact: null});
    }
  },
  _removeArtifact: function() {
    var self = this;
    var callback =  {
      success: function() {
        AppActions.setSnackbar("Artifact was removed");
        self._getArtifacts();
      },
      error: function(err) {
        AppActions.setSnackbar("Error removing artifact: " + err.error);
      }
    };   
    AppActions.removeArtifact(self.state.artifact.id, callback);
  },
  render: function() {
    var artifact_link = (
      <span>
        Download latest artifact 
        <a href='https://s3-eu-west-1.amazonaws.com/yocto-builds/latest/latest.tar.gz' target='_blank'> here </a>
         and upload the artifact file to the Mender server
      </span>
    );

    var removeActions = [
     <div style={{marginRight:"10px", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this._removeDialog.bind(null, null)} />
      </div>,
      <RaisedButton
        label="Remove artifact"
        secondary={true}
        onClick={this._removeArtifact} />
    ];
    
    return (
      <div className="contentContainer">
        <div className="relative">
          <Repository removeArtifact={this._removeDialog} groupDevices={this.state.groupDevices} allDevices={this.state.allDevices} refreshArtifacts={this._getArtifacts} startLoader={this._startLoading} loading={!this.state.doneLoading} selected={this.state.selected} artifacts={this.state.artifacts} groups={this.state.groups} hasPending={this.state.hasPending} hasDevices={this.state.hasDevices} />
        </div>

        <Dialog
          open={this.state.remove}
          title="Remove this artifact?"
          actions={removeActions}
        >
        Are you sure you want to remove <i>{(this.state.artifact||{}).name}</i>?
        </Dialog>

        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          autoHideDuration={8000}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
});

module.exports = Artifacts;