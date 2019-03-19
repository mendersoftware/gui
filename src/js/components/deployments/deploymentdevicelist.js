import React from 'react';
import { Link } from 'react-router';
import Time from 'react-time';
var isEqual = require('lodash.isequal');
var createReactClass = require('create-react-class');
var { statusToPercentage } = require('../../helpers')


// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import LinearProgress from 'material-ui/LinearProgress';

var ProgressDeviceList = createReactClass({
  getInitialState: function() {
    return {
      prevDevices:{}
    };
  },
  shouldComponentUpdate: function (nextProps, nextState) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
  },
  componentDidUpdate: function(prevProps, prevState) {
    this.props.finished();
    this.setState({prevDevices: prevProps.devices});
  },
  _formatTime: function (date) {
    if (date) {
      return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
    }
    return;
  },
  render: function() {
    var self = this;
    var intervalsSinceStart = Math.floor((Date.now() - Date.parse(self.props.created)) / (1000 * 20));

    var deviceList = [];
    var currentArtifactLink;
    if (this.props.devices) {
      deviceList = this.props.devices.map(function(device, index) {

        var time = "-";
        if (device.finished) {
          time = (
            <Time value={this._formatTime(device.finished)} format="YYYY-MM-DD HH:mm" />
          )
        }
        var encodedDevice = "id="+device.id;
        var id_attribute = device.id;

        if ((self.props.globalSettings || {}).id_attribute && (self.props.globalSettings || {}).id_attribute !== "Device ID") {
          // if global setting is not "Device Id"
          if ((self.props.deviceIdentity||{})[device.id]) {
            // if device identity data is available, set custom attribute
            id_attribute =  self.props.deviceIdentity[device.id][self.props.globalSettings.id_attribute];
          } else {
            id_attribute = "-";
          }
        }


        var deviceLink = (
        <div>
          <Link style={{fontWeight:"500"}} to={`/devices/${encodedDevice}`}>{ id_attribute }</Link>
        </div>
        );

        if (typeof this.props.deviceInventory !== 'undefined') {
          if (typeof this.props.deviceInventory[device.id] !== 'undefined')  {
            var encodedArtifactName = encodeURIComponent((this.props.deviceInventory[device.id] || {}).artifact);
            currentArtifactLink = (
              <Link style={{fontWeight:"500"}} to={`/artifacts/${encodedArtifactName}`}>{(this.props.deviceInventory[device.id] || {}).artifact}</Link>
            )

            var device_type = (this.props.deviceInventory[device.id] || {}).device_type;
          }
        }

        var status = (function(status) {
          switch (status) {
            case "noartifact":
              return "No artifact";
              break;
            case "already-installed":
              device.percentage = 100;
              return "Already installed";
              break;
            default:
              device.percentage = statusToPercentage(device.status, intervalsSinceStart);
              return device.status.charAt(0).toUpperCase() + device.status.slice(1);
              break;
          }
        })(device.status);

        var statusText = (function(status, substate) {
          if (status && substate) {
            return (<div>
                      <div style={{display:"inline", verticalAlign: "top"}}>{status}: </div>
                      <div className="substate">{device.substate}</div>
                    </div>
            );
          }
          if (status) {
            return `${status}`
          }
        })(status, device.substate || "");

        var devicePercentage = (function(percentage) {
          return `${device.percentage}%`
        })(device.percentage)

        return (
          <TableRow key={index}>
            <TableRowColumn>{deviceLink}</TableRowColumn>
            <TableRowColumn>{device_type}</TableRowColumn>
            <TableRowColumn>{currentArtifactLink}</TableRowColumn>
            <TableRowColumn><Time value={this._formatTime(device.created)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
            <TableRowColumn>{time}</TableRowColumn>
            <TableRowColumn style={{paddingRight: "0px"}}>
              <div style={{marginTop: "5px"}}>
                {statusText}
              </div>
              <div>
               { !["pending", "decommissioned", "already-installed"].includes(device.status.toLowerCase()) &&
               <div>
                  <div style={{textAlign: "end", color: "#aaaaaa"}}>
                  { !["aborted", "failure", "noartifact"].includes(device.status.toLowerCase()) ? devicePercentage : "0%"}
                  </div>
                  <LinearProgress color={status && (status.toLowerCase() === "failure" || status.toLowerCase() === "aborted") ? "#8f0d0d":"#009E73"} mode="determinate" value={device.percentage} />
                </div>
                }
              </div>
            </TableRowColumn>
            <TableRowColumn><FlatButton className={device.log ? null : "hidden"} onClick={this.props.viewLog.bind(null, device.id)} label="View log" /></TableRowColumn>
          </TableRow>
        )
      }, this);
    }

    return (
      <Table
        className={deviceList.length ? null : "hidden"}
        selectable={false}>
        <TableHeader
          displaySelectAll={false}
          adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn tooltip={(this.props.globalSettings || {}).id_attribute || "Device ID"}>{(this.props.globalSettings || {}).id_attribute || "Device ID"}</TableHeaderColumn>
            <TableHeaderColumn tooltip="Device type">Device type</TableHeaderColumn>
            <TableHeaderColumn tooltip="Current software">Current software</TableHeaderColumn>
            <TableHeaderColumn tooltip="Started">Started</TableHeaderColumn>
            <TableHeaderColumn tooltip="Finished">Finished</TableHeaderColumn>
            <TableHeaderColumn tooltip="Deployment status">Deployment status</TableHeaderColumn>
            <TableHeaderColumn tooltip=""></TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}>
          {deviceList}
        </TableBody>
      </Table>
    );
  }
});

module.exports = ProgressDeviceList;
