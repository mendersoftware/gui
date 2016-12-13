import React from 'react';
import { Link } from 'react-router';
import CopyToClipboard from 'react-copy-to-clipboard';
import Time from 'react-time';
var AppActions = require('../../actions/app-actions');
var pluralize = require('pluralize')

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';

var Report = React.createClass({
  getInitialState: function() {
    return {
      failsOnly: false,
      stats: {
        failure: null
      },
      showDialog: false,
      logData: ""
    };
  },
  componentDidMount: function() {
    AppActions.getSingleDeploymentStats(this.props.deployment.id, function(stats) {
      this._deploymentState("stats",stats);
    }.bind(this));
    AppActions.getSingleDeploymentDevices(this.props.deployment.id, function(devices) {
      this._deploymentState("devices",devices);
      self._getDeviceDetails(devices);
    }.bind(this));
  },
  _deploymentState: function (key, val) {
    var state = {};
    state[key] = val;
    this.setState(state);
    if (state.failure) {
      this.setState({failsOnly: true});
    }
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
  _getDeviceDetails: function (devices) {
    var self = this;
    for (var i=0;i<devices.length;i++) {
      // get device artifact details not listed in schedule data
      AppActions.getDeviceById(devices[i].id, {
        success: function(device) {
          var deviceArtifact = self.state.deviceArtifact || {};
          deviceArtifact[device.id] = self._getDeviceArtifact(device);
          self.setState({deviceArtifact: deviceArtifact});
        },
        error: function(err) {
          console.log("error ", err);
        }
      });
    }
  },
  dialogDismiss: function() {
    this.setState({
      showDialog: false,
      logData: null
    });
  },
  render: function () {
    var deviceList = [];
    var artifactLink;
    if (this.props.deployment &&  typeof this.props.deployment.artifact_name !== 'undefined')  {
      var encodedArtifact = encodeURIComponent(this.props.deployment.artifact_name); 
      artifactLink = (
        <Link style={{fontWeight:"500"}} to={`/artifact/${encodedArtifact}`}>{this.props.deployment.artifact_name}</Link>
      )
    }
    if (this.state.devices) {
      deviceList = this.state.devices.map(function(device, index) {
        var encodedDevice = encodeURIComponent("id="+device.id); 
        var deviceLink = (
        <div>
          <Link style={{fontWeight:"500"}} to={`/devices/0/${encodedDevice}`}>{device.id}</Link>
        </div>
        );
        
         
        if (typeof this.state.deviceArtifact !== 'undefined') {
          if (typeof this.state.deviceArtifact[device.id] !== 'undefined')  {
            var encodedArtifact = encodeURIComponent(this.state.deviceArtifact[device.id]);
            artifactLink = (
              <Link style={{fontWeight:"500"}} to={`/artifact/${encodedArtifact}`}>{this.state.deviceArtifact[device.id]}</Link>
            )
          }
        }
        
        if ((device.status==="failure")||(this.state.failsOnly===false)){
          return (
            <TableRow key={index}>
              <TableRowColumn>{deviceLink}</TableRowColumn>
              <TableRowColumn>{device.device_type}</TableRowColumn>
              <TableRowColumn>{artifactLink}</TableRowColumn>
              <TableRowColumn><Time value={this._formatTime(device.created)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
              <TableRowColumn><Time value={this._formatTime(device.finished)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
              <TableRowColumn>{device.status || "--"}</TableRowColumn>
              <TableRowColumn><FlatButton className={device.status==='failure' ? null : "hidden"} onClick={this.viewLog.bind(null, device.id)} label="View log" /></TableRowColumn>
            </TableRow>
          )
        }
      }, this);
    }
    var status = (this.props.deployment.status === "inprogress") ? "In progress" : this.props.deployment.status;
    var logActions =  [
      <div style={{marginRight:"10px", display:"inline-block"}}>
        <FlatButton
          label="Close"
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
          <div className="deploymentInfo" style={{width:"260px", height:"auto", margin:"30px 30px 30px 0", display:"inline-block", verticalAlign:"top"}}>
           <div><div className="progressLabel">Updating to:</div><span>{artifactLink}</span></div>
           <div><div className="progressLabel">Device group:</div><span>{this.props.deployment.name}</span></div>
           <div><div className="progressLabel"># devices:</div><span>{deviceList.length}</span></div>
          </div>

          <div className="deploymentInfo" style={{width:"260px", height:"auto", margin:"30px 30px 30px 0", display:"inline-block", verticalAlign:"top"}}>
           <div><div className="progressLabel">Status:</div>Completed<span className={this.state.stats.failure ? "failures" : "hidden"}> with failures</span></div>
           <div><div className="progressLabel">Started:</div><Time value={this._formatTime(this.props.deployment.created)} format="YYYY-MM-DD HH:mm" /></div>
       
          </div>

          <div className="deploymentInfo" style={{height:"auto", margin:"30px 30px 30px 0", display:"inline-block", verticalAlign:"top"}}>
            <div className={this.state.stats.failure ? "statusLarge" : "hidden"}>
              <img src="assets/img/largeFail.png" />
              <div className="statusWrapper">
                <b className="red">{this.state.stats.failure}</b> {pluralize("devices", this.state.stats.failure)} failed to update
              </div>
            </div> 
            <div className={this.state.stats.success ? "statusLarge" : "hidden"}>
            <img src="assets/img/largeSuccess.png" />
              <div className="statusWrapper">
                <b className="green"><span className={this.state.stats.success === deviceList.length ? null : "hidden"}>All </span>{this.state.stats.success}</b> {pluralize("devices", this.state.stats.success)} updated successfully
              </div>
            </div>
            
          </div>
        </div>

        <Checkbox
          defaultChecked={this.state.stats.failure>0}
          label="Show only failures"
          checked={this.state.failsOnly}
          onCheck={this._handleCheckbox}
          className={this.state.stats.failure ? null : "hidden"} />
    

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

module.exports = Report;