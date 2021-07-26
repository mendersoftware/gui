import React, { useState } from 'react';
import Time from 'react-time';

import { Button } from '@material-ui/core';

import DeviceDataCollapse from './devicedatacollapse';
import { DeviceOfflineHeaderNotification, NoAlertsHeaderNotification, severityMap } from './notifications';

const MonitoringAlert = ({ alert: { id, level, name, subject, timestamp }, onLogClick }) => (
  <div className="monitoring-alert column-data">
    {severityMap.CRITICAL.listIcon}
    <div className="key text-muted">
      <b>{name}</b>
    </div>
    <div>{level}</div>
    <Time value={timestamp} format="YYYY-MM-DD HH:mm" />
    <div>{subject.details}</div>
    <Button variant="text" onClick={() => onLogClick(id, subject.details)}>
      view log
    </Button>
  </div>
);

export const DeviceMonitoring = ({ alerts, device, innerRef, isOffline, onLogClick }) => {
  const [open, setOpen] = useState(true);

  const { updated_ts = '' } = device;

  const toggleOpen = () => setOpen(!open);

  return (
    <DeviceDataCollapse
      header={
        <>
          {!alerts.length && <NoAlertsHeaderNotification />}
          {isOffline && <DeviceOfflineHeaderNotification />}
          {!open && <a onClick={toggleOpen}>show more</a>}
        </>
      }
      isOpen={open}
      onClick={setOpen}
      title={
        <div className="flexbox center-aligned" ref={innerRef}>
          <h4 className="margin-right">Monitoring</h4>
          <Time className="text-muted" value={updated_ts} format="YYYY-MM-DD HH:mm" />
        </div>
      }
    >
      <h4 className="text-muted">Triggered alerts</h4>
      {alerts.map(alert => (
        <MonitoringAlert alert={alert} key={alert.id} onLogClick={onLogClick} />
      ))}
      <a className="margin-top-small" onClick={toggleOpen}>
        show less
      </a>
    </DeviceDataCollapse>
  );
};

export default DeviceMonitoring;
