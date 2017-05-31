import React from 'react';
import { Link } from 'react-router';
import Time from 'react-time';
var isEqual = require('lodash.isequal');

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';

var ProgressDeviceList = React.createClass({
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
       
        var encodedDevice = encodeURIComponent("id="+device.id); 
        var deviceLink = (
        <div>
          <Link style={{fontWeight:"500"}} to={`/devices/0/${encodedDevice}`}>{device.id}</Link>
        </div>
        );
        
        if (typeof this.props.deviceArtifacts !== 'undefined') {
          if (typeof this.props.deviceArtifacts[device.id] !== 'undefined')  {
            var encodedArtifactName = encodeURIComponent(this.props.deviceArtifacts[device.id]);
            currentArtifactLink = (
              <Link style={{fontWeight:"500"}} to={`/artifacts/${encodedArtifactName}`}>{this.props.deviceArtifacts[device.id]}</Link>
            )
          }
        }

        var status = (function(status) {
          switch (status) {
            case "noartifact":
              return "No artifact";
              break;
            case "already-installed":
              return "Already installed";
              break;
            default:
              return device.status.charAt(0).toUpperCase() + device.status.slice(1);
              break;
          }
        })(device.status);

        return (
          <TableRow key={index}>
            <TableRowColumn>{deviceLink}</TableRowColumn>
            <TableRowColumn>{device.device_type}</TableRowColumn>
            <TableRowColumn>{currentArtifactLink}</TableRowColumn>
            <TableRowColumn><Time value={this._formatTime(device.created)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
            <TableRowColumn>{time}</TableRowColumn>
            <TableRowColumn>{status || "--"}</TableRowColumn>
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
            <TableHeaderColumn tooltip="Device id">Device ID</TableHeaderColumn>
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