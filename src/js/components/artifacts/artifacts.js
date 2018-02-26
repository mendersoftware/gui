import React from 'react';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var Repository = require('./repository.js');
var createReactClass = require('create-react-class');

import { Router, Route, Link } from 'react-router';
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
import Snackbar from 'material-ui/Snackbar';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

import { preformatWithRequestID } from '../../helpers.js'

function getState() {
  return {
    artifacts: AppStore.getArtifactsRepo(),
    selected: null,
    snackbar: AppStore.getSnackbar(),
    remove: false,
    refreshArtifactsLength: 60000,
    showHelptips: AppStore.showHelptips(),
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
    clearAllRetryTimers();
    this.artifactTimer = setInterval(this._getArtifacts, this.state.refreshArtifactsLength);
    this._getArtifacts();
  },
  componentWillUnmount: function() {
    clearAllRetryTimers();
    clearInterval(this.artifactTimer);
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
    var self = this;
    var callback = {
      success: function(artifacts) {
        clearRetryTimer("artifacts");
        setTimeout(function() {
          self.setState({doneLoading: true, artifacts:artifacts});
        }, 300);
        setTimeout(function() {
          AppActions.setSnackbar("");
        }, 4000);
      },
      error: function(err) {
        var errormsg = err.error || "Please check your connection";
        setRetryTimer(err, "artifacts", "Artifacts couldn't be loaded. " + errormsg, self.state.refreshArtifactsLength);
      }
    };
    AppActions.getArtifacts(callback);
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
        var errMsg = err.res.body.error || ""
        AppActions.setSnackbar(preformatWithRequestID(err.res, "Error removing artifact: " + errMsg));
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
      <div>
        <Repository showHelptips={this.state.showHelptips} removeArtifact={this._removeDialog} refreshArtifacts={this._getArtifacts} startLoader={this._startLoading} loading={!this.state.doneLoading} selected={this.state.selected} artifacts={this.state.artifacts} />

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
          bodyStyle={{maxWidth: this.state.snackbar.maxWidth}}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
});

module.exports = Artifacts;
