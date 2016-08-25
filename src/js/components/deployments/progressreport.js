import React from 'react';
import { Link } from 'react-router';
import CopyToClipboard from 'react-copy-to-clipboard';
var Time = require('react-time');
var AppActions = require('../../actions/app-actions');
var DeploymentStatus = require('./deploymentstatus');

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;
var FlatButton = mui.FlatButton;
var RaisedButton = mui.RaisedButton;
var Checkbox = mui.Checkbox;
var Dialog = mui.Dialog;

var ProgressReport = React.createClass({
  getInitialState: function() {
    return {
      failsOnly: this.props.deployment.status === "Failed",
      showDialog: false,
      logData: ""
    };
  },
  componentDidMount: function() {
    AppActions.getSingleDeploymentDevices(this.props.deployment.id, function(devices) {
      this._deploymentState("devices",devices);
    }.bind(this));
  },
  _deploymentState: function (key, val) {
    var state = {};
    state[key] = val;
    this.setState(state);
  },
  _getDeviceDetails: function (id) {
    // get device details not listed in schedule data
    //return AppActions.getSingleDeviceReport(id)
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
  render: function () {
    var deviceList = [];
    var encodedSoftware = encodeURIComponent(this.props.deployment.artifact_name); 
    var softwareLink = (
      <Link style={{fontWeight:"500"}} to={`/software/${encodedSoftware}`}>{this.props.deployment.artifact_name}</Link>
    )

    if (this.state.devices) {
      deviceList = this.state.devices.map(function(device, index) {
        var encodedDevice = encodeURIComponent("id="+device.id); 
        var deviceLink = (
        <div>
          <Link style={{fontWeight:"500"}} to={`/devices/0/${encodedDevice}`}>{device.id}</Link>
        </div>
        );
        //var deviceDetails = this._getDeviceDetails(device.id);
        if ((device.status==="Failed")||(this.state.failsOnly===false)){
          return (
            <TableRow key={index}>
              <TableRowColumn>{deviceLink}</TableRowColumn>
              <TableRowColumn>{device.device_type}</TableRowColumn>
              <TableRowColumn>{softwareLink}</TableRowColumn>
              <TableRowColumn><Time value={this._formatTime(device.created)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
              <TableRowColumn>{device.status || "--"}</TableRowColumn>
              <TableRowColumn><FlatButton className={device.status==='failure' ? null : "hidden"} onClick={this.viewLog.bind(null, device.id)} label="View log" /></TableRowColumn>
            </TableRow>
          )
        }
      }, this);
    }

    var logActions =  [
      <div style={{marginRight:"10", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this.dialogDismiss.bind(null, 'dialog')} />
      </div>,
      <CopyToClipboard style={{marginRight:"10", display:"inline-block"}} text={this.state.logData}
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
          <div className="deploymentInfo" style={{width:"240", height:"auto", margin:"30px 30px 30px 0", display:"inline-block", verticalAlign:"top"}}>
           <div><div className="progressLabel">Updating to:</div><span>{softwareLink}</span></div>
           <div><div className="progressLabel">Device group:</div><span>{this.props.deployment.name}</span></div>
           <div><div className="progressLabel"># devices:</div><span>{deviceList.length}</span></div>
          </div>

          <div className="progressStatus" style={{height:"auto", margin:"30px 30px 30px 0", display:"inline-block", verticalAlign:"top"}}>
            <div id="progressStatus">
              <h3>In progress</h3>
              <div>Started: <Time value={this._formatTime(this.props.deployment.created)} format="YYYY-MM-DD HH:mm" /></div>
            </div>
            <div className="inline-block">
              <DeploymentStatus vertical={true} id={this.props.deployment.id} />
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
                <TableHeaderColumn tooltip="Deployment start time">Start time</TableHeaderColumn>
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
          <p style={{marginLeft:"24"}}>{this.state.copied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
        </Dialog>
      </div>
    );
  }
});

module.exports = ProgressReport;