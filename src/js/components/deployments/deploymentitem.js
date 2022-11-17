import React, { useState } from 'react';

// material ui
import { Button, IconButton, Tooltip } from '@mui/material';
import { CancelOutlined as CancelOutlinedIcon } from '@mui/icons-material';

import { DEPLOYMENT_STATES, DEPLOYMENT_TYPES } from '../../constants/deploymentConstants';
import Confirm from '../common/confirm';
import { RelativeTime } from '../common/time';
import ProgressDisplay, { DeploymentStatusNotification } from './progressChart';
import DeploymentStats from './deploymentstatus';
import { PhaseProgressDisplay } from './deployment-report/phaseprogress';
import { getDeploymentState } from '../../helpers';
import { makeStyles } from 'tss-react/mui';

export const deploymentTypeClasses = {
  [DEPLOYMENT_STATES.finished]: 'past-item',
  [DEPLOYMENT_STATES.pending]: 'pending-item',
  [DEPLOYMENT_STATES.inprogress]: 'progress-item',
  [DEPLOYMENT_STATES.scheduled]: 'scheduled-item'
};

export const DeploymentDeviceCount = ({ className, deployment }) => (
  <div className={className} key="DeploymentDeviceCount">
    {Math.max(deployment.device_count || 0, deployment.max_devices || 0)}
  </div>
);
export const DeploymentDeviceGroup = ({ deployment: { name, type = DEPLOYMENT_TYPES.software, devices = {} }, wrappingClass }) => {
  const deploymentName = (type === DEPLOYMENT_TYPES.configuration ? Object.keys(devices).join(', ') : name) || name;
  return (
    <div className={wrappingClass} key="DeploymentDeviceGroup" title={deploymentName}>
      {deploymentName}
    </div>
  );
};
export const DeploymentEndTime = ({ deployment }) => <RelativeTime key="DeploymentEndTime" updateTime={deployment.finished} shouldCount="none" />;
export const DeploymentPhases = ({ deployment }) => <div key="DeploymentPhases">{deployment.phases ? deployment.phases.length : '-'}</div>;
export const DeploymentProgress = ({ deployment, minimal = false }) => {
  const { phases = [], update_control_map } = deployment;
  const status = getDeploymentState(deployment);
  if (status === 'queued') {
    return <DeploymentStatusNotification status={status} />;
  } else if (phases.length > 1 || !update_control_map) {
    return <ProgressDisplay key="DeploymentProgress" deployment={deployment} status={status} minimal={minimal} />;
  }
  return <PhaseProgressDisplay key="DeploymentProgress" deployment={deployment} status={status} minimal={minimal} />;
};
export const DeploymentRelease = ({ deployment: { artifact_name, type = DEPLOYMENT_TYPES.software }, wrappingClass }) => {
  const deploymentRelease = type === DEPLOYMENT_TYPES.configuration ? type : artifact_name;
  return (
    <div className={wrappingClass} key="DeploymentRelease" title={deploymentRelease}>
      {deploymentRelease}
    </div>
  );
};
export const DeploymentStartTime = ({ direction = 'both', started }) => <RelativeTime key="DeploymentStartTime" updateTime={started} shouldCount={direction} />;

export const DeploymentStatus = ({ deployment }) => <DeploymentStats key="DeploymentStatus" deployment={deployment} />;

const useStyles = makeStyles()(theme => ({
  detailsButton: {
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    justifySelf: 'center',
    textTransform: 'none',
    [`&:hover`]: {
      backgroundColor: 'transparent',
      color: theme.palette.text.primary
    }
  },
  textWrapping: { whiteSpace: 'initial' }
}));

export const DeploymentItem = ({ abort: abortDeployment, canConfigure, canDeploy, columnHeaders, deployment, isEnterprise, openReport, type }) => {
  const [abort, setAbort] = useState(null);
  const { classes } = useStyles();

  const toggleConfirm = id => {
    setTimeout(() => setAbort(abort ? null : id), 150);
  };
  const { created, id, phases } = deployment;

  let confirmation;
  if (abort === id) {
    confirmation = <Confirm classes="flexbox centered confirmation-overlay" cancel={() => toggleConfirm(id)} action={() => abortDeployment(id)} type="abort" />;
  }
  const started = isEnterprise && phases?.length >= 1 ? phases[0].start_ts || created : created;
  const wrappingClass = `text-overflow ${type === DEPLOYMENT_STATES.inprogress ? classes.textWrapping : ''}`;
  return (
    <div className={`deployment-item ${deploymentTypeClasses[type]}`}>
      {!!confirmation && confirmation}
      {columnHeaders.map((column, i) => {
        const ColumnComponent = column.renderer;
        return (
          <div className={column.class} key={`deploy-item-${i}`}>
            {column.title && <span className="deployment-item-title muted">{column.title}</span>}
            <ColumnComponent className={column.class || ''} deployment={deployment} started={started} wrappingClass={wrappingClass} {...column.props} />
          </div>
        );
      })}
      <Button className={classes.detailsButton} variant="contained" onClick={() => openReport(type, deployment.id)}>
        View details
      </Button>
      {(canDeploy || (canConfigure && deployment.type === DEPLOYMENT_TYPES.configuration)) && type !== DEPLOYMENT_STATES.finished && (
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
