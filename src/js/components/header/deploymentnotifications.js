import React from 'react';
import { Link } from 'react-router-dom';

// material ui
import RefreshIcon from '@mui/icons-material/Refresh';
import { colors } from '../../themes/Mender';
import { DEPLOYMENT_ROUTES } from '../../constants/deploymentConstants';

const style = { color: colors.grey, margin: '0 7px 0 10px', top: '5px', fontSize: '20px' };

const DeploymentNotifications = props => (
  <Link to={DEPLOYMENT_ROUTES.active.route} className="header-section">
    <span>{props.inprogress}</span>
    <RefreshIcon style={style} className="flip-horizontal" />
  </Link>
);

export default DeploymentNotifications;
