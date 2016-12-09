import React from 'react';
var AppActions = require('../../actions/app-actions');
var pluralize = require('pluralize');

var RecentStats = React.createClass({
  getInitialState: function() {
    return {
      stats: {
        "success": 0,
        "failure": 0,
        "noartifact": 0
      }
    };
  },
  componentWillReceiveProps: function(nextProps) {
    AppActions.getSingleDeploymentStats(nextProps.id, function(stats) {
      this.setState({stats:stats});
    }.bind(this));
  },
  render: function() {
    var failures = this.state.stats.failure;
    return (
      <div className="deploymentStats">
        <div className="resultIcons">
          <img className={this.state.stats.failure ? "alert" : null} src="assets/img/largeFail.png" />
          <div>{failures}</div>
          <span className="iconStatLabel">Failed</span>
        </div>
        <div className="resultIcons">
          <img src="assets/img/largeSuccess.png" />
          <div>{this.state.stats.success}</div>
          <span className="iconStatLabel">Successful</span>
        </div>
        <div className={this.state.stats.noartifact ? "skipped-text" : "hidden"}>
          {this.state.stats.noartifact} {pluralize("devices", this.state.stats.noartifact)} {pluralize("was", this.state.stats.noartifact)} skipped
        </div>
      </div>
    );
  }
});

module.exports = RecentStats;