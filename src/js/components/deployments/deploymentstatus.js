import React from 'react';
// material ui
var mui = require('material-ui');
var FlatButton = mui.FlatButton;

var AppActions = require('../../actions/app-actions');

var DeploymentStatus = React.createClass({
  getInitialState: function() {
    return {
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
    AppActions.getSingleDeploymentStats(this.props.id, function(stats) {
      this.setState({stats:stats});
    }.bind(this));
  },
  render: function() {
    var label = ( 
      <div>
        <span style={{marginRight:"4"}}>{this.state.stats.failure} failed</span>
        <span style={{marginRight:"4"}}>{this.state.stats.successful} successful</span>
        <span className={this.state.stats.pending ? null : "hidden" }>{this.state.stats.pending} pending</span>
      </div>
    );
    return (
      <div>
        <FlatButton label={label} primary={this.state.stats.failure} secondary={this.state.stats.successful} />
      </div>
    );
  }
});

module.exports = DeploymentStatus;