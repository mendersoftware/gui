import React from 'react';

// material ui
import { Button, IconButton, Tooltip } from '@material-ui/core';
import { CancelOutlined as CancelOutlinedIcon } from '@material-ui/icons';

import ProgressChart from './progressChart';
import { groupDeploymentStats } from '../../helpers';
import Confirm from '../common/confirm';
import RelativeTime from '../common/relative-time';

const deploymentTypeClasses = {
  past: 'past-item',
  pending: 'pending-item',
  progress: 'progress-item'
};

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
    const { columnHeaders, deployment, index, isEnterprise, openReport, type } = self.props;
    const { abort } = self.state;
    const { inprogress: current, failures, pending, successes } = groupDeploymentStats(deployment.stats || {});

    const { artifact_name, name, created, device_count, id, status, phases } = deployment;

    let confirmation;
    if (abort === id) {
      confirmation = (
        <Confirm
          classes="flexbox centered confirmation-overlay"
          cancel={() => self.toggleConfirm(id)}
          action={() => self.handleAbort(id)}
          table={true}
          type="abort"
        />
      );
    }
    const started = isEnterprise && phases && phases.length >= 1 ? phases[0].start_ts || created : created;
    const isInProgress = type === 'progress';
    return (
      <div className={`deployment-item ${deploymentTypeClasses[type]}`}>
        {!!confirmation && confirmation}
        <div className={columnHeaders[0].class}>{artifact_name}</div>
        <div className={columnHeaders[1].class}>{name}</div>
        <RelativeTime className={columnHeaders[2].class} updateTime={started} shouldCount={isInProgress ? 'both' : 'up'} />
        <div className={columnHeaders[3].class}>{device_count}</div>
        {isInProgress ? (
          <>
            <ProgressChart
              className={columnHeaders[4].class}
              currentPendingCount={pending}
              currentProgressCount={current}
              totalSuccessCount={successes}
              totalDeviceCount={device_count}
              totalFailureCount={failures}
              phases={phases}
              created={created}
              id={id}
            />
            <Button className={columnHeaders[5].class} variant="contained" onClick={() => openReport(index, type)} style={{ justifySelf: 'center' }}>
              View details
            </Button>
          </>
        ) : (
          <>
            <div className={`flexbox space-between centered ${columnHeaders[4].class}`}>{status}</div>
            <div className={columnHeaders[5].class} />
          </>
        )}
        <Tooltip className={`columnHeader ${columnHeaders[6].class}`} title="Abort" placement="top-start">
          <IconButton onClick={() => self.toggleConfirm(id)}>
            <CancelOutlinedIcon className="cancelButton muted" />
          </IconButton>
        </Tooltip>
      </div>
    );
  }
}
