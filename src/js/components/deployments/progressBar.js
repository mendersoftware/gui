import React from 'react';
var AppActions = require('../../actions/app-actions');

// material ui
var mui = require('material-ui');


var ProgressBar = React.createClass({
  getInitialState: function() {
    return {
      devices: [],
      stats: {
        "successful": 0,
        "pending": 0,
        "inprogress": 0,
        "failure": 0,
        "noimage": 0
      }
    };
  },
  componentDidMount: function() {
    AppActions.getSingleDeploymentStats(this.props.deployment.id, function(stats) {
      this.setState({stats:stats});
    }.bind(this));
    AppActions.getSingleDeploymentDevices(this.props.deployment.id, function(devices) {
      this.setState({devices: devices});
      this.props.getDevices(devices.length, this.props.index);
    }.bind(this));
  },
  _handleClick: function() {
    
  },
  _sendUpPercentage: function(per) {
    this.props.gotPercent(per);
  },  
  render: function() {
    // used for MOCK API because devices.length does not equal stats length
    var totalDevices = this.state.stats.successful + this.state.stats.failure + this.state.stats.inprogress + this.state.stats.pending;

    var success = this.state.stats.successful;
    var failures = this.state.stats.failure;
    var progress = this.state.stats.inprogress;

    var progressBar = (
      <div>
        <div>
          <div className="green">{success}</div>
          <div className="red">{failures}</div>
          <div className="grey">{progress}</div>
        </div>
       
      </div>
    );
    return (
      <div>
        {progressBar}
      </div>
    );
  }
});

module.exports = ProgressBar;