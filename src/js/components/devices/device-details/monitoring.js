import React, { useEffect, useState } from 'react';
import Time from 'react-time';
import { useTheme } from '@material-ui/core/styles';

import { DeviceConnectionNote } from './connection';
import DeviceDataCollapse from './devicedatacollapse';
import { DeviceOfflineHeaderNotification, NoAlertsHeaderNotification, severityMap } from './notifications';

export const DeviceMonitorsMissingNote = ({ docsVersion }) => (
  <DeviceConnectionNote>
    No alert monitor is currently configured for this device.
    <br />
    Please{' '}
    <a target="_blank" rel="noopener noreferrer" href={`https://docs.mender.io/${docsVersion}add-ons/monitor`}>
      see the documentation
    </a>{' '}
    for a description on how to configure different kinds of monitors.
  </DeviceConnectionNote>
);

const MonitoringAlert = ({ alert, onDetailsClick, style }) => {
  const { description, lines_before = [], lines_after = [], line_matching = '' } = alert.subject.details;
  const lines = [...lines_before, line_matching, ...lines_after].filter(i => i);
  return (
    <div className="monitoring-alert column-data" style={style}>
      {severityMap[alert.level].listIcon}
      <div className="key text-muted">
        <b>{alert.name}</b>
      </div>
      <div>{alert.level}</div>
      <Time value={alert.timestamp} format="YYYY-MM-DD HH:mm" />
      {(lines.length || description) && <a onClick={() => onDetailsClick(alert)}>view {lines.length ? 'log' : 'details'}</a>}
    </div>
  );
};

export const DeviceMonitoring = ({ alerts, device, docsVersion, getAlerts, innerRef, isOffline, latestAlerts, onDetailsClick }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!!latestAlerts.length);
  }, [latestAlerts.length]);

  useEffect(() => {
    if (open) {
      getAlerts(device.id);
    }
  }, [open]);

  const { monitors = [], updated_ts = '' } = device;

  const toggleOpen = monitors.length ? () => setOpen(!open) : undefined;

  return (
    <DeviceDataCollapse
      header={
        !monitors.length ? (
          <DeviceMonitorsMissingNote docsVersion={docsVersion} />
        ) : (
          <>
            {!latestAlerts.length && <NoAlertsHeaderNotification />}
            {!open &&
              latestAlerts.map(alert => (
                <MonitoringAlert alert={alert} key={alert.id} onDetailsClick={onDetailsClick} style={{ marginBottom: theme.spacing() }} />
              ))}
            {isOffline && <DeviceOfflineHeaderNotification />}
            {!open && <a onClick={toggleOpen}>show more</a>}
          </>
        )
      }
      isAddOn
      isOpen={open}
      onClick={toggleOpen}
      title={
        <div className="flexbox center-aligned" ref={innerRef}>
          <h4 className="margin-right">Monitoring</h4>
          {!!monitors.length && <Time className="text-muted" value={updated_ts} format="YYYY-MM-DD HH:mm" />}
        </div>
      }
    >
      {alerts.length ? (
        <div className="margin-bottom">
          <h4 className="text-muted">Triggered alerts</h4>
          {alerts.map(alert => (
            <MonitoringAlert alert={alert} key={alert.id} onDetailsClick={onDetailsClick} />
          ))}
        </div>
      ) : (
        <p className="text-muted margin-left-large margin-bottom" style={{ fontSize: 'larger' }}>
          There are currently no issues reported
        </p>
      )}
      <div className="margin-top-small">
        <a onClick={toggleOpen}>show less</a>
      </div>
    </DeviceDataCollapse>
  );
};

export default DeviceMonitoring;
