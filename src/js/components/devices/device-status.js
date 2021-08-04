import React from 'react';
import pluralize from 'pluralize';

import { Box, Chip, Tooltip } from '@material-ui/core';
import { Error as ErrorIcon } from '@material-ui/icons';

import { DEVICE_STATES } from '../../constants/deviceConstants';

const statusTypes = {
  default: { severity: 'none', notification: {} },
  authRequests: {
    severity: 'default',
    notification: {
      [DEVICE_STATES.accepted]: `This device has a new auth request. This can happen if the device's public key changes. Click on the row to see more details`,
      [DEVICE_STATES.pending]: `This device has a new auth request. Inspect its identity details, then check it to accept it.`
    }
  },
  offline: {
    severity: 'error',
    notification: { [DEVICE_STATES.accepted]: 'This device has not communicated with the Mender backend for a while. Click on the row to see more details' }
  },
  updateFailed: { severity: 'warning', notification: {} }
};

const NumberIcon = props => (
  <Box borderRadius="50%" className="flexbox centered notificationCounter">
    <div>{props.value}</div>
  </Box>
);

const DeviceStatus = ({ device: { auth_sets = [], status: deviceStatus } }) => {
  let notification = statusTypes.default.notification[deviceStatus] ?? '';
  let label;
  let icon = <ErrorIcon />;

  const pendingAuthSetsCount = auth_sets.filter(item => item.status === DEVICE_STATES.pending).length;
  if (pendingAuthSetsCount) {
    icon = <NumberIcon value={pendingAuthSetsCount} />;
    notification = statusTypes.authRequests.notification[deviceStatus] ?? statusTypes.authRequests.notification[DEVICE_STATES.accepted];
    label = <div className="uppercased">new {pluralize('request', pendingAuthSetsCount)}</div>;
  }

  return label ? (
    <Tooltip title={notification} placement="bottom">
      <Chip variant="outlined" size="small" icon={icon} label={label} className="deviceStatus" />
    </Tooltip>
  ) : (
    <div>{deviceStatus}</div>
  );
};

export default DeviceStatus;
