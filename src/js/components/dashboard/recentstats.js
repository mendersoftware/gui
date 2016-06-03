import React from 'react';
var AppActions = require('../../actions/app-actions');

var RecentStats = React.createClass({
  getInitialState: function() {
    return {
      stats: {
        "successful": 0,
        "failure": 0
      }
    };
  },
  componentDidMount: function() {
    AppActions.getSingleDeploymentStats(this.props.id, function(stats) {
      this.setState({stats:stats});
    }.bind(this));
  },
  render: function() {
    return (
      <div className="deploymentStats">
        <div>{this.state.stats.successful}</div>
        <div>{this.state.stats.failure}</div>
      </div>
    );
  }
});


module.exports = RecentStats;