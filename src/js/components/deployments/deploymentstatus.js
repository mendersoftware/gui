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
      <div className={this.props.vertical ? "results-status vertical" : "results-status"}>
        <div className={failed ? "hint--bottom" : "hint--bottom disabled"} aria-label="Failures">
          <span className={"status failure"}>{failed}</span><span className={this.props.vertical ? "label":"hidden"}>Failed</span>
        </div>
        <div className={this.state.stats.pending ? "hint--bottom" : "hint--bottom disabled"} aria-label="Pending">
          <span className={"status pending"}>{this.state.stats.pending}</span><span className={this.props.vertical ? "label":"hidden"}>Pending</span>
        </div>
        <div className={inprogress ? "hint--bottom" : "hint--bottom disabled"} aria-label="In progress"> 
          <span className={"status inprogress"}>{inprogress}</span><span className={this.props.vertical ? "label":"hidden"}>In progress</span>
        </div>
        <div className={this.state.stats.success ? "hint--bottom" : "hint--bottom disabled"} aria-label="Successful">
          <span className="status success">{this.state.stats.success}</span><span className={this.props.vertical ? "label":"hidden"}>Success</span>
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