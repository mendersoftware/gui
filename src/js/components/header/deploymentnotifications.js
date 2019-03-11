import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// material ui
import Icon from '@material-ui/core/Icon';

export default class DeploymentNotifications extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  render() {
    return (
      <Link to="/deployments/" className="header-section">
        <span>{this.props.inprogress}</span>
        <Icon style={{ color: '#c7c7c7', margin: '0 7px 0 10px', top: '5px', fontSize: '20px' }} className="material-icons flip-horizontal">
          refresh
        </Icon>
      </Link>
    );
  }
}
