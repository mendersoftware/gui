import React from 'react';
import { Tooltip } from '@material-ui/core';

import successImage from '../../../assets/img/success_status.png';
import errorImage from '../../../assets/img/error_status.png';
import pendingImage from '../../../assets/img/pending_status.png';
import inprogressImage from '../../../assets/img/progress_status.png';
import skippedImage from '../../../assets/img/skipped_status.png';

import { groupDeploymentStats } from '../../helpers';

const phases = {
  skipped: { title: 'Skipped', image: skippedImage },
  pending: { title: 'Pending', image: pendingImage },
  inprogress: { title: 'In progress', image: inprogressImage },
  successes: { title: 'Successful', image: successImage },
  failures: { title: 'Failed', image: errorImage }
};

export const DeploymentStatus = ({ className, deployment = {}, vertical }) => {
  const phaseStats = groupDeploymentStats(deployment, true);
  return (
    <div className={className}>
      <div className={vertical ? 'flexbox results-status column' : 'flexbox results-status'}>
        {Object.entries(phases).map(([key, phase]) => (
          <Tooltip key={key} title={phase.title}>
            <div className={phaseStats[key] ? '' : 'disabled'}>
              <img src={phase.image} />
              <span className="status">{phaseStats[key].toLocaleString()}</span>
              {vertical && <span className="label">{phase.title}</span>}
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default DeploymentStatus;
