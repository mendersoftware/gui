import React from 'react';
var createReactClass = require('create-react-class');

import { formatTime, formatPublicKey } from '../../helpers.js';
import Time from 'react-time';
import Collapse from 'react-collapse';
var Loader = require('../common/loader');

import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

var AuthsetList = createReactClass({
  getInitialState() {
    return {
      divHeight: 188
    };
  },

  _adjustCellHeight: function(height) {
    this.setState({ divHeight: height + 75 });
  },

  setConfirmStatus: function(authset, newStatus, index) {
    this.setState({ expandRow: index, newStatus: newStatus, showKey: null });
  },

  showKey: function(index) {
    this.setState({ showKey: index, expandRow: null });
  },

  confirm: function(authset, status) {
    this.setState({ expandRow: null });
    this.props.confirm(this.props.device.id, authset.id, status);
  },

  render: function() {
    var self = this;
    var list = this.props.authsets.map(function(authset, index) {
      var confirmMessage = '';

      if (self.state.newStatus === 'accept') {
        confirmMessage = 'By accepting, the device with this identity data and public key will be granted authentication by the server.';
        if (self.props.device.status === 'accepted') {
          // if device already accepted, and you are accepting a different authset:
          confirmMessage = confirmMessage + ' The previously accepted public key will be rejected automatically in favor of this new key.';
        }
      }

      if (self.state.newStatus === 'reject') {
        confirmMessage = 'The device with this identity data and public key will be rejected, and blocked from communicating with the Mender server.';
        if (self.props.device.status === 'accepted' && authset.status !== 'accepted') {
          // if device is accepted but you are rejecting an authset that is not accepted, device status is unaffected:
          confirmMessage = confirmMessage + ' Rejecting this request will not affect the device status as it is using a different key. ';
        }
      }

      if (self.state.newStatus === 'dismiss') {
        if (authset.status === 'preauthorized') {
          confirmMessage = 'The device authentication set will be removed from the preauthorization list.';
        }
        if (authset.status === 'accepted') {
          if (self.props.device.auth_sets.length > 1) {
            // if there are other authsets, device will still be in UI
            confirmMessage = 'The device with this public key will no longer be accepted, and this authorization request will be removed from the UI.';
          } else {
            confirmMessage =
              'The device with this public key will no longer be accepted, and will be removed from the UI. If it makes another request in future, it will show again as pending for you to accept or reject at that time.';
          }
        }
        if (authset.status === 'pending') {
          confirmMessage = 'You can dismiss this authentication request for now.';
          if (self.props.device.auth_sets.length > 1) {
            // it has other authsets
            confirmMessage = confirmMessage + ' This will remove this request from the UI, but won’t affect the device.';
          } else {
            confirmMessage =
              confirmMessage +
              ' The device will be removed from the UI, but if the same device asks for authentication again in the future, it will show again as pending.';
          }
        }
        if (authset.status === 'rejected') {
          confirmMessage =
            'This request will be removed from the UI, but if the device asks for authentication again in the future, it will show as pending for you to accept or reject it at that time.';
        }
      }

      var expanded = '';
      if (self.state.expandRow === index) {
        expanded = (
          <div className="expand-confirm">
            <div className="float-right">
              <p style={{ maxWidth: '600px', whiteSpace: 'normal' }} className="bold margin-right inline-block">
                {self.props.loading === authset.id ? 'Updating status' : confirmMessage + ' Are you sure you want to ' + self.state.newStatus + ' this?'}
              </p>
              <div className="inline-block">
                {self.props.loading === authset.id ? (
                  <Loader table={true} waiting={true} show={true} style={{ height: '4px' }} />
                ) : (
                  <div>
                    <FlatButton style={{ marginRight: '10px' }} onClick={self.setConfirmStatus.bind(null, null, null, null)}>
                      Cancel
                    </FlatButton>
                    <RaisedButton onClick={self.confirm.bind(null, authset, self.state.newStatus)}>
                      <span className="capitalized">{self.state.newStatus}</span>
                    </RaisedButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      var actionButtons = expanded ? (
        'Confirm ' + self.state.newStatus + '?'
      ) : (
        <div className="actionButtons">
          {authset.status !== 'accepted' && authset.status !== 'preauthorized' && !self.props.limitMaxed ? (
            <a onClick={self.props.total > 1 ? self.setConfirmStatus.bind(null, authset, 'accept', index) : self.confirm.bind(null, authset, 'accept')}>
              Accept
            </a>
          ) : (
            <span className="bold muted">Accept</span>
          )}
          {authset.status !== 'rejected' && authset.status !== 'preauthorized' ? (
            <a onClick={self.setConfirmStatus.bind(null, authset, 'reject', index)}>Reject</a>
          ) : (
            <span className="bold muted">Reject</span>
          )}
          <a
            onClick={
              self.props.total > 1 || self.props.device.status !== 'pending'
                ? self.setConfirmStatus.bind(null, authset, 'dismiss', index)
                : self.confirm.bind(null, authset, 'dismiss')
            }
          >
            Dismiss
          </a>
        </div>
      );

      var key =
        self.state.showKey === index ? (
          <Collapse
            springConfig={{ stiffness: 210, damping: 20 }}
            onHeightReady={self._adjustCellHeight}
            className="expanded"
            isOpened={true}
            style={{ whiteSpace: 'normal' }}
          >
            {authset.pubkey}{' '}
            <a onClick={self.showKey} className="margin-left-small">
              show less
            </a>
          </Collapse>
        ) : (
          <span>
            {formatPublicKey(authset.pubkey)}{' '}
            <a onClick={self.showKey.bind(null, index)} className="margin-left-small">
              show more
            </a>
          </span>
        );

      return (
        <TableRow hoverable={true} style={self.props.active ? { backgroundColor: '#e9f4f3' } : {}} className={expanded ? 'expand' : null} key={index}>
          <TableRowColumn
            style={self.state.showKey === index ? { whiteSpace: 'normal', width: '400px' } : { width: '400px' }}
            className={self.state.showKey === index ? 'break-word' : ''}
          >
            {key}
          </TableRowColumn>
          <TableRowColumn style={expanded ? { height: self.state.divHeight } : null}>
            <Time value={formatTime(authset.ts)} format="YYYY-MM-DD HH:mm" />
          </TableRowColumn>
          <TableRowColumn className="capitalized">{authset.status}</TableRowColumn>
          <TableRowColumn>
            {self.props.loading === authset.id ? (
              <span>
                Updating status <Loader table={true} waiting={true} show={true} style={{ height: '4px', marginLeft: '10px' }} />
              </span>
            ) : (
              actionButtons
            )}
          </TableRowColumn>
          <TableRowColumn style={{ width: '0', padding: '0', overflow: 'visible' }}>
            <Collapse
              springConfig={{ stiffness: 210, damping: 20 }}
              onHeightReady={self._adjustCellHeight}
              className="expanded"
              isOpened={expanded ? true : false}
            >
              {expanded}
            </Collapse>
          </TableRowColumn>
        </TableRow>
      );
    });

    return (
      <Table fixedHeader={false} selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false} style={this.props.hideHeader ? { display: 'none' } : {}}>
          <TableRow>
            <TableHeaderColumn style={{ width: '400px' }}>Public key</TableHeaderColumn>
            <TableHeaderColumn>Request time</TableHeaderColumn>
            <TableHeaderColumn>Status</TableHeaderColumn>
            <TableHeaderColumn>Actions</TableHeaderColumn>
            <TableHeaderColumn className="columnHeader" style={{ width: '0px', paddingRight: '0', paddingLeft: '0' }} />
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false} showRowHover={true}>
          {list}
        </TableBody>
      </Table>
    );
  }
});

module.exports = AuthsetList;
