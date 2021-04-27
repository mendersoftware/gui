import React, { useState } from 'react';
import { compose, setDisplayName } from 'recompose';

// material ui
import { Button, IconButton, Tooltip } from '@material-ui/core';
import { CancelOutlined as CancelOutlinedIcon } from '@material-ui/icons';

import { DEPLOYMENT_STATES, DEPLOYMENT_TYPES } from '../../constants/deploymentConstants';
import Confirm from '../common/confirm';
import RelativeTime from '../common/relative-time';
import ProgressChart from './progressChart';
import DeploymentStats from './deploymentstatus';

export const deploymentTypeClasses = {
  finished: 'past-item',
  pending: 'pending-item',
  progress: 'progress-item',
  scheduled: 'scheduled-item'
};

export const DeploymentDeviceCount = compose(setDisplayName('DeploymentDeviceCount'))(({ className, deployment }) => (
  <div className={className} key="DeploymentDeviceCount">
    {Math.max(deployment.device_count, deployment.max_devices || 0)}
  </div>
));
export const DeploymentDeviceGroup = compose(setDisplayName('DeploymentDeviceGroup'))(props => {
  const {
    deployment: { name, type = DEPLOYMENT_TYPES.software, devices = {} }
  } = props;
  const deploymentName = type === DEPLOYMENT_TYPES.configuration ? Object.keys(devices).join(', ') : name;
  return <div key="DeploymentDeviceGroup">{deploymentName || name}</div>;
});
export const DeploymentEndTime = compose(setDisplayName('DeploymentEndTime'))(({ deployment }) => (
  <RelativeTime key="DeploymentEndTime" updateTime={deployment.finished} shouldCount="none" />
));
export const DeploymentPhases = compose(setDisplayName('DeploymentPhases'))(({ deployment }) => (
  <div key="DeploymentPhases">{deployment.phases ? deployment.phases.length : '-'}</div>
));
export const DeploymentProgress = compose(setDisplayName('DeploymentProgress'))(({ deployment }) => (
  <ProgressChart key="DeploymentProgress" deployment={deployment} />
));
export const DeploymentRelease = compose(setDisplayName('DeploymentRelease'))(props => {
  const {
    deployment: { artifact_name, type = DEPLOYMENT_TYPES.software }
  } = props;
  const deploymentRelease = type === DEPLOYMENT_TYPES.configuration ? type : artifact_name;
  return <div key="DeploymentRelease">{deploymentRelease}</div>;
});
export const DeploymentStartTime = compose(setDisplayName('DeploymentStartTime'))(({ direction = 'both', started }) => (
  <RelativeTime key="DeploymentStartTime" updateTime={started} shouldCount={direction} />
));

export const DeploymentStatus = compose(setDisplayName('DeploymentStatus'))(({ deployment }) => (
  <DeploymentStats key="DeploymentStatus" vertical={false} deployment={deployment} />
));

export const DeploymentItem = ({ abort: abortDeployment, columnHeaders, deployment, isEnterprise, openReport, type }) => {
  const [abort, setAbort] = useState(null);

  const toggleConfirm = id => {
    setTimeout(() => setAbort(abort ? null : id), 150);
  };
  const { created, id, phases } = deployment;

  let confirmation;
  if (abort === id) {
    confirmation = (
      <Confirm
        classes="flexbox centered confirmation-overlay"
        cancel={() => self.toggleConfirm(id)}
        action={() => abortDeployment(id)}
        table={true}
        type="abort"
      />
    );
  }
  const started = isEnterprise && phases && phases.length >= 1 ? phases[0].start_ts || created : created;
  return (
    <div className={`deployment-item ${deploymentTypeClasses[type]}`}>
      {!!confirmation && confirmation}
      {columnHeaders.map((column, i) => (
        <div className={column.class} key={`deploy-item-${i}`}>
          {column.title && <span className="deployment-item-title text-muted">{column.title}</span>}
          {column.renderer({
            ...self.props,
            className: column.class || '',
            deployment,
            started,
            ...column.props
          })}
        </div>
      ))}
      <Button
        variant="contained"
        onClick={() => openReport(type, deployment.id)}
        style={{ justifySelf: 'center', backgroundColor: 'transparent', textTransform: 'none' }}
      >
        View details
      </Button>
      {type !== DEPLOYMENT_STATES.finished && (
        <Tooltip className="columnHeader" title="Abort" placement="top-start">
          <IconButton onClick={() => toggleConfirm(id)}>
            <CancelOutlinedIcon className="cancelButton muted" />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default DeploymentItem;
