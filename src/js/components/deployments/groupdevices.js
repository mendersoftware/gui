import React from 'react';
var AppActions = require('../../actions/app-actions');

var GroupDevices = React.createClass({
  getInitialState: function() {
    return {
      devices: "-"
    };
  },
  componentWillMount: function() {
    this.getDevices();
  },
  getDevices: function() {
    if (this.props.deployment === "00a0c91e6-7dec-11d0-a765-f81d4faebf6") {
      this.setState({devices: 3});
    } else {
      AppActions.getSingleDeploymentDevices(this.props.deployment, function(devices) {
        // retrieve number of devices from child
        this.setState({devices: devices.length});
      }.bind(this));
    }
  },
  render: function() {
    return (
      <span>{this.state.devices}</span>
    );
  }
});

module.exports = GroupDevices;