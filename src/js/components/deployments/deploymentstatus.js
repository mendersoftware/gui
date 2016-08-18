import React from 'react';
// material ui
var mui = require('material-ui');
var FlatButton = mui.FlatButton;

var AppActions = require('../../actions/app-actions');

var DeploymentStatus = React.createClass({
  getInitialState: function() {
    return {
      stats: {
        "success": 0,
        "pending": 0,
        "failure": 0,
        "downloading": 0,
        "installing": 0,
        "rebooting": 0,
        "noimage": 0
      }
    };
  },
  componentDidMount: function() {
    AppActions.getSingleDeploymentStats(this.props.id, function(stats) {
      this.setState({stats:stats});
    }.bind(this));
  },
  render: function() {
    var inprogress = this.state.stats.downloading + this.state.stats.installing + this.state.stats.rebooting;
    var finished = this.state.stats.success + this.state.stats.failure + this.state.stats.noimage;
    var failed = this.state.stats.failure + this.state.stats.noimage;
    var label = ( 
      <div className="results-status">
        <div className={failed ? "hint--bottom" : "hidden"} aria-label="Failures">
          <span className={"status failure"}>{failed}</span>
        </div>
        <div className={this.state.stats.pending ? "hint--bottom" : "hidden"} aria-label="Pending">
          <span className={"status pending"}>{this.state.stats.pending}</span>
        </div>
        <div className={inprogress ? "hint--bottom" : "hidden"} aria-label="In progress"> 
          <span className={"status inprogress"}>{inprogress}</span>
        </div>
        <div className={this.state.stats.success ? "hint--bottom" : "hidden"} aria-label="Successful">
          <span className="status success">{this.state.stats.success}</span>
        </div>
      </div>
    );
    return (
      <div>
        {label}
      </div>
    );
  }
});

module.exports = DeploymentStatus;