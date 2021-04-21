import React from 'react';
import { TwoColumnData } from '../../common/configurationobject';
import { defaultStats } from '../deploymentstatus';
import { defaultColumnDataProps } from '../report';

const phases = {
  skipped: 'Skipped',
  pending: 'Pending',
  inprogress: 'In Progress',
  success: 'Success',
  failure: 'Fail'
};

export const DeploymentStatus = ({ className = '', deployment = {} }) => {
  const { device_count, finished, max_devices, retries, status } = deployment;
  const stats = { ...defaultStats, ...deployment.stats };
  const phaseStats = {
    inprogress: stats.downloading + stats.installing + stats.rebooting,
    failure: stats.failure,
    skipped: stats.aborted + stats.noartifact + stats['already-installed'] + stats.decommissioned,
    success: stats.success,
    pending: (max_devices ? max_devices - device_count : 0) + stats.pending
  };

  const statusDescription = finished ? (
    <div>Finished {!!phaseStats.failure && <span className="failures">with failures</span>}</div>
  ) : (
    <>
      {phases[status]}
      {status === 'pending' ? ' (awaiting devices)' : ''}
    </>
  );

  return (
    <div className={`progressStatus flexbox space-between centered margin-bottom ${className}`}>
      <div className="flexbox column">
        <div className="text-muted">Status</div>
        <h3 className="margin-bottom-none text-muted">{statusDescription}</h3>
      </div>
      <div className="flexbox space-between align-right" style={{ minWidth: '40%' }}>
        <div className="flexbox column">
          <div className="text-muted margin-bottom-small"># devices</div>
          <div>{device_count}</div>
        </div>
        {Object.entries(phases).map(([key, phase]) => (
          <div key={key} className={`flexbox column ${phaseStats[key] ? '' : 'disabled'}`}>
            <div className="text-muted margin-bottom-small">{phase}</div>
            <div className="status">{phaseStats[key].toLocaleString()}</div>
          </div>
        ))}
      </div>
      <TwoColumnData
        {...defaultColumnDataProps}
        config={{ 'Max attempts per device': retries || 'N/A', 'Maximum number of devices': max_devices || 'N/A' }}
        style={{ gridTemplateColumns: 'max-content 1fr' }}
      />
    </div>
  );
};

export default DeploymentStatus;
