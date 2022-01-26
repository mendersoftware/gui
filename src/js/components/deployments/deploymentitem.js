import React, { useState } from 'react';

// material ui
import { Button, IconButton, Tooltip } from '@mui/material';
import { CancelOutlined as CancelOutlinedIcon } from '@mui/icons-material';

import { DEPLOYMENT_STATES, DEPLOYMENT_TYPES } from '../../constants/deploymentConstants';
import Confirm from '../common/confirm';
import RelativeTime from '../common/relative-time';
import ProgressDisplay, { DeploymentStatusNotification } from './progressChart';
import DeploymentStats from './deploymentstatus';
import { PhaseProgressDisplay } from './deployment-report/phaseprogress';
import { getDeploymentState } from '../../helpers';

export const deploymentTypeClasses = {
  finished: 'past-item',
  pending: 'pending-item',
  progress: 'progress-item',
  scheduled: 'scheduled-item'
};

export const DeploymentDeviceCount = ({ className, deployment }) => (
  <div className={className} key="DeploymentDeviceCount">
    {Math.max(deployment.device_count || 0, deployment.max_devices || 0)}
  </div>
);
export const DeploymentDeviceGroup = props => {
  const {
    deployment: { name, type = DEPLOYMENT_TYPES.software, devices = {} }
  } = props;
  const deploymentName = type === DEPLOYMENT_TYPES.configuration ? Object.keys(devices).join(', ') : name;
  return <div key="DeploymentDeviceGroup">{deploymentName || name}</div>;
};
export const DeploymentEndTime = ({ deployment }) => <RelativeTime key="DeploymentEndTime" updateTime={deployment.finished} shouldCount="none" />;
export const DeploymentPhases = ({ deployment }) => <div key="DeploymentPhases">{deployment.phases ? deployment.phases.length : '-'}</div>;
export const DeploymentProgress = ({ deployment }) => {
  const { phases = [], update_control_map } = deployment;
  const status = getDeploymentState(deployment);
  if (status === 'queued') {
    return <DeploymentStatusNotification status={status} />;
  } else if (phases.length > 1 || !update_control_map) {
    return <ProgressDisplay key="DeploymentProgress" deployment={deployment} status={status} />;
  }
  return <PhaseProgressDisplay key="DeploymentProgress" deployment={deployment} status={status} />;
};
export const DeploymentRelease = props => {
  const {
    deployment: { artifact_name, type = DEPLOYMENT_TYPES.software }
  } = props;
  const deploymentRelease = type === DEPLOYMENT_TYPES.configuration ? type : artifact_name;
  return <div key="DeploymentRelease">{deploymentRelease}</div>;
};
export const DeploymentStartTime = ({ direction = 'both', started }) => <RelativeTime key="DeploymentStartTime" updateTime={started} shouldCount={direction} />;

export const DeploymentStatus = ({ deployment }) => <DeploymentStats key="DeploymentStatus" vertical={false} deployment={deployment} />;

export const DeploymentItem = ({ abort: abortDeployment, columnHeaders, deployment, isEnterprise, openReport, type }) => {
  const [abort, setAbort] = useState(null);

  const toggleConfirm = id => {
    setTimeout(() => setAbort(abort ? null : id), 150);
  };
  const { created, id, phases } = deployment;

  let confirmation;
  if (abort === id) {
    confirmation = <Confirm classes="flexbox centered confirmation-overlay" cancel={() => toggleConfirm(id)} action={() => abortDeployment(id)} type="abort" />;
  }
  const started = isEnterprise && phases && phases.length >= 1 ? phases[0].start_ts || created : created;
  return (
    <div className={`deployment-item ${deploymentTypeClasses[type]}`}>
      {!!confirmation && confirmation}
      {columnHeaders.map((column, i) => {
        const ColumnComponent = column.renderer;
        return (
          <div className={column.class} key={`deploy-item-${i}`}>
            {column.title && <span className="deployment-item-title text-muted">{column.title}</span>}
            <ColumnComponent {...self.props} className={column.class || ''} deployment={deployment} started={started} {...column.props} />
          </div>
        );
      })}
      <Button
        variant="contained"
        onClick={() => openReport(type, deployment.id)}
        style={{ justifySelf: 'center', backgroundColor: 'transparent', textTransform: 'none' }}
      >
        View details
      </Button>
      {type !== DEPLOYMENT_STATES.finished && (
        <Tooltip className="columnHeader" title="Abort" placement="top-start">
          <IconButton onClick={() => toggleConfirm(id)} size="large">
            <CancelOutlinedIcon className="cancelButton muted" />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default DeploymentItem;
