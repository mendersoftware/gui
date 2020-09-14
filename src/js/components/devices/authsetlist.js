import React from 'react';
import Time from 'react-time';

import { Button, Accordion, AccordionActions, AccordionDetails, AccordionSummary } from '@material-ui/core';

import { formatTime, formatPublicKey } from '../../helpers';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import Loader from '../common/loader';

const padder = <div style={{ flexGrow: 1 }}></div>;

export default class AuthsetList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      confirmMessage: '',
      expandRow: null,
      showKey: false,
      newStatus: null
    };
  }

  setConfirmStatus(newStatus, index, device, authset) {
    let confirmMessage = '';
    if (newStatus === 'accept') {
      confirmMessage = 'By accepting, the device with this identity data and public key will be granted authentication by the server.';
      if (device.status === DEVICE_STATES.accepted) {
        // if device already accepted, and you are accepting a different authset:
        confirmMessage = `${confirmMessage} The previously accepted public key will be rejected automatically in favor of this new key.`;
      }
    } else if (newStatus === 'reject') {
      confirmMessage = 'The device with this identity data and public key will be rejected, and blocked from communicating with the Mender server.';
      if (device.status === DEVICE_STATES.accepted && authset.status !== DEVICE_STATES.accepted) {
        // if device is accepted but you are rejecting an authset that is not accepted, device status is unaffected:
        confirmMessage = `${confirmMessage} Rejecting this request will not affect the device status as it is using a different key. `;
      }
    } else if (newStatus === 'dismiss') {
      if (authset.status === DEVICE_STATES.preauth) {
        confirmMessage = 'The device authentication set will be removed from the preauthorization list.';
      } else if (authset.status === DEVICE_STATES.accepted) {
        if (device.auth_sets.length > 1) {
          // if there are other authsets, device will still be in UI
          confirmMessage = 'The device with this public key will no longer be accepted, and this authorization request will be removed from the UI.';
        } else {
          confirmMessage =
            'The device with this public key will no longer be accepted, and will be removed from the UI. If it makes another request in future, it will show again as pending for you to accept or reject at that time.';
        }
      } else if (authset.status === DEVICE_STATES.pending) {
        confirmMessage = 'You can dismiss this authentication request for now.';
        if (device.auth_sets.length > 1) {
          // it has other authsets
          confirmMessage = `${confirmMessage} This will remove this request from the UI, but won’t affect the device.`;
        } else {
          confirmMessage = `${confirmMessage} The device will be removed from the UI, but if the same device asks for authentication again in the future, it will show again as pending.`;
        }
      } else if (authset.status === DEVICE_STATES.rejected) {
        confirmMessage =
          'This request will be removed from the UI, but if the device asks for authentication again in the future, it will show as pending for you to accept or reject it at that time.';
      }
    }
    this.setState({ confirmMessage, expandRow: index, newStatus, showKey: false });
  }

  showKey(index) {
    this.setState({ confirmMessage: '', showKey: true, expandRow: index });
  }

  confirm(authset, status) {
    this.props.confirm(this.props.device.id, authset.id, status);
    this.setConfirmStatus();
  }

  render() {
    const self = this;
    const { active, authsets, device, hideHeader, limitMaxed, loading, total } = self.props;
    const { confirmMessage, expandRow, newStatus, showKey } = self.state;
    // authsets.push({ ...authsets[0], status: DEVICE_STATES.pending, id: authsets[0].id + '1' });
    // authsets.push({ ...authsets[0], status: DEVICE_STATES.preauth, id: authsets[0].id + '2' });
    // authsets.push({ ...authsets[0], status: DEVICE_STATES.rejected, id: authsets[0].id + '3' });

    const list = authsets.map((authset, index) => {
      let key = (
        <div>
          {formatPublicKey(authset.pubkey)}{' '}
          <a onClick={() => self.showKey(index)} className="margin-left-small">
            show more
          </a>
        </div>
      );
      let expanded;
      if (expandRow === index) {
        if (showKey) {
          expanded = <div className="expanded">{authset.pubkey}</div>;
          key = (
            <a onClick={() => self.showKey()} style={{ marginLeft: 250 }}>
              show less
            </a>
          );
        } else {
          expanded = (
            <p className="bold expanded">{loading === authset.id ? 'Updating status' : `${confirmMessage} Are you sure you want to ${newStatus} this?`}</p>
          );
        }
      }
      const actionButtons = confirmMessage.length ? (
        `Confirm ${newStatus}?`
      ) : (
        <div className="action-buttons flexbox">
          {authset.status !== DEVICE_STATES.accepted && authset.status !== DEVICE_STATES.preauth && !limitMaxed ? (
            <a onClick={total > 1 ? () => self.setConfirmStatus('accept', index, device, authset) : () => self.confirm(authset, 'accept')}>Accept</a>
          ) : (
            <div>Accept</div>
          )}
          {authset.status !== DEVICE_STATES.rejected && authset.status !== DEVICE_STATES.preauth ? (
            <a onClick={() => self.setConfirmStatus('reject', index, device, authset)}>Reject</a>
          ) : (
            <div>Reject</div>
          )}
          <a
            onClick={
              total > 1 || device.status !== DEVICE_STATES.pending
                ? () => self.setConfirmStatus('dismiss', index, device, authset)
                : () => self.confirm(authset, 'dismiss')
            }
          >
            Dismiss
          </a>
        </div>
      );

      return (
        <Accordion square expanded={!!expanded} key={authset.id} style={active ? { backgroundColor: '#e9f4f3' } : {}}>
          <AccordionSummary style={{ cursor: 'default' }}>
            {key}
            <Time value={formatTime(authset.ts)} format="YYYY-MM-DD HH:mm" />
            <div className="capitalized">{authset.status}</div>
            {loading === authset.id ? (
              <div>
                Updating status <Loader table={true} waiting={true} show={true} style={{ height: '4px', marginLeft: '10px' }} />
              </div>
            ) : (
              actionButtons
            )}
          </AccordionSummary>
          <AccordionDetails>{showKey ? [expanded, padder] : [padder, expanded]}</AccordionDetails>
          {expanded && !showKey && (
            <AccordionActions className="margin-right-small">
              {loading === authset.id ? (
                <Loader table={true} waiting={true} show={true} style={{ height: '4px' }} />
              ) : (
                <>
                  <Button className="margin-right-small" onClick={() => self.setConfirmStatus()}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={() => self.confirm(authset, newStatus)}>
                    <span className="capitalized">{newStatus}</span>
                  </Button>
                </>
              )}
            </AccordionActions>
          )}
        </Accordion>
      );
    });

    return (
      <div className="authsets">
        {!hideHeader && (
          <div className="flexbox header">
            {['Public key', 'Request time', 'Status', 'Actions'].map((headerName, index) => (
              <div className="columnHeader" key={`columnHeader-${index}`}>
                {headerName}
              </div>
            ))}
          </div>
        )}
        <div className="body">{list}</div>
      </div>
    );
  }
}
