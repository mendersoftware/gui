import React from 'react';
import { Router, Link } from 'react-router';
import Time from 'react-time';
import Collapse from 'react-collapse';

var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var ScheduleForm = require('../deployments/scheduleform');

import { List, ListItem } from 'material-ui/List';
import FontIcon from 'material-ui/FontIcon';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';

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

  dialogToggle: function (ref) {
    var state = {};
    state[ref] = !this.state[ref];
    this.setState(state);
  },

  _updateParams: function(val, attr) {
    // updating params from child schedule form
    var tmp = {};
    tmp[attr] = val;
    this.setState(tmp);
  },

  _clickListItem: function() {
   this.dialogToggle('schedule');
  },

  _onScheduleSubmit: function() {
    var newDeployment = {
      devices: [this.props.device.id],
      name: this.props.device.name,
      artifact_name: this.state.image.name
    }
    AppActions.createDeployment(newDeployment, function(uri) {
      console.log(uri);
    });
    this.dialogToggle('schedule');
  },
  _handleAccept: function() {
    this.props.accept(this.props.selected);
  },
  _handleBlock: function() {
    this.props.block(this.props.selected);
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
        <ListItem style={styles.listStyle} disabled={true} primaryText="ID checksum" secondaryText={this.props.deviceId} secondaryTextLines={2} className="break-word" />
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
            {i === length-1 ? null : <Divider />}
          </div>
        );
        i++;
      };
    }

    var deviceInventory = [];
    var i = 0;
    length = Object.keys(deviceInventory).length;
    for (var k in deviceInventory) {
      deviceInventory.push(
        <div key={k}>
          <ListItem style={styles.listStyle} disabled={true} primaryText={k} secondaryText={ deviceInventory[k]} />
          <Divider />
        </div>
      );
      i++;
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
          <ScheduleForm images={this.props.images} device={this.props.device} deploymentSchedule={this._updateParams} groups={this.props.groups} />

        </Dialog>

      </div>
    );
  }
});

module.exports = SelectedDevices;