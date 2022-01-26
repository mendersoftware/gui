import React from 'react';

import { Pause as PauseIcon, ArrowDropDownCircleOutlined as ScrollDownIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

import { groupDeploymentStats } from '../../../helpers';

export const DeploymentPhaseNotification = ({ className = '', deployment = {}, onReviewClick }) => {
  const theme = useTheme();
  const { paused } = groupDeploymentStats(deployment);
  if (paused === 0) {
    return null;
  }
  return (
    <div className={`progressStatus flexbox center-aligned margin-bottom clickable ${className}`} onClick={onReviewClick} style={{ padding: 15 }}>
      <PauseIcon />
      <div className="text-muted">
        Deployment is <span className="uppercased">paused</span>. <a>Review its status</a> to continue, retry or abort the deployment{' '}
      </div>
      <ScrollDownIcon fontSize="small" className="link-color" style={{ marginLeft: theme.spacing() }} />
    </div>
  );
};

export default DeploymentPhaseNotification;
