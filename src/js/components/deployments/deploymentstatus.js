import React from 'react';
// material ui
import FlatButton from 'material-ui/FlatButton';

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
        "noartifact": 0
      }
    };
  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.id!==this.props.id) this.refreshStatus(nextProps.id);
  },
  componentDidMount: function() {
    var self = this;
    if (self.props.refresh) {
      self.timer = setInterval(function() {
        self.refreshStatus(self.props.id);
      },5000);
    }
    self.refreshStatus(self.props.id)
  },
  componentWillUnmount: function() {
    clearInterval(this.timer);
  },
  refreshStatus: function(id) {
    var self = this;
    AppActions.getSingleDeploymentStats(id, function(stats) {
      self.setState({stats:stats});
      if (stats.downloading + stats.installing + stats.rebooting === 0) {
        if (typeof self.props.setFinished !== "undefined") self.props.setFinished(true);
      }
    });
  },
  render: function() {
    var inprogress = this.state.stats.downloading + this.state.stats.installing + this.state.stats.rebooting;
    var failed = this.state.stats.failure;
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
          <span className="status success">{this.state.stats.success}</span><span className={this.props.vertical ? "label":"hidden"}>Successful</span>
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