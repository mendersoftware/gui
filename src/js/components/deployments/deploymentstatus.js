import React from 'react';

const defaultStats = {
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
};

export default class DeploymentStatus extends React.PureComponent {
  componentDidUpdate(prevProps) {
    var self = this;
    if (prevProps.id !== self.props.id) {
      self.props.refreshStatus(self.props.id);
    }
    if (!self.props.isActiveTab) {
      clearInterval(self.timer);
    }
    // isActive has changed
    if (!prevProps.isActiveTab && self.props.isActiveTab && self.props.refresh) {
      self.timer = setInterval(() => self.props.refreshStatus(self.props.id), 10000);
    }
    if (
      prevProps.stats !== self.props.stats &&
      self.props.stats &&
      self.props.stats.downloading + self.props.stats.installing + self.props.stats.rebooting + self.props.stats.pending <= 0
    ) {
      // if no more devices in "progress" statuses, send message to parent that it's finished
      clearInterval(self.timer);
      self.props.setFinished(true);
    }
  }
  componentDidMount() {
    var self = this;
    if (self.props.refresh) {
      self.timer = setInterval(() => self.props.refreshStatus(self.props.id), 10000);
    }
    self.props.refreshStatus(self.props.id);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    let { stats } = this.props;
    stats = stats ? stats : defaultStats;
    var inprogress = stats.downloading + stats.installing + stats.rebooting;
    var failed = stats.failure;
    var skipped = stats.aborted + stats.noartifact + stats['already-installed'] + stats.decommissioned;

    const phases = [
      { title: 'Skipped', value: skipped, className: 'skipped' },
      { title: 'Pending', value: stats.pending, className: 'pending' },
      { title: 'In progress', value: inprogress, className: 'inprogress' },
      { title: 'Successful', value: stats.success, className: 'success' },
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
