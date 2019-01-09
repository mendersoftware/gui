import React from 'react';
var AppActions = require('../../actions/app-actions');
var pluralize = require('pluralize');
var createReactClass = require('create-react-class');

var RecentStats = createReactClass({
  getInitialState: function() {
    return {
      stats: {
        success: 0,
        failure: 0,
        noartifact: 0,
        aborted: 0,
        decommissioned: 0
      }
    };
  },
  componentDidMount() {
    this._refreshStats();
  },
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this._refreshStats();
    }
  },
  _refreshStats: function() {
    var self = this;
    AppActions.getSingleDeploymentStats(
      self.props.id,
      function(stats) {
        self.setState({ stats: stats });
      }.bind(this)
    );
  },
  render: function() {
    var skipped = this.state.stats.noartifact + this.state.stats.aborted + this.state.stats.decommissioned + this.state.stats['already-installed'];
    return (
      <div className="deploymentStats">
        <div className="resultIcons">
          <img className={this.state.stats.failure ? 'alert' : null} src="assets/img/largeFail.png" />
          <div>{this.state.stats.failure}</div>
          <span className="iconStatLabel">Failed</span>
        </div>
        <div className="resultIcons">
          <img src="assets/img/largeSuccess.png" />
          <div>{this.state.stats.success}</div>
          <span className="iconStatLabel">Successful</span>
        </div>
        {skipped ? (
          <div className="skipped-text">
            {skipped} {pluralize('devices', skipped)} {pluralize('was', skipped)} skipped
          </div>
        ) : null}
      </div>
    );
  }
});

module.exports = RecentStats;
