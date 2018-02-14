import React from 'react';
import { Router, Link } from 'react-router';
import Time from 'react-time';
import Collapse from 'react-collapse';
var createReactClass = require('create-react-class');
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';

var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var ScheduleForm = require('../deployments/scheduleform');
var Loader = require('../common/loader');


import { List, ListItem } from 'material-ui/List';
import FontIcon from 'material-ui/FontIcon';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';

import { preformatWithRequestID } from '../../helpers';

function getGroups() {
  var copy = AppStore.getGroups().slice();
  return copy
}

var ExpandedDevice = createReactClass({
  getInitialState: function() {
    return {
      showInput: false,
      selectedGroup: {
        payload: '',
        text: ''
      },
      schedule: false,
      artifacts: AppStore.getArtifactsRepo(),
    };
  },

  componentDidMount: function() {
    this._getArtifacts();
  },

  _getArtifacts: function() {
    var self = this;
    var callback = {
      success: function(artifacts) {
        
        setTimeout(function() {
          self.setState({artifacts:artifacts});
        }, 300);
      },
      error: function(err) {
        var errormsg = err.error || "Please check your connection";
      }
    };
    AppActions.getArtifacts(callback);
  },

  dialogToggle: function (ref) {
    var state = {};
    state[ref] = !this.state[ref];
    this.setState(state);
    this.setState({filterByArtifact:null, artifact:null});
  },

  _updateParams: function(val, attr) {
    // updating params from child schedule form
    var tmp = {};
    tmp[attr] = val;
    this.setState(tmp);
  },

  _clickListItem: function() {
    AppActions.setSnackbar("");
    this.dialogToggle('schedule');
  },

  _onScheduleSubmit: function() {
    var self = this;
    var newDeployment = {
      devices: [this.props.device.device_id],
      name: this.props.device.device_id,
      artifact_name: this.state.artifact.name
    }
    var callback = {
      success: function() {
        AppActions.setSnackbar("Deployment created successfully. Redirecting...");
        var params = {};
        params.route="deployments";
        setTimeout(function() {
          self.context.router.push(params.route);
        }, 1200)
      },
      error: function(err) {
        try {
          var errMsg = err.res.body.error || ""
          AppActions.setSnackbar(preformatWithRequestID(err.res, "Error creating deployment. " + errMsg));
        } catch (e) {
          console.log(e)
        }
      }
    }
    AppActions.createDeployment(newDeployment, callback);
    this.dialogToggle('schedule');
  },
  _handleAccept: function(accept) {
    // if previously rejected, set 'accept' to true in order for device to be handled by devauth api
    // otherwise, handled by devadmn api
    if (!this.props.disabled) {
      this.props.accept([this.props.device], accept);
    }
  },
  _handleReject: function(status) {
    // if previously rejected, set 'remove' to true in order for device to be handled by devauth api
    // otherwise, handled by devadmn api
    this.props.rejectOrDecomm(this.props.device, status);
  },

  _handleStopProp: function(e) {
    e.stopPropagation();
  },

  _deploymentParams: function(val, attr) {
    // updating params from child schedule form
    var tmp = {};
    tmp[attr] = val;
    this.setState(tmp);

    // check that device type matches
    if (attr==='artifact') {
      var filteredDevs = null;
      for (var i = 0; i<val.device_types_compatible.length; i++) {
        if (val.device_types_compatible[i] === this.props.device_type) {
          filteredDevs = [this.props.device];
          break;
        }
      }
    }
    this.setState({filterByArtifact:filteredDevs});
  },
  _clickLink: function() {
    window.location.assign('https://docs.mender.io/client-configuration/configuration-file/polling-intervals');
  },
  render: function() {

    var deviceIdentity = [];
    deviceIdentity.push(
        <ListItem key="id_checksum" style={this.props.styles.listStyle} disabled={true} primaryText="ID" secondaryText={(this.props.device || {}).device_id || ''} secondaryTextLines={2} />
    );

    if ((this.props.device || {}).id_data) {
      var data = typeof this.props.device.id_data == "object" ? this.props.device.id_data : JSON.parse(this.props.device.id_data);
      for (var k in data) {
        deviceIdentity.push(
          <ListItem key={k} style={this.props.styles.listStyle} disabled={true} primaryText={k} secondaryText={ data[k] } />
        );
      };
    }

    if ((this.props.device || {}).request_time) {
      deviceIdentity.push(
        <div key="connectionTime">
          <ListItem style={this.props.styles.listStyle} disabled={true} primaryText="First connection time" secondaryText={<div><Time value={this.props.device.request_time} format="YYYY-MM-DD HH:mm" /></div>} />
        </div>
      );
    }

    var deviceInventory = [];

    var status = this.props.device.status;
    var waiting = false;
    if (typeof this.props.attrs !== 'undefined' && this.props.attrs.length>0) {

      var sortedAttributes = this.props.attrs.sort(function (a, b) {
          return a.name.localeCompare( b.name );
      });
      for (var i=0;i<sortedAttributes.length;i++) {
        var secondaryText = (sortedAttributes[i].value instanceof Array) ? sortedAttributes[i].value.toString() : sortedAttributes[i].value;
        var secondaryTextLines = (sortedAttributes[i].value instanceof Array) || (secondaryText.length>50 ) ? 2 : 1;
        deviceInventory.push(
          <div key={i}>
            <ListItem style={this.props.styles.listStyle} disabled={true} primaryText={sortedAttributes[i].name} secondaryText={secondaryText} secondaryTextLines={secondaryTextLines} />
            <Divider />
          </div>
        );
      };

    } else {
      waiting = true;
      deviceInventory.push(
        <div className="waiting-inventory" key="waiting-inventory">
          <div
            onClick={this._handleStopProp}
            id="inventory-info"
            className="tooltip info"
            style={{top:"8px", right:"8px"}}
            data-tip
            data-for='inventory-wait'
            data-event='click focus'>
            <FontIcon className="material-icons">info</FontIcon>
          </div>
          <ReactTooltip
            id="inventory-wait"
            globalEventOff='click'
            place="top"
            type="light"
            effect="solid"
            className="react-tooltip">
            <h3>Waiting for inventory data</h3>
            <p>Inventory data not yet received from the device - this can take up to 30 minutes with default installation.</p>
            <p>Also see the documentation for <a onClick={this._clickLink} href="https://docs.mender.io/Client-configuration/Polling-intervals">Polling intervals</a>.</p>
          </ReactTooltip>

          <p>Waiting for inventory data from the device</p>
          <Loader show={true} waiting={true} />
        </div>
      );
    }

    var reauthButton = (status === "rejected") ? (
      <ListItem
        key="reauthButton"
        style={this.props.styles.listButtonStyle}
        primaryText={"Authorization status: " + status}
        secondaryText="Authorize this device?"
        onClick={this._handleAccept.bind(null, true)}
        leftIcon={<FontIcon className="material-icons red" style={{margin: "12px 0 12px 12px"}}>cancel</FontIcon>} />
    ) : null;

    var deviceInventory2 = [];
    if (deviceInventory.length > deviceIdentity.length) {
      deviceInventory2 = deviceInventory.splice((deviceInventory.length/2)+(deviceInventory.length%2),deviceInventory.length);
    }

    var decommission = (status !== "pending") ? (
        <ListItem
          key="decommissionButton"
          style={this.props.styles.listButtonStyle}
          primaryText={"Authorization status: " + status}
          secondaryText={status === "accepted" ? "Reject or decommission this device?" : "Authorize or decommission this device?"}
          onClick={this._handleReject.bind(null, status)}
          leftIcon={<FontIcon className={status === "accepted" ? "material-icons green" : "material-icons"} style={{margin: "12px 0 12px 12px"}}>{status === "accepted" ? "check_circle" : "block" }</FontIcon>} />
    ) : null;
    deviceIdentity.push(decommission);


    var deviceInfo = (
      <div key="deviceinfo">
        <div id="device-identity" className="report-list">
          <h4 className="margin-bottom-none">Device identity</h4>
          <List className="list-horizontal-display">
            {deviceIdentity}
          </List>
        </div>

        <div id="device-inventory">
          <div className={this.props.unauthorized ? "hidden" : "report-list"} >
            <h4 className="margin-bottom-none">Device inventory</h4>
            <List>
              {deviceInventory}
            </List>
          </div>
    

          <div className={this.props.unauthorized ? "hidden" : "report-list"} >
            <List style={{marginTop:"34px"}}>
              {deviceInventory2}
            </List>
          </div>

        </div>

        { (status==="accepted" && !waiting) ? 
          (
            <div className="report-list">
              <List style={{marginTop:"24px", minWidth: "300px"}}>
                <ListItem
                key="updateButton"
                className={status === "accepted" ? null : "hidden"}
                style={this.props.styles.listButtonStyle}
                primaryText="Create a deployment for this device"
                onClick={this._clickListItem}
                leftIcon={<FontIcon className="material-icons update" style={{margin: "12px 0 12px 12px"}}>replay</FontIcon>} />
              </List>
            </div>
          ) : null
        }
      
      </div>
    );

    var scheduleActions =  [
      <div style={{marginRight:"10px", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this.dialogToggle.bind(null, 'schedule')} />
      </div>,
      <RaisedButton
        label="Create deployment"
        primary={true}
        disabled={!this.state.filterByArtifact}
        onClick={this._onScheduleSubmit}
        ref="save" />
    ];

    return (
      <div>
        {deviceInfo}

        <Dialog
          open={this.state.schedule}
          title='Create a deployment'
          actions={scheduleActions}
          autoDetectWindowHeight={true}
          bodyStyle={{paddingTop:"0", fontSize:"13px"}}
          contentStyle={{overflow:"hidden", boxShadow:"0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)"}}
          >
          <ScheduleForm deploymentDevices={[this.props.device]} filteredDevices={this.state.filterByArtifact} deploymentSettings={this._deploymentParams} artifact={this.state.artifact} artifacts={this.state.artifacts} device={this.props.device} deploymentSchedule={this._updateParams} groups={this.props.groups} />

        </Dialog>

      </div>
    );
  }
});

ExpandedDevice.contextTypes = {
  router: PropTypes.object
};

module.exports = ExpandedDevice;
