import React from 'react';
import pluralize from 'pluralize';

import { Box, Chip, Tooltip } from '@material-ui/core';
import { Error as ErrorIcon } from '@material-ui/icons';

const statusTypes = {
  default: { severity: 'none', notification: '', label: '' },
  authRequests: {
    severity: 'default',
    notification: `This device has a new auth request. This can happen if the device's public key changes. Click on the row to see more details`
  },
  offline: { severity: 'error', notification: 'This device has not communicated with the Mender backend for a while. Click on the row to see more details' },
  updateFailed: { severity: 'warning', notification: '' }
};

const NumberIcon = props => (
  <Box borderRadius="50%" className="flexbox centered notificationCounter">
    <div>{props.value}</div>
  </Box>
);

const DeviceStatus = ({ device: { auth_sets = [] } }) => {
  let status = statusTypes.default;
  let label = status.label;
  let icon = <ErrorIcon />;

  const pendingAuthSetsCount = auth_sets.filter(item => item.status === 'pending').length;
  if (pendingAuthSetsCount) {
    icon = <NumberIcon value={pendingAuthSetsCount} />;
    status = statusTypes.authRequests;
    label = <div className="uppercased">new {pluralize('request', pendingAuthSetsCount)}</div>;
  }

  return label !== statusTypes.default.label ? (
    <Tooltip title={status.notification} placement="bottom">
      <Chip variant="outlined" size="small" icon={icon} label={label} className="deviceStatus" />
    </Tooltip>
  ) : (
    <div />
  );
};

export default DeviceStatus;
