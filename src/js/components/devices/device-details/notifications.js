import React from 'react';
import pluralize from 'pluralize';

import { ArrowDropDownCircleOutlined as ScrollDownIcon, CheckCircle as CheckIcon, Error as ErrorIcon, Help as HelpIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

import { DEVICE_ONLINE_CUTOFF } from '../../../constants/deviceConstants';
import Time from '../../common/time';

const errorIcon = <ErrorIcon className="red" />;
const successIcon = <CheckIcon className="green" />;
const questionIcon = <HelpIcon />;

const monitoringSeverities = {
  CRITICAL: 'CRITICAL',
  CRITICAL_FLAPPING: 'CRITICAL_FLAPPING',
  OK: 'OK',
  UNKNOWN: 'UNKNOWN'
};

export const severityMap = {
  [monitoringSeverities.CRITICAL]: { className: 'red', icon: errorIcon },
  [monitoringSeverities.CRITICAL_FLAPPING]: { className: '', icon: errorIcon },
  [monitoringSeverities.OK]: { className: '', icon: successIcon },
  [monitoringSeverities.UNKNOWN]: { className: '', icon: questionIcon }
};

export const BaseNotification = ({ bordered = true, className = '', children, severity, onClick }) => {
  const theme = useTheme();
  const mappedSeverity = severityMap[severity] ?? severityMap.UNKNOWN;
  return (
    <div
      className={`flexbox center-aligned padding-small device-detail-notification ${bordered ? 'bordered' : ''} ${mappedSeverity.className} ${className} ${
        onClick ? 'clickable' : ''
      }`}
      style={{ marginBottom: theme.spacing(), padding: theme.spacing(1.5, 'inherit') }}
      onClick={onClick}
    >
      <span style={{ marginRight: theme.spacing(2) }}>{mappedSeverity.icon}</span>
      <div className="flexbox center-aligned">{children}</div>
    </div>
  );
};

export const LastConnection = ({ updated_ts }) => {
  const theme = useTheme();

  return (
    <BaseNotification severity={monitoringSeverities.CRITICAL}>
      Device has not connected to the server since <Time value={updated_ts} style={{ margin: theme.spacing('inherit', 1) }} />
    </BaseNotification>
  );
};

export const ServiceNotification = ({ alerts, onClick }) => {
  const theme = useTheme();

  return (
    <BaseNotification onClick={onClick} severity={monitoringSeverities.CRITICAL_FLAPPING}>
      {alerts.length} {pluralize('service', alerts.length)} reported issues. View details in the
      <a style={{ margin: theme.spacing('inherit', 1) }}>monitoring section</a>below
      <a style={{ margin: theme.spacing('inherit', 1) }}>
        <ScrollDownIcon fontSize="small" style={{ marginBottom: theme.spacing(-0.5) }} />
      </a>
    </BaseNotification>
  );
};

export const NoAlertsHeaderNotification = () => (
  <BaseNotification bordered={false} severity={monitoringSeverities.OK}>
    No reported issues
  </BaseNotification>
);

export const DeviceOfflineHeaderNotification = () => (
  <BaseNotification className="column-data" bordered={false} severity={monitoringSeverities.CRITICAL}>
    <div className="key text-muted margin-right-small">
      <b>Device offline</b>
    </div>
    Last check-in over {DEVICE_ONLINE_CUTOFF.interval} {pluralize(DEVICE_ONLINE_CUTOFF.intervalName, DEVICE_ONLINE_CUTOFF.interval)} ago
  </BaseNotification>
);

export const DeviceNotifications = ({ alerts, device, isOffline, onClick }) => {
  const { updated_ts = '' } = device;
  return (
    <>
      {isOffline && <LastConnection updated_ts={updated_ts} />}
      {Boolean(alerts.length) && <ServiceNotification alerts={alerts} onClick={onClick} />}
    </>
  );
};

export default DeviceNotifications;
