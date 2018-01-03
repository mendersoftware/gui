import React from 'react';
import { Router, Link } from 'react-router';
import Time from 'react-time';
import Collapse from 'react-collapse';
var createReactClass = require('create-react-class');
import ReactTooltip from 'react-tooltip';

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

var SelectedDevices = createReactClass({
  getInitialState: function() {
    return {
      showInput: false,
      selectedGroup: {
        payload: '',
        text: ''
      },
      schedule: false,
    };
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
      devices: [this.props.device.id],
      name: this.props.device.id,
      artifact_name: this.state.artifact.name
    }
    var callback = {
      success: function() {
        AppActions.setSnackbar("Deployment created successfully. Redirecting...");
        var params = {};
        params.route="deployments";
        setTimeout(function() {
          self.props.redirect(params);
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
  _handleBlock: function(remove) {
    // if previously rejected, set 'remove' to true in order for device to be handled by devauth api
    // otherwise, handled by devadmn api
    this.props.block(this.props.device, remove);
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
      <div key="id_checksum">
        <ListItem style={this.props.styles.listStyle} disabled={true} primaryText="ID" secondaryText={(this.props.device || {}).id || ''} secondaryTextLines={2} className="break-word" />
        <Divider />
      </div>
    );

    if ((this.props.device || {}).id_data) {
      var length = Object.keys(this.props.device.id_data).length;
      for (var k in this.props.device.id_data) {
        var idx = Object.keys(this.props.device.id_data).indexOf(k); // use idx to tell whether or not to show divider line afterwards
        deviceIdentity.push(
          <div key={k}>
            <ListItem style={this.props.styles.listStyle} disabled={true} primaryText={k} secondaryText={ this.props.device.id_data[k]} />
            { (this.props.device.created_ts || (idx<length-1) ) ? <Divider /> : null}
          </div>
        );
        i++;
      };
    }

    if ((this.props.device || {}).created_ts) {
      deviceIdentity.push(
        <div key="connectionTime">
          <ListItem style={this.props.styles.listStyle} disabled={true} primaryText="First connection time" secondaryText={<div><Time value={this.props.device.created_ts} format="YYYY-MM-DD HH:mm" /></div>} />
        </div>
      );
    }

    var deviceInventory = [];
    var createDeployment;

    var status = this.props.device.auth_sets ? this.props.device.auth_sets[0].status : "";

    if (typeof this.props.device.attributes !== 'undefined' && this.props.device.attributes.length>0) {
      var sortedAttributes = this.props.device.attributes.sort(function (a, b) {
          return a.name.localeCompare( b.name );
      });
      for (var i=0;i<sortedAttributes.length;i++) {
        var secondaryText = (sortedAttributes[i].value instanceof Array) ? sortedAttributes[i].value.toString() : sortedAttributes[i].value;
        var secondaryTextLines = (sortedAttributes[i].value instanceof Array) ? 2 : 1;
        deviceInventory.push(
          <div key={i}>
            <ListItem style={this.props.styles.listStyle} disabled={true} primaryText={sortedAttributes[i].name} secondaryText={secondaryText} secondaryTextLines={secondaryTextLines} />
            <Divider />
          </div>
        );
      };

      createDeployment = (
        <div key="updateButton">
          <ListItem
            className={status === "accepted" ? null : "hidden"}
            style={this.props.styles.listStyle}
            primaryText="Create a deployment for this device"
            onClick={this._clickListItem}
            leftIcon={<FontIcon style={{marginTop:6, marginBottom:6}} className="material-icons update">replay</FontIcon>} />
            <Divider />
        </div>
      );

    } else {
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

    var reauthButton = (
      <div key="reauthButton">
        <ListItem
          style={this.props.styles.listStyle}
          primaryText={"Authorization status: " + status}
          secondaryText="Authorize this device?"
          onClick={this._handleAccept.bind(null, true)}
          leftIcon={<FontIcon className="material-icons red auth" style={{marginTop:6, marginBottom:6}}>cancel</FontIcon>} />
         <Divider />
      </div>
    );

    var deviceInventory2 = [];
    if (deviceInventory.length > deviceIdentity.length) {
      deviceInventory2 = deviceInventory.splice((deviceInventory.length/2)+(deviceInventory.length%2)+1,deviceInventory.length);
    }

    var decommission = (
      <div key="decommissionButton">
        <ListItem
          style={this.props.styles.listStyle}
          primaryText={status === "accepted" ? "Reject or decommission this device" : "Decommission this device"}
          onClick={this._handleBlock.bind(null, true)}
          leftIcon={<FontIcon className="material-icons auth" style={{marginTop:6, marginBottom:6}}>block</FontIcon>} />
        <Divider />
      </div>
    );

    var deviceInfo = (
      <div key="deviceinfo">
        <div id="device-identity" className="report-list">
          <h4 className="margin-bottom-none">Device identity</h4>
          <List>
            {deviceIdentity}
          </List>
        </div>

        <div className={this.props.unauthorized ? "hidden" : "report-list"} >
          <h4 className="margin-bottom-none">Device inventory</h4>
          <List>
            {deviceInventory}
          </List>
        </div>

        <div className={this.props.unauthorized ? "hidden" : "report-list"} >
          <List style={{marginTop:"34px"}}>
            {deviceInventory2}
            {status !== "accepted" ? reauthButton : null}
            {decommission}
            {createDeployment}
          </List>
        </div>

        <div className={this.props.unauthorized ? "report-list" : "hidden"}>
          <List style={{marginTop:"-8px"}}>
            <ListItem
              onClick={this._handleAccept}
              disabled={this.props.disabled}
              style={this.props.styles.listStyle}
              innerDivStyle={this.props.disabled ? {color: "#c7c7c7", marginTop:"12px", marginBottom:"12px"} : null}
              primaryText="Authorize device"
              leftIcon={<FontIcon className={this.props.disabled ? "material-icons auth" : "material-icons green auth"} style={{marginTop:6, marginBottom:6}}>check_circle</FontIcon>} />
            <Divider />
            <ListItem
              style={this.props.styles.listStyle}
              primaryText="Reject device"
              onClick={this._handleBlock.bind(null, false)}
              leftIcon={<FontIcon className="material-icons red auth" style={{marginTop:6, marginBottom:6}}>cancel</FontIcon>} />
          </List>
        </div>

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
          <ScheduleForm deploymentDevices={[this.props.device]} filteredDevices={this.state.filterByArtifact} deploymentSettings={this._deploymentParams} artifact={this.state.artifact} artifacts={this.props.artifacts} device={this.props.device} deploymentSchedule={this._updateParams} groups={this.props.groups} />

        </Dialog>

      </div>
    );
  }
});

module.exports = SelectedDevices;
