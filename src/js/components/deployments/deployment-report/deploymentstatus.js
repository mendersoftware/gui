import React from 'react';
import { TwoColumnData } from '../../common/configurationobject';
import { defaultColumnDataProps } from '../report';
import { deploymentDisplayStates, pauseMap } from '../../../constants/deploymentConstants';
import { groupDeploymentStats } from '../../../helpers';

export const DeploymentStatus = ({ className = '', deployment = {} }) => {
  const { finished, max_devices, retries = 1, status = 'pending', stats } = deployment;
  const phaseStats = groupDeploymentStats(deployment, true);

  let statusDescription = (
    <>
      {deploymentDisplayStates[status]}
      {status === 'pending' ? ' (awaiting devices)' : ''}
    </>
  );
  if (finished) {
    statusDescription = <div>Finished {!!phaseStats.failure && <span className="failures">with failures</span>}</div>;
  } else if (status === 'paused' && phaseStats.paused > 0) {
    // based on the order of the possible pause states we find the furthest possible and use that as the current pause state - if applicable
    const currentPauseState = Object.keys(pauseMap)
      .reverse()
      .find(key => stats[key] > 0);
    statusDescription = (
      <>
        {deploymentDisplayStates[status]} ({pauseMap[currentPauseState].title})
      </>
    );
  }

  const statsBasedDeviceCount = Object.values(phaseStats).reduce((sum, count) => sum + count, 0);
  // eslint-disable-next-line no-unused-vars
  const { failure, finished: finishedDeployment, scheduled, success, ...phasesWithStats } = deploymentDisplayStates;

  return (
    <div className={`progressStatus flexbox space-between centered margin-bottom ${className}`}>
      <div className="flexbox column">
        <div className="text-muted">Status</div>
        <h3 className="margin-bottom-none text-muted">{statusDescription}</h3>
      </div>
      <div className="flexbox space-between align-right" style={{ minWidth: '40%' }}>
        <div className="flexbox column">
          <div className="text-muted margin-bottom-small"># devices</div>
          <div>{statsBasedDeviceCount}</div>
        </div>
        {Object.entries(phasesWithStats).map(([key, phase]) => (
          <div key={key} className={`flexbox column ${phaseStats[key] ? '' : 'disabled'}`}>
            <div className="text-muted margin-bottom-small">{phase}</div>
            <div className="status">{phaseStats[key].toLocaleString()}</div>
          </div>
        ))}
      </div>
      <TwoColumnData
        {...defaultColumnDataProps}
        config={{ 'Max attempts per device': retries, 'Maximum number of devices': max_devices || 'N/A' }}
        style={{ ...defaultColumnDataProps.style, gridTemplateColumns: 'max-content 1fr' }}
      />
    </div>
  );
};

export default DeploymentStatus;
