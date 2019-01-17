import React from 'react';
import PropTypes from 'prop-types';

// material ui
import FontIcon from 'material-ui/FontIcon';

export default class DeploymentNotifications extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  _handleClick() {
    this.context.router.history.push('/deployments/');
  }
  render() {
    return (
      <div onClick={() => this._handleClick()} className="header-section">
        <span>{this.props.inprogress}</span>
        <FontIcon style={{ color: '#c7c7c7', margin: '0 7px 0 10px', top: '5px', fontSize: '20px' }} className="material-icons flip-horizontal">
          refresh
        </FontIcon>
      </div>
    );
  }
}
