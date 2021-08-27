import React, { useEffect, useState } from 'react';
import Time from 'react-time';

import DeviceDataCollapse from './devicedatacollapse';
import { DeviceOfflineHeaderNotification, NoAlertsHeaderNotification, severityMap } from './notifications';

const MonitoringAlert = ({ alert: { id, level, name, subject, timestamp }, onLogClick }) => (
  <div className="monitoring-alert column-data">
    {severityMap[level].listIcon}
    <div className="key text-muted">
      <b>{name}</b>
    </div>
    <div>{level}</div>
    <Time value={timestamp} format="YYYY-MM-DD HH:mm" />
    {subject.details ? <a onClick={() => onLogClick(id, subject.details)}>view log</a> : null}
  </div>
);

export const DeviceMonitoring = ({ alerts, device, getAlerts, innerRef, isOffline, latestAlerts, onLogClick }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!!latestAlerts.length);
  }, [latestAlerts.length]);

  useEffect(() => {
    if (open) {
      getAlerts(device.id);
    }
  }, [open]);

  const { updated_ts = '' } = device;

  const toggleOpen = () => setOpen(!open);

  return (
    <DeviceDataCollapse
      header={
        <>
          {!latestAlerts.length && <NoAlertsHeaderNotification />}
          {isOffline && <DeviceOfflineHeaderNotification />}
          {!open && <a onClick={toggleOpen}>show more</a>}
        </>
      }
      isOpen={open}
      onClick={toggleOpen}
      title={
        <div className="flexbox center-aligned" ref={innerRef}>
          <h4 className="margin-right">Monitoring</h4>
          <Time className="text-muted" value={updated_ts} format="YYYY-MM-DD HH:mm" />
        </div>
      }
    >
      {alerts.length ? (
        <>
          <h4 className="text-muted">Triggered alerts</h4>
          {alerts.map(alert => (
            <MonitoringAlert alert={alert} key={alert.id} onLogClick={onLogClick} />
          ))}
        </>
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
