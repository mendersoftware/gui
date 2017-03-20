import React from 'react';
import { Router, Link } from 'react-router';
import Time from 'react-time';
import Collapse from 'react-collapse';
import { ShortSHA } from '../../helpers';

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
import IconButton from 'material-ui/IconButton';


var tooltip = {
  title: 'Waiting for inventory data',
  text: 'Inventory data not yet received from the device - this can take up to 30 minutes with default installation. <p>Also see the documentation for <a href="https://docs.mender.io/Client-configuration/Polling-intervals" target="_blank">Polling intervals</a>.</p>',
  selector: '#inventory-info',
  position: 'bottom-right',
  type: 'hover',
};

function getGroups() {
  var copy = AppStore.getGroups().slice();
  return copy
}

var SelectedDevices = React.createClass({
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

  componentDidMount: function() {
    this.props.addTooltip(tooltip);
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
      name: ShortSHA(this.props.device.id),
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
        AppActions.setSnackbar("Error creating deployment. " + err);
      }
    }
    AppActions.createDeployment(newDeployment, callback);
    this.dialogToggle('schedule');
  },
  _handleAccept: function() {
    this.props.accept(this.props.selected);
  },
  _handleBlock: function() {
    this.props.block(this.props.selected);
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
  render: function() {
   
    var styles = {
      listStyle: {
        fontSize: "12px",
        paddingTop: "10px",
        paddingBottom: "10px"
      }
    }

    var deviceIdentity = [];
    deviceIdentity.push(
      <div key="id_checksum">
        <ListItem style={styles.listStyle} disabled={true} primaryText="ID" secondaryText={this.props.deviceId} secondaryTextLines={2} className="break-word" />
        {i === length-1 ? null : <Divider />}
      </div>
    );

    var i = 0;
    if (this.props.attributes) {
      var length = Object.keys(this.props.attributes).length;
      for (var k in this.props.attributes) {
        deviceIdentity.push(
          <div key={k}>
            <ListItem style={styles.listStyle} disabled={true} primaryText={k} secondaryText={ this.props.attributes[k]} />
            { this.props.admittanceTime ? <Divider /> : null}
          </div>
        );
        i++;
      };
    }

    if (this.props.admittanceTime) {
      deviceIdentity.push(
        <div key="connectionTime">
          <ListItem style={styles.listStyle} disabled={true} primaryText="First connection time" secondaryText={<div><Time value={this.props.admittanceTime} format="YYYY-MM-DD HH:mm" /></div>} />
        </div>
      );
    }

    var deviceInventory = [];
    var i = 0;
    if (typeof this.props.device.attributes !== 'undefined' && this.props.device.attributes.length>0) {
      var sortedAttributes = this.props.device.attributes.sort(function (a, b) {
          return a.name.localeCompare( b.name );
      });
      for (var i=0;i<sortedAttributes.length;i++) {
        var secondaryText = (sortedAttributes[i].value instanceof Array) ? sortedAttributes[i].value.toString() : sortedAttributes[i].value;
        var secondaryTextLines = (sortedAttributes[i].value instanceof Array) ? 2 : 1;
        deviceInventory.push(
          <div key={i}>
            <ListItem style={styles.listStyle} disabled={true} primaryText={sortedAttributes[i].name} secondaryText={secondaryText} secondaryTextLines={secondaryTextLines} />
            <Divider />
          </div>
        );
      };

      deviceInventory.push(
        <div key="updateButton">
          <ListItem
            style={styles.listStyle}
            primaryText="Create a deployment for this device"
            onClick={this._clickListItem}
            leftIcon={<FontIcon style={{marginTop:6, marginBottom:6}} className="material-icons update">replay</FontIcon>} />
        </div>
      );
    } else {
      /* No inventory data yet */
      deviceInventory.push(
        <div className="waiting-inventory" key="waiting-inventory">
          <div onClick={this._handleStopProp} id="inventory-info" className="tooltip info" style={{top:"8px", right:"8px"}}>
            <FontIcon className="material-icons">info</FontIcon>
          </div>
          <p>Waiting for inventory data from the device</p>
          <Loader show={true} waiting={true} />
        </div>
      );
    }

    var deviceInventory2 = [];
    if (deviceInventory.length > deviceIdentity.length) {
      deviceInventory2 = deviceInventory.splice((deviceInventory.length/2)+(deviceInventory.length%2),deviceInventory.length-1);
    }

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
          </List>
        </div>

        <div className={this.props.unauthorized ? "report-list" : "hidden"}>
          <List style={{marginTop:"-8px"}}>
            <ListItem
              style={styles.listStyle}
              onClick={this._handleAccept}
              primaryText="Authorize device"
              leftIcon={<FontIcon className="material-icons green auth" style={{marginTop:6, marginBottom:6}}>check_circle</FontIcon>} />
            <Divider />
            <ListItem
              style={styles.listStyle}
              primaryText="Block device"
              onClick={this._handleBlock}
              leftIcon={<FontIcon className="material-icons red auth" style={{marginTop:6, marginBottom:6}}>cancel</FontIcon>} />
          </List>
        </div>

      </div>
    )
    
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