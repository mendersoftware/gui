import React from 'react';
import PropTypes from 'prop-types';
import { Router } from 'react-router';
var createReactClass = require('create-react-class');

// material ui
import FontIcon from 'material-ui/FontIcon';

var DeviceNotifications = createReactClass({
  _handleClick: function(path) {
    this.context.router.push(path);
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
      <div className={warning ? "warning header-section" : "header-section"}>
        <div onClick={this._handleClick.bind(null, '/devices')} className="inline">
          <span>{this.props.total}</span>
          {this.props.limit ? 
            <span>/{this.props.limit}</span>
          : null }

          <FontIcon style={{margin: '0 7px 0 10px', top: '5px', fontSize: '20px'}} className="material-icons">developer_board</FontIcon>
        </div>

        {this.props.pending ?
          <a onClick={this._handleClick.bind(null, '/devices/pending')}  style={{marginLeft: "7px"}} className={this.props.limit && this.props.limit < this.props.pending+this.props.total ? "warning" : null }>{this.props.pending} pending</a>
        : null }
      </div>
    );
  }
});

DeviceNotifications.contextTypes = {
  router: PropTypes.object
};


module.exports = DeviceNotifications;