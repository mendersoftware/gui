import React from 'react';
import { Link } from 'react-router-dom';

// material ui
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

import { DEPLOYMENT_ROUTES } from '../../constants/deploymentConstants';

const useStyles = makeStyles()(theme => ({
  icon: { color: theme.palette.grey[500], margin: '0 7px 0 10px', top: '5px', fontSize: '20px' }
}));

const DeploymentNotifications = props => {
  const { classes } = useStyles();
  return (
    <Link to={DEPLOYMENT_ROUTES.active.route} className="header-section">
      <span>{props.inprogress}</span>
      <RefreshIcon className={`flip-horizontal ${classes.icon}`} />
    </Link>
  );
};

export default DeploymentNotifications;
