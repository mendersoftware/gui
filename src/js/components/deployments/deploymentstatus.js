import React from 'react';

import { Tooltip } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

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

const useStyles = makeStyles()(theme => ({
  resultsStatus: {
    columnGap: theme.spacing(),
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, 32px)',
    '> div': {
      columnGap: theme.spacing(0.5)
    },
    '.disabled': {
      opacity: '0.1'
    }
  }
}));

export const DeploymentStats = ({ deployment = {} }) => {
  const { classes } = useStyles();
  const phaseStats = groupDeploymentStats(deployment, true);
  return (
    <div className={`flexbox ${classes.resultsStatus} `}>
      {Object.entries(phases).map(([key, phase]) => (
        <Tooltip key={key} title={phase.title}>
          <div className={`flexbox centered ${phaseStats[key] ? '' : 'disabled'}`}>
            <img src={phase.image} />
            <div className="status">{phaseStats[key]}</div>
          </div>
        </Tooltip>
      ))}
    </div>
  );
};

export default DeploymentStats;
