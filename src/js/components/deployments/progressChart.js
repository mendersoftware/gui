import React from 'react';
import { Router, Route, Link } from 'react-router';
var AppActions = require('../../actions/app-actions');
var AppStore = require('../../stores/app-store');

// material ui
var mui = require('material-ui');


var ProgressChart = React.createClass({
  getInitialState: function() {
    return {
      devices: [],
      stats: {
        "successful": 0,
        "pending": 0,
        "inprogress": 0,
        "failure": 0,
        "noimage": 0
      },
      device: {
        name: "",
        status: "",
      }
    };
  },
  componentDidMount: function() {
    AppActions.getSingleDeploymentStats(this.props.deployment.id, function(stats) {
      this.setState({stats:stats});
    }.bind(this));
    AppActions.getSingleDeploymentDevices(this.props.deployment.id, function(devices) {
      if (this.props.deployment.id === "30a0c91e6-7dec-11d0-a765-f81d4faebf6") {
        var devices = [
          {
              "id": "00a0c91e6-7dec-11d0-a765-f81d4faebf6",
              "finished": "2016-03-11T13:03:17.063493443Z",
              "status": "pending",
              "started": "2016-02-11T13:03:17.063493443Z",
              "device_type": "Raspberry Pi 3",
              "artifact_id": "60a0c91e6-7dec-11d0-a765-f81d4faebf6"
          },
          {
              "id": "00a0c91e6-7dec-11d0-a765-f81d4faebf6",
              "finished": "2016-03-11T13:03:17.063493443Z",
              "status": "failure",
              "started": "2016-02-11T13:03:17.063493443Z",
              "device_type": "Raspberry Pi 3",
              "artifact_id": "60a0c91e6-7dec-11d0-a765-f81d4faebf6"
          },
        ];
        this.setState({devices:devices});  
      } else {
        var sortedDevices = AppStore.getOrderedDeploymentDevices(devices);
        this.setState({devices: sortedDevices});
      }
    }.bind(this));
  },
  _handleClick: function(id) {
    var filter = encodeURIComponent("name="+id);
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
    // used for MOCK API because devices.length does not equal stats length
    var totalDevices = this.state.stats.successful + this.state.stats.failure + this.state.stats.inprogress + this.state.stats.pending;

    var success = this.state.stats.successful;
    var failures = this.state.stats.failure;
    var progress = this.state.stats.inprogress;
    var pending = this.state.stats.pending;

    var rows = Math.floor(Math.sqrt(this.state.devices.length));
    var dev = this.state.devices.length;

    while (this.state.devices.length % rows != 0) {
      rows = rows - 1;
    }
  
    if (rows === 1 && dev*80>300) {
      rows = Math.ceil(this.state.devices.length/5);
    }

    var pixelHeight = 80 / rows;

    var deviceGrid = this.state.devices.map(function(device, index) {
      var split = Math.ceil(dev / rows);
      return (
        <div key={index} className={index % split == 0 ? device.status +" clear" : device.status} style={{height: pixelHeight, width:pixelHeight}}>
          <div onMouseEnter={this._hoverDevice.bind(null, device)} onMouseLeave={this._hoverDevice} onClick={this._handleClick.bind(null, device.id)} className="bubble"></div>
        </div>
      );
    }, this);

    var progressChart = (
      <div>
        <div className="progressHeader">
          {success+failures} of {totalDevices} devices complete
        </div>
        <div className="bubbles-contain">
          {deviceGrid}
        </div>
        <div className={!this.state.device.id ? "device-info" : "device-info show"}>
          <b>Device info:</b>
          <p>{this.state.device.id}</p>
          <p>{this.state.device.status}</p>
        </div>
        <div className="key">
          <div className="bubble successful" /> Successful <div className="bubble failure" /> Failed <div className="bubble inprogress" /> In progress <div className="bubble pending" /> Pending 
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