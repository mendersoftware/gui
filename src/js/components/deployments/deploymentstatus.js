import React from 'react';

import AppActions from '../../actions/app-actions';

export default class DeploymentStatus extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      stats: {
        success: 0,
        decommissioned: 0,
        pending: 0,
        failure: 0,
        downloading: 0,
        installing: 0,
        rebooting: 0,
        noartifact: 0,
        aborted: 0,
        'already-installed': 0
      }
    };
  }
  componentWillReceiveProps(nextProps) {
    var self = this;
    if (nextProps.id !== this.props.id) this.refreshStatus(nextProps.id);
    if (!nextProps.isActiveTab) {
      clearInterval(this.timer);
    }

    if (nextProps.isActiveTab && !self.props.isActiveTab) {
      // isActive has changed
      if (self.props.refresh) {
        self.timer = setInterval(() => {
          self.refreshStatus(self.props.id);
        }, 10000);
      }
    }
  }
  componentDidMount() {
    var self = this;
    if (self.props.refresh) {
      self.timer = setInterval(() => {
        self.refreshStatus(self.props.id);
      }, 10000);
    }
    self.refreshStatus(self.props.id);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  refreshStatus(id) {
    var self = this;
    return AppActions.getSingleDeploymentStats(id).then(stats => {
      self.setState({ stats });
      if (stats.downloading + stats.installing + stats.rebooting + stats.pending <= 0) {
        // if no more devices in "progress" statuses, send message to parent that it's finished
        clearInterval(self.timer);
        self.props.setFinished(true);
      }
    });
  }
  render() {
    var inprogress = this.state.stats.downloading + this.state.stats.installing + this.state.stats.rebooting;
    var failed = this.state.stats.failure;
    var skipped = this.state.stats.aborted + this.state.stats.noartifact + this.state.stats['already-installed'] + this.state.stats.decommissioned;

    const phases = [
      { title: 'Skipped', value: skipped, className: 'skipped' },
      { title: 'Pending', value: this.state.stats.pending, className: 'pending' },
      { title: 'In progress', value: inprogress, className: 'inprogress' },
      { title: 'Successful', value: this.state.stats.success, className: 'success' },
      { title: 'Failed', value: failed, className: 'failure' }
    ];
    return (
      <div>
        <div className={this.props.vertical ? 'results-status vertical' : 'results-status'}>
          {phases.map(phase => (
            <div key={phase.className} className={phase.value ? 'hint--bottom' : 'hint--bottom disabled'} aria-label={phase.title}>
              <span className={`status ${phase.className}`}>{(phase.value || 0).toLocaleString()}</span>
              {this.props.vertical && <span className="label">{phase.title}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
