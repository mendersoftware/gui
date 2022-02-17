import React from 'react';
import pluralize from 'pluralize';

import { Box, Chip, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Error as ErrorIcon, ReportProblemOutlined } from '@mui/icons-material';

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
  monitor: {
    severity: 'warning',
    notification: {
      default: `This device has reported an issue. Click on the row to see more details`
    }
  },
  offline: {
    severity: 'error',
    notification: { default: 'This device has not communicated with the Mender backend for a while. Click on the row to see more details' }
  },
  updateFailed: { severity: 'warning', notification: {} }
};

const NumberIcon = props => (
  <Box borderRadius="50%" className="flexbox centered notificationCounter">
    <div>{props.value}</div>
  </Box>
);

const DeviceStatus = ({ device: { auth_sets = [], isOffline, monitor = {}, status: deviceStatus } }) => {
  let notification = statusTypes.default.notification[deviceStatus] ?? '';
  const theme = useTheme();
  let label;
  let icon = <ErrorIcon />;
  const WarningIcon = (
    <ReportProblemOutlined
      style={{ marginLeft: 5 }}
      classes={{
        root: {
          width: 14,
          height: 14,
          color: theme.palette.grey[600]
        }
      }}
    />
  );

  const pendingAuthSetsCount = auth_sets.filter(item => item.status === DEVICE_STATES.pending).length;
  if (pendingAuthSetsCount) {
    icon = <NumberIcon value={pendingAuthSetsCount} />;
    notification = statusTypes.authRequests.notification[deviceStatus] ?? statusTypes.authRequests.notification[DEVICE_STATES.accepted];
    label = `new ${pluralize('request', pendingAuthSetsCount)}`;
  } else if (Object.values(monitor).some(i => i)) {
    icon = WarningIcon;
    notification = statusTypes.monitor.notification.default;
    label = 'monitoring';
  } else if (isOffline) {
    icon = WarningIcon;
    notification = statusTypes.offline.notification.default;
    label = 'offline';
  }
  return label ? (
    <Tooltip title={notification} placement="bottom">
      <Chip variant="outlined" size="small" icon={icon} label={<div className="uppercased">{label}</div>} className="deviceStatus" />
    </Tooltip>
  ) : (
    <div>{deviceStatus}</div>
  );
};

export default DeviceStatus;
