import React from 'react';
import AppActions from '../../actions/app-actions';
import pluralize from 'pluralize';

export default class RecentStats extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      stats: {
        success: 0,
        failure: 0,
        noartifact: 0,
        aborted: 0,
        decommissioned: 0
      }
    };
  }
  componentDidMount() {
    this._refreshStats();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this._refreshStats();
    }
  }
  _refreshStats() {
    var self = this;
    return AppActions.getSingleDeploymentStats(self.props.id).then(stats => self.setState({ stats }));
  }
  render() {
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
}
