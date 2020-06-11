import React from 'react';
import { Tooltip } from '@material-ui/core';

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

export const DeploymentStatus = ({ deployment = {}, vertical }) => {
  const stats = deployment.stats || defaultStats;
  const inprogress = stats.downloading + stats.installing + stats.rebooting;
  const failures = stats.failure;
  const skipped = stats.aborted + stats.noartifact + stats['already-installed'] + stats.decommissioned;
  const successes = stats.success;
  const pending = (deployment.max_devices ? deployment.max_devices - deployment.device_count : 0) + stats.pending;
  const phases = [
    { title: 'Skipped', value: skipped, className: 'skipped' },
    { title: 'Pending', value: pending, className: 'pending' },
    { title: 'In progress', value: inprogress, className: 'inprogress' },
    { title: 'Successful', value: successes, className: 'success' },
    { title: 'Failed', value: failures, className: 'failure' }
  ];
  return (
    <div>
      <div className={vertical ? 'flexbox results-status column' : 'flexbox results-status'}>
        {phases.map(phase => (
          <Tooltip key={phase.className} title={phase.title}>
            <div className={phase.value ? '' : 'disabled'}>
              <span className={`status ${phase.className}`}>{(phase.value || 0).toLocaleString()}</span>
              {vertical && <span className="label">{phase.title}</span>}
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default DeploymentStatus;
