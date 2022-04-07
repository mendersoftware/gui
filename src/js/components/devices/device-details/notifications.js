import React from 'react';
import pluralize from 'pluralize';

import { ArrowDropDownCircleOutlined as ScrollDownIcon, CheckCircle as CheckIcon, Error as ErrorIcon, Help as HelpIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

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

const useStyles = makeStyles()(theme => ({
  deviceDetailNotification: {
    marginBottom: theme.spacing(),
    paddingBottom: theme.spacing(1.5),
    paddingTop: theme.spacing(1.5),
    '&.red, &.green': {
      color: theme.palette.text.primary
    },
    '&.bordered': {
      border: `1px solid ${theme.palette.grey[500]}`,
      background: `${theme.palette.grey[600]}15`,
      '&.red': {
        borderColor: theme.palette.error.main,
        background: theme.palette.error.light
      }
    },
    '> span': {
      marginRight: theme.spacing(2)
    }
  },
  textSpacing: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5)
  },
  downButton: {
    marginBottom: theme.spacing(-0.5)
  }
}));

export const BaseNotification = ({ bordered = true, className = '', children, severity, onClick }) => {
  const { classes } = useStyles();
  const mappedSeverity = severityMap[severity] ?? severityMap.UNKNOWN;
  return (
    <div
      className={`flexbox center-aligned padding-small ${classes.deviceDetailNotification} ${bordered ? 'bordered' : ''} ${
        mappedSeverity.className
      } ${className} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <span>{mappedSeverity.icon}</span>
      <div className="flexbox center-aligned">{children}</div>
    </div>
  );
};

export const LastConnection = ({ updated_ts }) => {
  const { classes } = useStyles();

  return (
    <BaseNotification severity={monitoringSeverities.CRITICAL}>
      Device has not connected to the server since <Time className={classes.textSpacing} value={updated_ts} />
    </BaseNotification>
  );
};

export const ServiceNotification = ({ alerts, onClick }) => {
  const { classes } = useStyles();

  return (
    <BaseNotification onClick={onClick} severity={monitoringSeverities.CRITICAL_FLAPPING}>
      {alerts.length} {pluralize('service', alerts.length)} reported issues. View details in the <a className={classes.textSpacing}>monitoring section</a> below
      <a className={classes.textSpacing}>
        <ScrollDownIcon className={classes.downButton} fontSize="small" />
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
    <div className="key muted margin-right-small">
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
