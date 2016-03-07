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
    AppActions.getSingleUpdateStats(this.props.update.id, function(stats) {
      this.setState({stats:stats});
    }.bind(this));
    AppActions.getSingleUpdateDevices(this.props.update.id, function(devices) {
      this.setState({devices: devices});
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

    var success = ((this.state.stats.successful / totalDevices)*100).toFixed(0);
    var failures = ((this.state.stats.failure / totalDevices)*100).toFixed(0);
    var progress = ((this.state.stats.inprogress / totalDevices)*100).toFixed(0);
    var percentDone = Number(success) + Number(failures);

    var progressBar = (
      <div className={this.props.noPadding ? "tableBar progressBar" : "progressBar"}>
        <div className="lightgrey">
          <div className="green float-left" style={{width:success +"%"}}></div>
          <div className="red float-left" style={{width:failures +"%"}}></div>
          <div className="grey float-left" style={{width:progress+"%"}}></div>
        </div>
        <div className="percentage">
          <span>{percentDone || 0}%</span>
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