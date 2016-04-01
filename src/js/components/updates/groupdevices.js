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
    if (this.props.update === "00a0c91e6-7dec-11d0-a765-f81d4faebf6") {
      console.log("yes");
        this.setState({devices: 3});
    } else {
      AppActions.getSingleUpdateDevices(this.props.update, function(devices) {
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