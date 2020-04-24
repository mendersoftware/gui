import React from 'react';
import { compose, setDisplayName } from 'recompose';

// material ui
import { Button, IconButton, Tooltip } from '@material-ui/core';
import { CancelOutlined as CancelOutlinedIcon } from '@material-ui/icons';

import { groupDeploymentStats } from '../../helpers';
import RelativeTime from '../common/relative-time';
import Confirm from './confirm';
import ProgressChart from './progressChart';
import DeploymentStats from './deploymentstatus';

export const deploymentTypeClasses = {
  finished: 'past-item',
  pending: 'pending-item',
  progress: 'progress-item',
  scheduled: 'scheduled-item'
};

export const DeploymentDeviceCount = compose(setDisplayName('DeploymentDeviceCount'))(({ deployment }) => (
  <div className="align-right column-defined" key="DeploymentDeviceCount">
    {deployment.device_count}
  </div>
));
export const DeploymentDeviceGroup = compose(setDisplayName('DeploymentDeviceGroup'))(({ deployment }) => (
  <div key="DeploymentDeviceGroup">{deployment.name}</div>
));
export const DeploymentEndTime = compose(setDisplayName('DeploymentEndTime'))(({ deployment }) => (
  <RelativeTime key="DeploymentEndTime" updateTime={deployment.finished} shouldCount="none" />
));
export const DeploymentPhases = compose(setDisplayName('DeploymentPhases'))(({ deployment }) => (
  <div key="DeploymentPhases">{deployment.phases ? deployment.phases.length : '-'}</div>
));
export const DeploymentProgress = compose(setDisplayName('DeploymentProgress'))(({ deployment, groupedStats }) => (
  <ProgressChart
    key="DeploymentProgress"
    created={deployment.created}
    currentPendingCount={groupedStats.pending}
    currentProgressCount={groupedStats.current}
    id={deployment.id}
    phases={deployment.phases}
    status={deployment.status}
    totalSuccessCount={groupedStats.successes}
    totalDeviceCount={deployment.device_count}
    totalFailureCount={groupedStats.failures}
  />
));
export const DeploymentRelease = compose(setDisplayName('DeploymentRelease'))(({ deployment }) => (
  <div key="DeploymentRelease">{deployment.artifact_name}</div>
));
export const DeploymentStartTime = compose(setDisplayName('DeploymentStartTime'))(({ started, direction = 'both' }) => (
  <RelativeTime key="DeploymentStartTime" updateTime={started} shouldCount={direction} />
));

export const DeploymentStatus = compose(setDisplayName('DeploymentStatus'))(({ deployment }) => (
  <DeploymentStats key="DeploymentStatus" vertical={false} stats={deployment.stats} />
));

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
    const self = this;
    setTimeout(() => self.setState({ abort: self.state.abort ? null : id }), 150);
  }

  render() {
    const self = this;
    const { columnHeaders, deployment, isEnterprise, openReport, type } = self.props;
    const { abort } = self.state;
    const groupedStats = groupDeploymentStats(deployment.stats || {});
    const { created, id, phases } = deployment;

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
    return (
      <div className={`deployment-item ${deploymentTypeClasses[type]}`}>
        {!!confirmation && confirmation}
        {columnHeaders.map(column =>
          column.renderer({ ...self.props, deployment, started, groupedStats: { ...groupedStats, current: groupedStats.inprogress }, ...column.props })
        )}
        <Button
          variant="contained"
          onClick={() => openReport(type, deployment.id)}
          style={{ justifySelf: 'center', backgroundColor: 'transparent', textTransform: 'none' }}
        >
          View details
        </Button>
        {type !== 'finished' && (
          <Tooltip className="columnHeader" title="Abort" placement="top-start">
            <IconButton onClick={() => self.toggleConfirm(id)}>
              <CancelOutlinedIcon className="cancelButton muted" />
            </IconButton>
          </Tooltip>
        )}
      </div>
    );
  }
}
