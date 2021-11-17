import React from 'react';
import pluralize from 'pluralize';

import { Box, Chip, Tooltip } from '@material-ui/core';
import { Error as ErrorIcon, ReportProblemOutlined } from '@material-ui/icons';
import { withStyles } from '@material-ui/styles';
import { mdiAws as AWS, mdiMicrosoftAzure as Azure, mdiGoogleCloud as GCP } from '@mdi/js';

import MaterialDesignIcon from '../common/materialdesignicon';
import { DEVICE_STATES, EXTERNAL_PROVIDER } from '../../constants/deviceConstants';
import theme from '../../themes/mender-theme';

const providerIconStyle = { fontSize: '1.25rem', marginLeft: theme.spacing(0.5) };

const statusTypes = {
  default: { severity: 'none', notification: {} },
  authRequests: {
    severity: 'default',
    notification: {
      [DEVICE_STATES.accepted]: `This device has a new auth request. This can happen if the device's public key changes. Click on the row to see more details`,
      [DEVICE_STATES.pending]: `This device has a new auth request. Inspect its identity details, then check it to accept it.`
    }
  },
  connected: {
    severity: 'default',
    providers: {
      [EXTERNAL_PROVIDER.amazon.key]: { icon: <MaterialDesignIcon path={AWS} style={providerIconStyle} /> },
      [EXTERNAL_PROVIDER.azure.key]: { icon: <MaterialDesignIcon path={Azure} style={providerIconStyle} /> },
      [EXTERNAL_PROVIDER.google.key]: { icon: <MaterialDesignIcon path={GCP} style={{ ...providerIconStyle, fontSize: '1rem' }} /> }
    },
    notification: {
      [DEVICE_STATES.accepted]: 'This device was authorized externally. Click on the row to see more details'
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

const WarningIcon = withStyles({
  root: {
    width: 14,
    height: 14,
    color: theme.palette.grey[600]
  }
})(ReportProblemOutlined);

const DeviceStatus = ({ device: { auth_sets = [], external = {}, isOffline, monitor = {}, status: deviceStatus } }) => {
  let notification = statusTypes.default.notification[deviceStatus] ?? '';
  let label;
  let icon = <ErrorIcon />;

  const pendingAuthSetsCount = auth_sets.filter(item => item.status === DEVICE_STATES.pending).length;
  if (pendingAuthSetsCount) {
    icon = <NumberIcon value={pendingAuthSetsCount} />;
    notification = statusTypes.authRequests.notification[deviceStatus] ?? statusTypes.authRequests.notification[DEVICE_STATES.accepted];
    label = `new ${pluralize('request', pendingAuthSetsCount)}`;
  } else if (Object.values(monitor).some(i => i)) {
    icon = <WarningIcon style={{ marginLeft: 5 }} />;
    notification = statusTypes.monitor.notification.default;
    label = 'monitoring';
  } else if (external.provider) {
    icon = statusTypes.connected.providers[external.provider].icon ?? statusTypes.connected.providers.azure.icon;
    notification = statusTypes.connected.notification[deviceStatus] ?? statusTypes.connected.notification[DEVICE_STATES.accepted];
    label = 'accepted';
  } else if (isOffline) {
    icon = <WarningIcon style={{ marginLeft: 5 }} />;
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
