import React from 'react';
import PropTypes from 'prop-types';
var createReactClass = require('create-react-class');

// material ui
import FontIcon from 'material-ui/FontIcon';

var DeploymentNotifications = createReactClass({
  _handleClick: function() {
    this.context.router.push('/deployments/');
  },
  render: function() {
    return (
      <div onClick={this._handleClick} className="header-section">
        <span>{this.props.inprogress}</span>
        <FontIcon style={{ color: '#c7c7c7', margin: '0 7px 0 10px', top: '5px', fontSize: '20px' }} className="material-icons flip-horizontal">
          refresh
        </FontIcon>
      </div>
    );
  }
});

DeploymentNotifications.contextTypes = {
  router: PropTypes.object
};

module.exports = DeploymentNotifications;
