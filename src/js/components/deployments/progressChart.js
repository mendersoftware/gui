import React from 'react';
import { Router, Route, Link } from 'react-router';
var AppActions = require('../../actions/app-actions');
var AppStore = require('../../stores/app-store');
var pluralize = require('pluralize');
import { ShortSHA } from '../../helpers';

var ProgressChart = React.createClass({
  getInitialState: function() {
    return {
      devices: [],
      stats: {
        "downloading": 0,
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
    this.timer = setInterval(this.refreshDeploymentDevices, 5000);
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
    var filter = encodeURIComponent("id="+id);
    this.context.router.push('/devices/1/'+filter);
  },
  _hoverDevice: function(device) {
    if (!device) {
      device = {
        name: "",
        status: "",
      };
    }
    this.setState({device: device});
  },
  render: function() {
    var skipped = this.state.stats.noartifact +  this.state.stats["already-installed"];
    var totalDevices = this.state.devices.length - skipped;

    var success = this.state.stats.success;
    var failures = this.state.stats.failure;
    var progress = this.state.stats.downloading + this.state.stats.rebooting + this.state.stats.installing;
    var pending = this.state.stats.pending;

    var rows = Math.floor(Math.sqrt(this.state.devices.length));
    var dev = this.state.devices.length;

    while (this.state.devices.length % rows != 0) {
      rows = rows - 1;
    }
  
    if (rows === 1 && dev*80>300) {
      rows = Math.ceil(this.state.devices.length/5);
    }

    var split = Math.ceil(dev / rows);

    if ((split/rows)<1.5) {
      split = split*2;
    }

    var pixelHeight = 80 / rows;
    var deviceGrid = this.state.devices.map(function(device, index) {
      if (device.status !== "noartifact" && device.status !== "already-installed") {
        return (
          <div key={index} className={device.status} style={{height: pixelHeight, width:pixelHeight}}>
            <div onMouseEnter={this._hoverDevice.bind(null, device)} onMouseLeave={this._hoverDevice} onClick={this._handleClick.bind(null, device.id)} className="bubble"></div>
          </div>
        );
      }
    }, this);

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
          <p><b>ID:</b> {ShortSHA(this.state.device.id || "")}</p>
          <p><b>Status:</b> {this.state.device.status}</p>
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
  router: React.PropTypes.object
};

module.exports = ProgressChart;