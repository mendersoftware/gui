import React from 'react';
import PropTypes from 'prop-types';
import { Router } from 'react-router';
var createReactClass = require('create-react-class');

// material ui
import FontIcon from 'material-ui/FontIcon';

var DeviceNotifications = createReactClass({
  _handleClick: function() {
    this.context.router.push('/devices/');
  },
  render: function() {
    var styles = {
      warning: {
        color: "rgb(171, 16, 0)"
      },
      default: {
        color: '#c7c7c7'
      }
    };
    var warning = this.props.limit && (this.props.limit <= this.props.total);
    return (
      <div style={warning ? styles.warning : null} onClick={this._handleClick} className="header-section">
        <span>{this.props.total}</span>
        {this.props.limit ? 
          <span>/{this.props.limit}</span>
        : null }

        <FontIcon style={warning ? styles.warning : styles.default, {margin: '0 7px 0 14px', top: '5px', fontSize: '20px'}} className="material-icons">developer_board</FontIcon>
        {this.props.pending ?
          <a style={{marginLeft: "7px"}}>{this.props.pending} pending</a>
        : null }
      </div>
    );
  }
});

DeviceNotifications.contextTypes = {
  router: PropTypes.object
};


module.exports = DeviceNotifications;