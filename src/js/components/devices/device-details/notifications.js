import React from 'react';
import Time from 'react-time';

import { ArrowDropDownCircleOutlined as ScrollDownIcon, CheckCircle as CheckIcon, Error as ErrorIcon, Help as HelpIcon } from '@material-ui/icons';
import pluralize from 'pluralize';
import theme from '../../../themes/mender-theme';
import { DEVICE_ONLINE_CUTOFF } from '../../../constants/deviceConstants';
import LocaleFormatString from '../../common/timeformat';

const severityIconStyle = { marginRight: theme.spacing(2) };
const errorIcon = <ErrorIcon className="red" style={severityIconStyle} />;
const successIcon = <CheckIcon className="green" style={severityIconStyle} />;
const questionIcon = <HelpIcon style={severityIconStyle} />;

const monitoringSeverities = {
  CRITICAL: 'CRITICAL',
  CRITICAL_FLAPPING: 'CRITICAL_FLAPPING',
  OK: 'OK',
  UNKNOWN: 'UNKNOWN'
};

export const severityMap = {
  [monitoringSeverities.CRITICAL]: { className: 'red', icon: errorIcon, listIcon: <ErrorIcon className="red" /> },
  [monitoringSeverities.CRITICAL_FLAPPING]: { className: '', icon: errorIcon, listIcon: <ErrorIcon className="red" /> },
  [monitoringSeverities.OK]: { className: '', icon: successIcon, listIcon: <CheckIcon className="green" /> },
  [monitoringSeverities.UNKNOWN]: { className: '', icon: questionIcon, listIcon: <HelpIcon /> }
};

export const BaseNotification = ({ bordered = true, className = '', children, severity, onClick }) => {
  const mappedSeverity = severityMap[severity] ?? severityMap.UNKNOWN;
  return (
    <div
      className={`flexbox center-aligned padding-small device-detail-notification ${bordered ? 'bordered' : ''} ${mappedSeverity.className} ${className} ${
        onClick ? 'clickable' : ''
      }`}
      style={{ marginBottom: theme.spacing(), paddingBottom: theme.spacing(1.5), paddingTop: theme.spacing(1.5) }}
      onClick={onClick}
    >
      {mappedSeverity.icon}
      <div className="flexbox center-aligned">{children}</div>
    </div>
  );
};

const notificationSpaceStyle = { marginLeft: theme.spacing(), marginRight: theme.spacing() };

export const LastConnection = ({ updated_ts }) => (
  <BaseNotification severity={monitoringSeverities.CRITICAL}>
    Device has not connected to the server since <Time value={updated_ts} format={LocaleFormatString()} style={notificationSpaceStyle} />
  </BaseNotification>
);

export const ServiceNotification = ({ alerts, onClick }) => (
  <BaseNotification onClick={onClick} severity={monitoringSeverities.CRITICAL_FLAPPING}>
    {alerts.length} {pluralize('service', alerts.length)} reported issues. View details in the
    <a style={notificationSpaceStyle}>monitoring section</a>below
    <a style={notificationSpaceStyle}>
      <ScrollDownIcon fontSize="small" style={{ marginBottom: theme.spacing(-0.5) }} />
    </a>
  </BaseNotification>
);

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
