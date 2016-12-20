import React from 'react';
import { Link } from 'react-router';
import CopyToClipboard from 'react-copy-to-clipboard';
import Time from 'react-time';
var AppActions = require('../../actions/app-actions');
var DeploymentStatus = require('./deploymentstatus');

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';

var ProgressReport = React.createClass({
  getInitialState: function() {
    return {
      failsOnly: this.props.deployment.status === "Failed",
      showDialog: false,
      logData: "",
      elapsed: 0
    };
  },
  componentDidMount: function() {
    this.timer = setInterval(this.tick, 50);
    this.timer2 = setInterval(this.refreshDeploymentDevices, 5000);
    this.refreshDeploymentDevices();
  },
  componentWillUnmount: function() {
    clearInterval(this.timer);
    clearInterval(this.timer2);
  },
  tick: function() {
    var now = new Date();
    var then = new Date(this.props.deployment.created);

    // get difference in seconds
    var difference = (now.getTime()-then.getTime())/1000;

     // Calculate the number of days left
    var days=Math.floor(difference / 86400);
    // After deducting the days calculate the number of hours left
    var hours = Math.floor((difference - (days * 86400 ))/3600);
     // After days and hours , how many minutes are left
    var minutes = Math.floor((difference - (days * 86400 ) - (hours *3600 ))/60);
    // Finally how many seconds left after removing days, hours and minutes.
    var secs = Math.floor((difference - (days * 86400 ) - (hours *3600 ) - (minutes*60)));
    secs = ("0" + secs).slice(-2);
    // Only show days if exists
    days = days ? days + "d " : "";

    var x =  days + hours + "h " + minutes + "m " + secs + "s";
    this.setState({elapsed: x});
  },
  refreshDeploymentDevices: function() {
    var self = this;
    if (self.props.deployment.status === "finished") {
      clearInterval(this.timer);
    } else {
      AppActions.getSingleDeploymentDevices(self.props.deployment.id, function(devices) {
        self._deploymentState("devices",devices);
        self._getDeviceDetails(devices);
      });
    }
  },
  _deploymentState: function (key, val) {
    var state = {};
    state[key] = val;
    this.setState(state);
  },
  _getDeviceArtifact: function (device) {
    var artifact = "";
    for (var i=0;i<device.attributes.length;i++) {
      if (device.attributes[i].name === "artifact_id") {
        artifact = device.attributes[i].value;
      }
    }
    return artifact;
  },
  _getDeviceDetails: function (devices) {
    var self = this;
    for (var i=0;i<devices.length;i++) {
      // get device artifact details not listed in schedule data
      AppActions.getDeviceById(devices[i].id, {
        success: function(device) {
          var deviceArtifacts = self.state.deviceArtifacts || {};
          deviceArtifacts[device.id] = self._getDeviceArtifact(device);
          self.setState({deviceArtifacts: deviceArtifacts});
        },
        error: function(err) {
          console.log("error ", err);
        }
      });
    }
  },
  _handleCheckbox: function (e, checked) {
    this.setState({failsOnly:checked});
  },
  _retryDeployment: function () {
    // replace contents of dialog, also change size, return contents and size on 'cancel'?
    this.props.retryDeployment(this.props.deployment);
  },
  _formatTime: function (date) {
    if (date) {
      return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
    }
    return;
  },
  viewLog: function (id) {
    AppActions.getDeviceLog(this.props.deployment.id, id, function(data) {
      this.setState({showDialog: true, logData: data, copied: false});
    }.bind(this));
  },
  exportLog: function () {
      var content = this.state.logData;
      var uriContent = "data:application/octet-stream," + encodeURIComponent(content);
      var newWindow = window.open(uriContent, 'deviceLog');
  },
  dialogDismiss: function() {
    this.setState({
      showDialog: false,
      logData: null
    });
  },
  _setFinished: function(bool) {
    clearInterval(this.timer);
    this.setState({finished: bool});
  },
  render: function () {
    var deviceList = [];
    var artifactsLink;
  
    if (this.state.devices) {
      deviceList = this.state.devices.map(function(device, index) {
        var encodedDevice = encodeURIComponent("id="+device.id); 
        var deviceLink = (
        <div>
          <Link style={{fontWeight:"500"}} to={`/devices/0/${encodedDevice}`}>{device.id}</Link>
        </div>
        );
        
        if (typeof this.state.deviceArtifacts !== 'undefined') {
          if (typeof this.state.deviceArtifacts[device.id] !== 'undefined')  {
            var encodedArtifacts = encodeURIComponent(this.state.deviceArtifacts[device.id]);
            artifactsLink = (
              <Link style={{fontWeight:"500"}} to={`/artifacts/${encodedArtifacts}`}>{this.state.deviceArtifacts[device.id]}</Link>
            )
          }
        }

        if ((device.status==="Failed")||(this.state.failsOnly===false)){
          return (
            <TableRow key={index}>
              <TableRowColumn>{deviceLink}</TableRowColumn>
              <TableRowColumn>{device.device_type}</TableRowColumn>
              <TableRowColumn>{artifactsLink}</TableRowColumn>
              <TableRowColumn><Time value={this._formatTime(device.created)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
              <TableRowColumn>{device.status || "--"}</TableRowColumn>
              <TableRowColumn><FlatButton className={device.status==='failure' ? null : "hidden"} onClick={this.viewLog.bind(null, device.id)} label="View log" /></TableRowColumn>
            </TableRow>
          )
        }
      }, this);
    }

    var logActions =  [
      <div style={{marginRight:"10px", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this.dialogDismiss.bind(null, 'dialog')} />
      </div>,
      <CopyToClipboard style={{marginRight:"10px", display:"inline-block"}} text={this.state.logData}
        onCopy={() => this.setState({copied: true})}>
        <FlatButton label="Copy to clipboard"/>
      </CopyToClipboard>,
      <RaisedButton
        label="Export log"
        primary={true}
        onClick={this.exportLog}/>
    ];
    return (
      <div>
        <div className="report-container">
          <div className="deploymentInfo" style={{width:"240px", height:"auto", margin:"30px 30px 30px 0", display:"inline-block", verticalAlign:"top"}}>
           <div><div className="progressLabel">Updating to:</div><span>{artifactsLink}</span></div>
           <div><div className="progressLabel">Device group:</div><span>{this.props.deployment.name}</span></div>
           <div><div className="progressLabel"># devices:</div><span>{deviceList.length}</span></div>
          </div>

          <div className="progressStatus">
            <div id="progressStatus">
              <h3 style={{marginTop:"12px"}}>{this.state.finished ? "Finished" : "In progress"}</h3>
              <h2><FontIcon className="material-icons" style={{margin:"0 10px 0 -10px",color:"#ACD4D0", verticalAlign:"text-top"}}>timelapse</FontIcon>{this.state.elapsed}</h2>
              <div>Started: <Time value={this._formatTime(this.props.deployment.created)} format="YYYY-MM-DD HH:mm" /></div>
            </div>
            <div className="inline-block">
              <DeploymentStatus setFinished={this._setFinished} refresh={true} vertical={true} id={this.props.deployment.id} />
            </div>
          </div>
        </div>

        <div style={{minHeight:"20vh"}}>

          <Table
            className={deviceList.length ? null : "hidden"}
            selectable={false}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn tooltip="Device name">Device name</TableHeaderColumn>
                <TableHeaderColumn tooltip="Device type">Device type</TableHeaderColumn>
                <TableHeaderColumn tooltip="Current software">Current software</TableHeaderColumn>
                <TableHeaderColumn tooltip="Started">Started</TableHeaderColumn>
                <TableHeaderColumn tooltip="Deployment status">Deployment status</TableHeaderColumn>
                <TableHeaderColumn tooltip=""></TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}>
              {deviceList}
            </TableBody>
          </Table>
        </div>

        <Dialog
          title="Deployment log for device"
          autoDetectWindowHeight={true} autoScrollBodyContent={true}
          open={this.state.showDialog}
          actions={logActions}
          bodyStyle={{padding:"0", overflow:"hidden"}}>
          <div className="code">
            {this.state.logData}
          </div>
          <p style={{marginLeft:"24px"}}>{this.state.copied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
        </Dialog>
      </div>
    );
  }
});

module.exports = ProgressReport;