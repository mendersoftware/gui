import React from 'react';
var createReactClass = require('create-react-class');
var AppActions = require('../../actions/app-actions');

var GroupDevices = createReactClass({
  getInitialState: function() {
    return {
      devices: "-"
    };
  },
  componentWillMount: function() {
    this.getDevices();
  },
  getDevices: function() {
    AppActions.getSingleDeploymentDevices(this.props.deployment, function(devices) {
      // retrieve number of devices from child
      this.setState({devices: devices.length});
    }.bind(this));
  },
  render: function() {
    return (
      <span>{this.state.devices}</span>
    );
  }
});

module.exports = GroupDevices;