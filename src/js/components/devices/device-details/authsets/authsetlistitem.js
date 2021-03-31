import React, { useEffect, useState } from 'react';
import Time from 'react-time';

// material ui
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Button, Chip, withStyles } from '@material-ui/core';

import { DEVICE_DISMISSAL_STATE, DEVICE_STATES } from '../../../../constants/deviceConstants';
import { formatTime } from '../../../../helpers';
import Loader from '../../../common/loader';

const padder = <div key="padder" style={{ flexGrow: 1 }}></div>;

export const getConfirmationMessage = (status, device, authset) => {
  let message = '';
  if (status === DEVICE_STATES.accepted) {
    message = 'By accepting, the device with this identity data and public key will be granted authentication by the server.';
    if (device.status === DEVICE_STATES.accepted) {
      // if device already accepted, and you are accepting a different authset:
      message = `${message} The previously accepted public key will be rejected automatically in favor of this new key.`;
    }
  } else if (status === DEVICE_STATES.rejected) {
    message = 'The device with this identity data and public key will be rejected, and blocked from communicating with the Mender server.';
    if (device.status === DEVICE_STATES.accepted && authset.status !== DEVICE_STATES.accepted) {
      // if device is accepted but you are rejecting an authset that is not accepted, device status is unaffected:
      message = `${message} Rejecting this request will not affect the device status as it is using a different key. `;
    }
  } else if (status === DEVICE_DISMISSAL_STATE) {
    if (authset.status === DEVICE_STATES.preauth) {
      message = 'The device authentication set will be removed from the preauthorization list.';
    } else if (authset.status === DEVICE_STATES.accepted) {
      if (device.auth_sets.length > 1) {
        // if there are other authsets, device will still be in UI
        message = 'The device with this public key will no longer be accepted, and this authorization request will be removed from the UI.';
      } else {
        message =
          'The device with this public key will no longer be accepted, and will be removed from the UI. If it makes another request in the future, it will show again as pending for you to accept or reject at that time.';
      }
    } else if (authset.status === DEVICE_STATES.pending) {
      message = 'You can dismiss this authentication request for now.';
      if (device.auth_sets.length > 1) {
        // it has other authsets
        message = `${message} This will remove this request from the UI, but won’t affect the device.`;
      } else {
        message = `${message} The device will be removed from the UI, but if the same device asks for authentication again in the future, it will show again as pending.`;
      }
    } else if (authset.status === DEVICE_STATES.rejected) {
      message =
        'This request will be removed from the UI, but if the device asks for authentication again in the future, it will show as pending for you to accept or reject it at that time.';
    }
  }
  return message;
};

const AuthsetListItem = ({ authset, confirm, device, isExpanded, limitMaxed, loading, onExpand, total }) => {
  const [showKey, setShowKey] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (!isExpanded) {
      setShowKey(false);
      setConfirmMessage('');
      setNewStatus('');
    }
  }, [isExpanded]);

  const onShowKey = show => {
    onExpand(show && authset.id);
    setShowKey(show);
    setConfirmMessage(false);
  };

  const onCancelConfirm = () => {
    onExpand(false);
    setConfirmMessage('');
  };

  const onConfirm = status => {
    let message = getConfirmationMessage(status, device, authset);
    setConfirmMessage(message);
    setNewStatus(status);
    setShowKey(false);
    onExpand(authset.id);
  };

  let key = <a onClick={onShowKey}>show key</a>;
  let content = [
    padder,
    <p className="bold expanded" key="content">
      {loading === authset.id ? 'Updating status' : `${confirmMessage} Are you sure you want to continue?`}
    </p>
  ];
  if (showKey) {
    content = [
      <div className="expanded" key="content">
        {authset.pubkey}
      </div>,
      padder
    ];
    key = <a onClick={() => onShowKey(false)}>hide key</a>;
  }

  const actionButtons = confirmMessage.length ? (
    `Set to: ${newStatus}?`
  ) : (
    <div className="action-buttons flexbox">
      {authset.status !== DEVICE_STATES.accepted && authset.status !== DEVICE_STATES.preauth && !limitMaxed ? (
        <a onClick={() => (total > 1 ? onConfirm(DEVICE_STATES.accepted) : confirm(device.id, authset.id, DEVICE_STATES.accepted))}>Accept</a>
      ) : (
        <div>Accept</div>
      )}
      {authset.status !== DEVICE_STATES.rejected && authset.status !== DEVICE_STATES.preauth ? (
        <a onClick={() => onConfirm(DEVICE_STATES.rejected)}>Reject</a>
      ) : (
        <div>Reject</div>
      )}
      <a
        onClick={() =>
          total > 1 || device.status !== DEVICE_STATES.pending ? onConfirm(DEVICE_DISMISSAL_STATE) : confirm(device.id, authset.id, DEVICE_DISMISSAL_STATE)
        }
      >
        Dismiss
      </a>
    </div>
  );

  let authsetStatus = <div />;
  if (authset.status === device.status) {
    authsetStatus = <div className="capitalized">Active</div>;
  } else if (authset.status === DEVICE_STATES.pending) {
    authsetStatus = <Chip size="small" label="new" color="primary" style={{ justifySelf: 'flex-start' }} />;
  }

  const CustomAccordion = withStyles({
    root: {
      backgroundColor: '#f7f7f7',
      '&:before': {
        display: 'none'
      },
      '&$expanded': {
        margin: 'auto'
      }
    },
    expanded: {}
  })(Accordion);

  return (
    <CustomAccordion square expanded={isExpanded}>
      <AccordionSummary style={{ cursor: 'default' }}>
        {authsetStatus}
        <div className="capitalized">{authset.status}</div>
        {key}
        <Time value={formatTime(authset.ts)} format="YYYY-MM-DD HH:mm" />
        {loading === authset.id ? (
          <div>
            Updating status <Loader table={true} waiting={true} show={true} style={{ height: '4px', marginLeft: '10px' }} />
          </div>
        ) : (
          actionButtons
        )}
      </AccordionSummary>
      <AccordionDetails>{content}</AccordionDetails>
      {isExpanded && !showKey && (
        <AccordionActions className="margin-right-small">
          {loading === authset.id ? (
            <Loader table={true} waiting={true} show={true} style={{ height: '4px' }} />
          ) : (
            <>
              <Button className="margin-right-small" onClick={onCancelConfirm}>
                Cancel
              </Button>
              <Button variant="contained" onClick={() => confirm(device.id, authset.id, newStatus)}>
                <span className="uppercase">confirm</span>
              </Button>
            </>
          )}
        </AccordionActions>
      )}
    </CustomAccordion>
  );
};

export default AuthsetListItem;
