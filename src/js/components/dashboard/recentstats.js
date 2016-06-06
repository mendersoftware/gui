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
        <div className="resultIcons">
          <img src="assets/img/check.png" />
          <div>{this.state.stats.successful}</div>
          <span className="iconStatLabel">Successful</span>
        </div>
        <div className="resultIcons">
          <img className={this.state.stats.failure ? "alert" : null} src="assets/img/warning.png" />
          <div>{this.state.stats.failure}</div>
          <span className="iconStatLabel">Failed</span>
          </div>
      </div>
    );
  }
});


module.exports = RecentStats;