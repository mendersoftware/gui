import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';

import { Chip, Collapse, Divider, Icon } from '@material-ui/core';
import { Block as BlockIcon, Check as CheckIcon, CheckCircle as CheckCircleIcon, InfoOutlined as InfoIcon, Warning as WarningIcon } from '@material-ui/icons';

import pendingIcon from '../../../../assets/img/pending_status.png';
import { DEVICE_STATES } from '../../../constants/deviceConstants';
import theme from '../../../themes/mender-theme';
import Authsets from './authsets/authsets';

const iconStyle = { margin: 12 };

const states = {
  default: {
    text: 'Please check the device authentication state',
    statusIcon: <Icon style={iconStyle} component="img" src={pendingIcon} />
  },
  pending: {
    text: 'Accept, reject or dismiss the device?',
    statusIcon: <Icon style={iconStyle} component="img" src={pendingIcon} />
  },
  accepted: {
    text: 'Reject, dismiss or decommission this device?',
    statusIcon: <CheckCircleIcon className="green" style={iconStyle} />
  },
  rejected: {
    text: 'Accept, dismiss or decommission this device',
    statusIcon: <BlockIcon className="red" style={iconStyle} />
  },
  preauthorized: {
    text: 'Remove this device from preauthorization?',
    statusIcon: <CheckIcon style={iconStyle} />
  }
};

export const AuthStatus = ({ device, decommission, dialogToggle, docsVersion }) => {
  const [open, setOpen] = useState(false);

  const { auth_sets = [], status = DEVICE_STATES.accepted } = device;

  useEffect(() => {
    dialogToggle(!open);
  }, [open]);

  let hasPending = '';
  if (status === DEVICE_STATES.accepted && auth_sets.length > 1) {
    hasPending = auth_sets.reduce((accu, set) => {
      return set.status === DEVICE_STATES.pending ? 'This device has a pending authentication set' : accu;
    }, hasPending);
  }

  const { statusIcon, text } = states[status] ? states[status] : states.default;
  const authLabelText = hasPending.length ? hasPending : text;

  const requestNotification = <Chip size="small" label="new request" />;

  return (
    <div className="clickable margin-top-small margin-bottom">
      <div className="flexbox" style={{ alignItems: 'center' }}>
        <h4>Authentication status</h4>
        <div className="flexbox margin-left margin-right" style={{ alignItems: 'center' }}>
          <div className="capitalized">{status}</div>
          {statusIcon}
        </div>
        {requestNotification}
        <div
          onClick={e => e.stopPropagation()}
          id="inventory-info"
          className="tooltip info"
          style={{ top: '5px', right: '-35px' }}
          data-tip
          data-for="inventory-wait"
          data-event="click focus"
        >
          <InfoIcon />
        </div>
        <ReactTooltip id="inventory-wait" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
          <h3>Device authorization status</h3>
          <p>
            Each device sends an authentication request containing its identity attributes and its current public key. You can accept, reject or dismiss these
            requests to determine the authorization status of the device.
          </p>
          <p>
            In cases such as key rotation, each device may have more than one identity/key combination listed. See the documentation for more on{' '}
            <a href={`https://docs.mender.io/${docsVersion}overview/device-authentication`} target="_blank" rel="noopener noreferrer">
              Device authentication
            </a>
            .
          </p>
        </ReactTooltip>
      </div>
      {!!hasPending && <WarningIcon className="auth" style={iconStyle} />}
      {authLabelText}
      {!open && (
        <div>
          <a onClick={setOpen}>show more</a>
        </div>
      )}
      <Collapse in={Boolean(open)} timeout="auto" unmountOnExit>
        <Authsets decommission={decommission} device={device} />
      </Collapse>
      <Divider style={{ marginTop: theme.spacing(2) }} />
    </div>
  );
};

export default AuthStatus;
