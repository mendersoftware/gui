import React from 'react';
var AppActions = require('../../actions/app-actions');

var RecentStats = React.createClass({
  getInitialState: function() {
    return {
      stats: {
        "success": 0,
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
        <div className="resultIcons">
          <img className={this.state.stats.failure ? "alert" : null} src="assets/img/warning.png" />
          <div>{this.state.stats.failure + this.state.stats.noimage}</div>
          <span className="iconStatLabel">Failed</span>
        </div>
        <div className="resultIcons">
          <img src="assets/img/check.png" />
          <div>{this.state.stats.success}</div>
          <span className="iconStatLabel">Successful</span>
        </div>
      </div>
    );
  }
});


module.exports = RecentStats;