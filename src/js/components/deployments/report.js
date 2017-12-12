import React from 'react';
import { Link } from 'react-router';
import Time from 'react-time';
import CopyToClipboard from 'react-copy-to-clipboard';
var createReactClass = require('create-react-class');
var AppActions = require('../../actions/app-actions');
var AppStore = require('../../stores/app-store');
var DeploymentStatus = require('./deploymentstatus');
var DeviceList = require('./deploymentdevicelist');
var Pagination = require('rc-pagination');
var _en_US = require('rc-pagination/lib/locale/en_US');
var pluralize = require('pluralize')
import update from 'react-addons-update';
var isEqual = require('lodash.isequal');
var differenceWith = require('lodash.differencewith');
import BlockIcon from 'react-material-icons/icons/content/block';
var ConfirmAbort = require('./confirmabort');

// material ui
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';

var DeploymentReport = createReactClass({
  getInitialState: function() {
    return {
      stats: {
        failure: null
      },
      showDialog: false,
      logData: "",
      elapsed: 0,
      currentPage: 1,
      start: 0,
      perPage: 50,
      deviceCount: 0,
      showPending: true,
      abort: false
    };
  },
  componentDidMount: function() {
    this.timer;
    var self = this;
    if (this.props.past) {
      AppActions.getSingleDeploymentStats(this.props.deployment.id, function(stats) {
        self.setState({"stats": stats});
      });
    } else {
       this.timer = setInterval(this.tick, 50);
    }
    this.timer2 = setInterval(this.refreshDeploymentDevices, 10000);
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
    }

    AppActions.getSingleDeploymentDevices(self.props.deployment.id, function(devices) {
      var sortedDevices = AppStore.getOrderedDeploymentDevices(devices);
      sortedDevices = self.state.showPending ? sortedDevices : sortedDevices.filter(self._filterPending);
      self.setState({allDevices: sortedDevices, deviceCount:devices.length});
      self._handlePageChange(self.state.currentPage);
    });
  },
  _getDeviceArtifact: function (device) {
    var artifact = "-";
    for (var i=0;i<device.attributes.length;i++) {
      if (device.attributes[i].name === "artifact_name") {
        artifact = device.attributes[i].value;
      }
    }
    return artifact;
  },
  _getDeviceType: function (device) {
    var device_type = "-";
    for (var i=0;i<device.attributes.length;i++) {
      if (device.attributes[i].name === "device_type") {
        device_type = device.attributes[i].value;
      }
    }
    return device_type;
  },
  _getDeviceDetails: function (devices) {
    var self = this;
    for (var i=0;i<devices.length;i++) {
      // get device artifact and inventory details not listed in schedule data
      self._setSingleDeviceDetails(devices[i].id);
    }
  },
  _setSingleDeviceDetails: function(id) {
    var self = this;
    AppActions.getDeviceById(id, {
      success: function(device_inventory) {
        var artifact = self._getDeviceArtifact(device_inventory);
        var device_type = self._getDeviceType(device_inventory);
        var deviceInventory = self.state.deviceInventory || {};
        var inventory = {device_type: device_type, artifact: artifact};

        if (!self.state.stopRestCalls) {
          self.setState({
            deviceInventory: update(deviceInventory, {[id]: {$set: inventory}})
          })
        }
      },
      error: function(err) {
        console.log("error ", err);
      }
    });
  },
  _filterPending: function(device) {
    return device.status !== "pending";
  },
  _handleCheckbox: function (e, checked) {
    this.setState({showPending:checked, currentPage:1});
    this.refreshDeploymentDevices();
  },
  _retryDeployment: function () {
    // replace contents of dialog, also change size, return contents and size on 'cancel'?
    this.props.retryDeployment(this.props.deployment);
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
      logData: null,
      stopRestCalls: true
    });
  },
  _setFinished: function(bool) {
    clearInterval(this.timer);
    this.setState({finished: bool});
  },
  _handlePageChange: function(pageNo) {
    var start = (pageNo*this.state.perPage)-this.state.perPage;
    var end = Math.min(this.state.allDevices.length, (pageNo*this.state.perPage));
    // cut slice from full list of devices
    var slice = this.state.allDevices.slice(start, end);
    if (!isEqual(slice, this.state.pagedDevices)) {
      var diff = differenceWith(slice, this.state.pagedDevices, isEqual);
      // only update those that have changed
      this._getDeviceDetails(diff); 
    }
    this.setState({currentPage: pageNo, start:start, end:end, pagedDevices:slice});
  },
   _formatTime: function (date) {
    if (date) {
      return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
    }
    return;
  },
  updatedList: function () {
    // use to make sure parent re-renders dialog when device list built
    this.props.updated();
  },
  _abortHandler: function() {
    this.props.abort(this.props.deployment.id);
  },
  _hideConfirm: function() {
    var self = this;
    setTimeout(function() {
      self.setState({abort:false});
    }, 150);
  },
  _showConfirm: function() {
    this.setState({abort:true});
  },
  render: function () {
    var deviceList = this.state.pagedDevices || [];
    var allDevices = this.state.allDevices || [];

    var encodedArtifactName = encodeURIComponent(this.props.deployment.artifact_name);
    var artifactLink = ( 
      <Link style={{fontWeight:"500"}} to={`/artifacts/${encodedArtifactName}`}>{this.props.deployment.artifact_name}</Link>
    );

    var checkboxLabel = "Show pending devices";

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

    var abort = (
      <div className="float-right">
        <FlatButton label="Abort deployment" secondary={true} onClick={this._showConfirm} icon={<BlockIcon style={{height:"18px", width:"18px", verticalAlign:"middle"}}/>}/>
      </div>
    );
    if (this.state.abort) {
      abort = (
        <ConfirmAbort cancel={this._hideConfirm} abort={this._abortHandler} />
      );
    }

    var finished = "-";
    if (this.props.deployment.finished) {
      finished = (
        <Time value={this._formatTime(this.props.deployment.finished)} format="YYYY-MM-DD HH:mm" />
      )
    }

    return (
      <div>
        <div className="report-container">
          <div className="deploymentInfo" style={{width:"240px", height:"auto", margin:"30px 30px 30px 0", display:"inline-block", verticalAlign:"top"}}>
           <div><div className="progressLabel">Updating to:</div><span>{artifactLink}</span></div>
           <div><div className="progressLabel">Device group:</div><span>{this.props.deployment.name}</span></div>
           <div><div className="progressLabel"># devices:</div><span>{this.state.deviceCount}</span></div>
          </div>

          {
            this.props.past ?
            <div className="inline">
              <div className="deploymentInfo" style={{width:"260px", height:"auto", margin:"30px 30px 30px 0", display:"inline-block", verticalAlign:"top"}}>
                <div><div className="progressLabel">Status:</div>Finished<span className={this.state.stats.failure ? "failures" : "hidden"}> with failures</span></div>
                <div><div className="progressLabel">Started:</div><Time value={this._formatTime(this.props.deployment.created)} format="YYYY-MM-DD HH:mm" /></div>
                <div><div className="progressLabel">Finished:</div>{finished}</div>
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

              <div className="hidden" style={{width:"240px", height:"auto", margin:"30px 0 30px 30px", display:"inline-block", verticalAlign:"top"}}>
                <Checkbox
                  label="Show only failures"
                  onCheck={this._handleCheckbox}/>
              </div>
            </div>

          :
            <div className="inline">
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

              <div className="hidden" style={{width:"240px", height:"auto", margin:"30px 0 30px 30px", display:"inline-block", verticalAlign:"top"}}>
                <Checkbox
                  label={checkboxLabel}
                  onCheck={this._handleCheckbox}
                />
                <p style={{marginLeft:"40px"}} className={(this.state.deviceCount - allDevices.length) ? "info" : "hidden"}>
                  {(this.state.deviceCount - allDevices.length)} devices pending
                </p>
              </div>

              <div id="reportAbort" className={this.state.abort ? "hint--bottom hint--always hint--large hint--info" : "hint--bottom hint--large hint--info"} data-hint="Devices that have not yet started the deployment will not start the deployment.&#10;Devices that have already completed the deployment are not affected by the abort.&#10;Devices that are in the middle of the deployment at the time of abort will finish deployment normally, but will perform a rollback.">
                {abort}
              </div>
            </div>
          }
          
        </div>


        <div style={{minHeight:"20vh"}}>
          <DeviceList status={this.props.deployment.status} devices={deviceList} deviceInventory={this.state.deviceInventory} viewLog={this.viewLog} finished={this.updatedList} past={this.props.past} />
          {allDevices.length ? <Pagination locale={_en_US} simple pageSize={this.state.perPage} current={this.state.currentPage || 1} total={allDevices.length} onChange={this._handlePageChange} /> : null }
        </div>

        <Dialog
          title="Deployment log for device"
          autoDetectWindowHeight={true} autoScrollBodyContent={true}
          open={this.state.showDialog}
          actions={logActions}
          bodyStyle={{padding:"0", overflow:"hidden"}}>
          <div className="code log">
            {this.state.logData}
          </div>
          <p style={{marginLeft:"24px"}}>{this.state.copied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
        </Dialog>

      </div>
    );
  }
});

module.exports = DeploymentReport;