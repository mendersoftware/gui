import React from 'react';
import { Link } from 'react-router-dom';

// material ui
import RefreshIcon from '@material-ui/icons/Refresh';

const style = { color: '#c7c7c7', margin: '0 7px 0 10px', top: '5px', fontSize: '20px' };

const DeploymentNotifications = props => (
  <Link to="/deployments/" className="header-section">
    <span>{props.inprogress}</span>
    <RefreshIcon style={style} className="flip-horizontal" />
  </Link>
);

export default DeploymentNotifications;
