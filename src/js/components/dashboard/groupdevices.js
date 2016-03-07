import React from 'react';
var AppActions = require('../../actions/app-actions');

var GroupDevices = React.createClass({
  getInitialState: function() {
    return {
      devices: null 
    };
  },
  componentDidMount: function() {
    this.getDevices();
  },
  getDevices: function() {
    AppActions.getSingleUpdateDevices(this.props.update.id, function(devices) {
      // retrieve number of devices from child
      this.setState({devices:"("+ devices.length +")"});
    }.bind(this));
  },
  render: function() {
    return (
      <div>
        <span className="progress-group">{this.props.update.name} {this.state.devices}</span>
      </div>
    );
  }
});

module.exports = GroupDevices;