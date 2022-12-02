import React from 'react';

import { Chip, Icon } from '@mui/material';
import { Block as BlockIcon, Check as CheckIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

import pendingIcon from '../../../../assets/img/pending_status.png';
import { DEVICE_STATES } from '../../../constants/deviceConstants';
import DeviceDataCollapse from './devicedatacollapse';
import Authsets from './authsets/authsets';
import { AuthButton } from '../../helptips/helptooltips';

const iconStyle = { margin: 12 };

const states = {
  default: <Icon style={iconStyle} component="img" src={pendingIcon} />,
  pending: <Icon style={iconStyle} component="img" src={pendingIcon} />,
  accepted: <CheckCircleIcon className="green" style={iconStyle} />,
  rejected: <BlockIcon className="red" style={iconStyle} />,
  preauthorized: <CheckIcon style={iconStyle} />
};

export const AuthStatus = ({ decommission, device, deviceListRefresh, showHelptips }) => {
  const { auth_sets = [], status = DEVICE_STATES.accepted } = device;

  let hasPending = '';
  if (status === DEVICE_STATES.accepted && auth_sets.length > 1) {
    hasPending = auth_sets.reduce((accu, set) => {
      return set.status === DEVICE_STATES.pending ? 'This device has a pending authentication set' : accu;
    }, hasPending);
  }

  const statusIcon = states[status] ? states[status] : states.default;
  const requestNotification = !!hasPending && <Chip size="small" label="new request" color="primary" />;

  return (
    <DeviceDataCollapse
      title={
        <div className="flexbox center-aligned">
          <h4>Authentication status</h4>
          <div className="flexbox center-aligned margin-left margin-right">
            <div className="capitalized">{status}</div>
            {statusIcon}
          </div>
          {requestNotification}
          {showHelptips && (
            <div style={{ position: 'relative', width: 50, height: 30 }}>{status === DEVICE_STATES.pending && <AuthButton highlightHelp={true} />}</div>
          )}
        </div>
      }
    >
      <Authsets decommission={decommission} device={device} deviceListRefresh={deviceListRefresh} showHelptips={showHelptips} />
    </DeviceDataCollapse>
  );
};

export default AuthStatus;
