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
  componentWillReceiveProps(nextProps) {
    var self = this;
    if (nextProps.id !== this.props.id) {
      this.props.refreshStatus(nextProps.id);
    }
    if (!nextProps.isActiveTab) {
      clearInterval(this.timer);
    }
    // isActive has changed
    if (nextProps.isActiveTab && !self.props.isActiveTab && self.props.refresh) {
      self.timer = setInterval(() => {
        self.props.refreshStatus(self.props.id);
      }, 10000);
    }
    if (
      nextProps.stats !== self.props.stats &&
      nextProps.stats &&
      nextProps.stats.downloading + nextProps.stats.installing + nextProps.stats.rebooting + nextProps.stats.pending <= 0
    ) {
      // if no more devices in "progress" statuses, send message to parent that it's finished
      clearInterval(self.timer);
      self.props.setFinished(true);
    }
  }
  componentDidMount() {
    var self = this;
    if (self.props.refresh) {
      self.timer = setInterval(() => {
        self.props.refreshStatus(self.props.id);
      }, 10000);
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
