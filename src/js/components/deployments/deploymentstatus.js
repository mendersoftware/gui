import React from 'react';
import { Tooltip } from '@material-ui/core';

import successImage from '../../../assets/img/success_status.png';
import errorImage from '../../../assets/img/error_status.png';
import pendingImage from '../../../assets/img/pending_status.png';
import inprogressImage from '../../../assets/img/progress_status.png';
import skippedImage from '../../../assets/img/skipped_status.png';

export const defaultStats = {
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

const phases = {
  skipped: { title: 'Skipped', image: skippedImage },
  pending: { title: 'Pending', image: pendingImage },
  inprogress: { title: 'In progress', image: inprogressImage },
  success: { title: 'Successful', image: successImage },
  failure: { title: 'Failed', image: errorImage }
};

export const DeploymentStatus = ({ className, deployment = {}, vertical }) => {
  const stats = { ...defaultStats, ...deployment.stats };
  const phaseStats = {
    inprogress: stats.downloading + stats.installing + stats.rebooting,
    failure: stats.failure,
    skipped: stats.aborted + stats.noartifact + stats['already-installed'] + stats.decommissioned,
    success: stats.success,
    pending: (deployment.max_devices ? deployment.max_devices - deployment.device_count : 0) + stats.pending
  };
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
