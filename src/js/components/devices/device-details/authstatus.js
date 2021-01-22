import React from 'react';

import { Button, Icon, Typography } from '@material-ui/core';
import { Block as BlockIcon, Check as CheckIcon, CheckCircle as CheckCircleIcon, Warning as WarningIcon } from '@material-ui/icons';

import pendingIcon from '../../../../assets/img/pending_status.png';
import { DEVICE_STATES } from '../../../constants/deviceConstants';

const buttonStyle = { textTransform: 'none', textAlign: 'left' };
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

export const AuthStatus = ({ device: { auth_sets = [], status = DEVICE_STATES.accepted }, toggleAuthsets }) => {
  let hasPending = '';
  if (status === DEVICE_STATES.accepted && auth_sets.length > 1) {
    hasPending = auth_sets.reduce((accu, set) => {
      return set.status === DEVICE_STATES.pending ? 'This device has a pending authentication set' : accu;
    }, hasPending);
  }

  const { statusIcon, text } = states[status] ? states[status] : states.default;
  const authLabelText = hasPending.length ? hasPending : text;

  return (
    <div className="margin-bottom-small flexbox" style={{ flexDirection: 'row' }}>
      <span style={{ display: 'flex', minWidth: 180, alignItems: 'center', marginRight: '2vw' }}>
        {statusIcon}
        <span className="inline-block">
          <Typography variant="subtitle2" style={Object.assign({}, buttonStyle, { textTransform: 'capitalize' })}>
            Device status
          </Typography>
          <Typography variant="body1" style={Object.assign({}, buttonStyle, { textTransform: 'capitalize' })}>
            {status}
          </Typography>
        </span>
      </span>

      <Button onClick={() => toggleAuthsets(true)}>
        {hasPending ? <WarningIcon className="auth" style={iconStyle} /> : null}
        <span className="inline-block">
          <Typography variant="subtitle2" style={buttonStyle}>
            {authLabelText}
          </Typography>
          <Typography variant="body1" className="muted" style={buttonStyle}>
            Click to adjust authorization status for this device
          </Typography>
        </span>
      </Button>
    </div>
  );
};

export default AuthStatus;
