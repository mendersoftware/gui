import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Link } from 'react-router';
var createReactClass = require('create-react-class');
var AppActions = require('../../actions/app-actions');
var AppStore = require('../../stores/app-store');
var pluralize = require('pluralize');
import LinearProgress from 'material-ui/LinearProgress';
var { statusToPercentage } = require('../../helpers')

var ProgressChart = createReactClass({
  getInitialState: function() {
    return {
      devices: [],
      stats: {
        "downloading": 0,
        "decommissioned": 0,
        "failure": 0,
        "installing": 0,
        "noartifact": 0,
        "pending": 0,
        "rebooting": 0,
        "success": 0,
        "already-installed": 0
      },
      device: {
        name: "",
        status: "",
      }
    };
  },
  componentDidMount: function() {
    this.timer = setInterval(this.refreshDeploymentDevices, 30000);
    this.refreshDeploymentDevices();
  },
  componentWillUnmount: function() {
    clearInterval(this.timer);
  },
  refreshDeploymentDevices: function() {
    AppActions.getSingleDeploymentStats(this.props.deployment.id, function(stats) {
      this.setState({stats:stats});
    }.bind(this));
    AppActions.getSingleDeploymentDevices(this.props.deployment.id, function(devices) {
      var sortedDevices = AppStore.getOrderedDeploymentDevices(devices);
      this.setState({devices: sortedDevices});
    }.bind(this));
  },
  _handleClick: function(id) {
    var filter = "id="+id;
    this.context.router.push('/devices/'+filter);
  },
  _hoverDevice: function(device) {
    if (!device) {
      device = {
        name: "",
        status: "",
      };
    }

    var self = this;
    var callback = {
      success: function(data) {
        device.identity_data = data.identity_data;
        self.setState({device: device});
      },
      error: function(err) {
        console.log("Error: " + err);
      }
    };

    if (device.id) {
      // get device id data for individual device
      AppActions.getDeviceAuth(callback, device.id);
    }
  },
  render: function() {
    var skipped = this.state.stats.noartifact +  this.state.stats["already-installed"];
    var totalDevices = this.state.devices.length - skipped;

    var success = this.state.stats.success;
    var failures = this.state.stats.failure + this.state.stats.decommissioned;
    var progress = this.state.stats.downloading + this.state.stats.rebooting + this.state.stats.installing;
    var pending = this.state.stats.pending;
    var dev = this.state.devices.length;

     // figure out best fit number of rows
    var rows = Math.floor(Math.sqrt(dev));

    while (dev % rows != 0) {
      rows = rows - 1;
    }

    if (rows === 1 && dev*90>400) {
      rows = Math.ceil(this.state.devices.length/5);
    }

    // do rough calculation for displaying circles in correct size
    var pixelHeight = 100 / rows;
    var real_per_row = 400/pixelHeight;
    var real_rows = (dev/real_per_row)
    if (real_per_row > rows) {
      while ((pixelHeight * real_rows)<80) {
        pixelHeight += 1;
        real_per_row = 400/pixelHeight;
        real_rows = (dev/real_per_row);
      }
    }

    var deviceGrid = this.state.devices.map(function(device, index) {
      if (device.status !== "noartifact" && device.status !== "already-installed") {
        return (
          <div key={index} className={device.status} style={{height: pixelHeight, width:pixelHeight}}>
            <div onMouseEnter={this._hoverDevice.bind(null, device)} onMouseLeave={this._hoverDevice} onClick={this._handleClick.bind(null, device.id)} className="bubble"></div>
          </div>
        );
      }
    }, this);

    var intervalsSinceStart = Math.floor((Date.now() - Date.parse(this.props.deployment.created)) / (1000 * 20));
    var percentage = statusToPercentage(this.state.device.status, intervalsSinceStart);

    var progressChart = (
      <div className="relative">
        <div className="progressHeader">
          {success+failures} of {totalDevices} devices complete
          {skipped ? <div className="skipped-text">{skipped} {pluralize("devices", skipped)} {pluralize("was", skipped)} skipped</div> : null}
        </div>
        <div className="bubbles-contain">
          {deviceGrid}
        </div>
        <div className={!this.state.device.id ? "device-info" : "device-info show"}>
          <b>Device info:</b>
          <p><b>{(this.props.globalSettings || {}).id_attribute || "Device ID"}: </b> 
            { ((this.props.globalSettings || {}).id_attribute && (this.props.globalSettings || {}).id_attribute !== "Device ID") && this.state.device.identity_data 
              ? this.state.device.identity_data[this.props.globalSettings.id_attribute] 
              : this.state.device.id }
          </p>
          <p><b>Status: </b>{this.state.device.status}</p>
          <div className={"substateText"}>{this.state.device.substate}</div>
          
          { !["pending", "decommissioned", "aborted"].includes(this.state.device.status.toLowerCase()) && 
            <div>
              <div className={"substateText"} style={{textAlign: "end"}}>
                {percentage}%
              </div>
              <LinearProgress color={this.state.device.status && this.state.device.status.toLowerCase() == "failure" ? "#8f0d0d":"#009E73"} mode="determinate" value={percentage} />
            </div>
          }
        </div>
        <div className="key">
          <div className="bubble failure" /> Failed <div className="bubble pending" /> Pending <div className="bubble inprogress" /> In progress <div className="bubble success" /> Successful
        </div>
      </div>
    );
    return (
      <div>
        {progressChart}
      </div>
    );
  }
});

ProgressChart.contextTypes = {
  router: PropTypes.object
};

module.exports = ProgressChart;
