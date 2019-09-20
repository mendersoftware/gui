import React from 'react';
import Time from 'react-time';

// material ui
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';

import Confirm from './confirm';
import ProgressChart from './progressChart';
import { formatTime } from '../../helpers';
import AppActions from '../../actions/app-actions';

export default class DeploymentItem extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      stats: {
        downloading: 0,
        decommissioned: 0,
        failure: 0,
        installing: 0,
        noartifact: 0,
        pending: 0,
        rebooting: 0,
        success: 0,
        'already-installed': 0
      }
    };
  }

  // get statistics for each in progress
  componentDidMount() {
    this.timer = setInterval(() => this.refreshDeploymentDevices(), 30000);
    this.refreshDeploymentDevices();
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  refreshDeploymentDevices() {
    const self = this;
    return AppActions.getSingleDeploymentStats(self.props.deployment.id).then(stats => self.setState({ stats }));
  }

  handleAbort(id) {
    this.props.abort(id);
  }
  toggleConfirm(id) {
    var self = this;
    setTimeout(() => {
      self.setState({ abort: self.state.abort ? null : id });
    }, 150);
  }

  render() {
    const self = this;
    const { deployment, openReport, index, type, columnHeaders } = self.props;
    const { abort, stats } = self.state;
    const current = stats.downloading + stats.installing + stats.rebooting + stats.success;
    const failures = stats.failure + stats.aborted + stats.noartifact + stats['already-installed'] + stats.decommissioned;

    const { artifact_name, name, created, device_count, id, status } = deployment;

    let abortButton = (
      <Tooltip className="columnHeader" title="Abort" placement="top-start">
        <IconButton onClick={() => self.toggleConfirm(id)}>
          <CancelOutlinedIcon className="cancelButton muted" />
        </IconButton>
      </Tooltip>
    );
    if (abort === id) {
      abortButton = <Confirm cancel={() => self.toggleConfirm(id)} action={() => self.handleAbort(id)} table={true} type="abort" />;
    }
    return (
      <div className={`deployment-item deployment-active-item ${type === 'progress' ? 'progress-item' : ''}`}>
        <div className={columnHeaders[0].class}>{artifact_name}</div>
        <div className={columnHeaders[1].class}>{name}</div>
        <Time className={columnHeaders[2].class} value={formatTime(created)} format="YYYY-MM-DD HH:mm" />
        <div className={columnHeaders[3].class}>{device_count}</div>
        {type === 'progress' ? (
          <div className={`flexbox space-between centered ${columnHeaders[4].class}`}>
            <ProgressChart current={current} total={device_count} failures={failures} id={id} />
            <Button variant="contained" onClick={() => openReport(index, type)}>
              View details
            </Button>
            {abortButton}
          </div>
        ) : (
          <div className={`flexbox space-between centered ${columnHeaders[4].class}`}>
            <div>{status}</div>
            {abortButton}
          </div>
        )}
      </div>
    );
  }
}
