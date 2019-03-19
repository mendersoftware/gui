import React from 'react';
import PropTypes from 'prop-types';
import { Router } from 'react-router';
import ReactTooltip from 'react-tooltip';
var pluralize = require('pluralize');
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
    var approaching = this.props.limit && ((this.props.total / this.props.limit)>.8);
    var warning = this.props.limit && (this.props.limit <= this.props.total);
    return (

      <div>

        <div
          id="limit"
          data-tip
          data-for='limit-tip'
          data-offset="{'bottom': 0, 'right': 0}"
          data-tip-disable={!this.props.limit}>

          <ReactTooltip
            id="limit-tip"
            globalEventOff='click'
            place="bottom"
            type="light"
            effect="solid"
            delayHide={1500}
            className="react-tooltip"
            disabled={!this.props.limit}>
            <h3>Device limit</h3>
            { (approaching || warning) ?
              
            <p>You { approaching ? <span>have reached</span> : <span>are nearing</span>} your device limit.</p>
            :
            <p>You can still connect another { this.props.limit - this.props.total } {pluralize("devices", (this.props.limit - this.props.total))}.</p>
            }
            <p>Contact us by email at <a href="mailto:support@hosted.mender.io">support@hosted.mender.io</a> to request a higher limit.</p>
          </ReactTooltip>



          <div className="header-section">
            <div onClick={this._handleClick.bind(null, '/devices')} className={warning ? "warning inline" : approaching ? "approaching inline" : "inline"}>
              <span>{this.props.total}</span>
              {this.props.limit ? 
                <span>/{this.props.limit}</span>
              : null }

              <FontIcon style={{margin: '0 7px 0 10px', top: '5px', fontSize: '20px'}} className="material-icons">developer_board</FontIcon>
            </div>

            {this.props.pending ?
              <a onClick={this._handleClick.bind(null, '/devices/pending')}  style={{marginLeft: "7px"}} className={this.props.limit && (this.props.limit < this.props.pending+this.props.total) ? "warning" : null }>{this.props.pending} pending</a>
            : null }
          </div>

        </div>
      </div>
    );
  }
});

DeviceNotifications.contextTypes = {
  router: PropTypes.object
};


module.exports = DeviceNotifications;