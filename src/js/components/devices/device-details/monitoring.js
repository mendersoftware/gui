import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';

import { DEVICE_LIST_DEFAULTS } from '../../../constants/deviceConstants';
import Pagination from '../../common/pagination';
import { DeviceConnectionNote } from './connection';
import Time from '../../common/time';
import DeviceDataCollapse from './devicedatacollapse';
import { DeviceOfflineHeaderNotification, NoAlertsHeaderNotification, severityMap } from './notifications';

const { page: defaultPage, perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;

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
      {severityMap[alert.level].icon}
      <div className="key muted">
        <b>{alert.name}</b>
      </div>
      <div>{alert.level}</div>
      <Time value={alert.timestamp} />
      {(lines.length || description) && <a onClick={() => onDetailsClick(alert)}>view {lines.length ? 'log' : 'details'}</a>}
    </div>
  );
};

const paginationCutoff = defaultPerPage;
export const DeviceMonitoring = ({
  alertListState = {},
  alerts,
  device,
  docsVersion,
  getAlerts,
  innerRef,
  isOffline,
  latestAlerts,
  onDetailsClick,
  setAlertListState
}) => {
  const { page: pageNo = defaultPage, perPage: pageLength = defaultPerPage, total: alertCount } = alertListState;
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!!latestAlerts.length);
  }, [latestAlerts.length]);

  useEffect(() => {
    if (open) {
      getAlerts(device.id, alertListState);
    } else {
      setAlertListState({ perPage: defaultPerPage, page: 1, total: 0 });
    }
  }, [open]);

  useEffect(() => {
    getAlerts(device.id, alertListState);
  }, [device.id, pageNo, pageLength]);

  const onChangePage = page => setAlertListState({ page });

  const onChangeRowsPerPage = perPage => setAlertListState({ page: 1, perPage });

  const { monitors = [], updated_ts = '' } = device;
  const hasMonitorsDefined = !!(monitors.length || alerts.length || latestAlerts.length);

  const toggleOpen = hasMonitorsDefined ? () => setOpen(!open) : undefined;

  return (
    <DeviceDataCollapse
      header={
        hasMonitorsDefined || isOffline ? (
          <>
            {hasMonitorsDefined && !latestAlerts.length && <NoAlertsHeaderNotification />}
            {latestAlerts.map(alert => (
              <MonitoringAlert alert={alert} key={alert.id} onDetailsClick={onDetailsClick} style={{ marginBottom: theme.spacing() }} />
            ))}
            {isOffline && <DeviceOfflineHeaderNotification />}
            {!!(!isOffline || alerts.length || latestAlerts.length) && !open && <a onClick={toggleOpen}>Show alert history</a>}
          </>
        ) : (
          <DeviceMonitorsMissingNote docsVersion={docsVersion} />
        )
      }
      isAddOn
      isOpen={open}
      onClick={toggleOpen}
      title={
        <div className="flexbox center-aligned" ref={innerRef}>
          <h4 className="margin-right">Monitoring</h4>
          {!!monitors.length && <Time className="muted" value={updated_ts} />}
        </div>
      }
    >
      {alerts.length ? (
        <>
          <div>
            <h4 className="muted">Alert history</h4>
            {alerts.map(alert => (
              <MonitoringAlert alert={alert} key={alert.id} onDetailsClick={onDetailsClick} />
            ))}
          </div>
          <div className="flexbox margin-top">
            {alertCount > paginationCutoff && (
              <Pagination
                className="margin-top-none"
                count={alertCount}
                rowsPerPage={pageLength}
                onChangeRowsPerPage={onChangeRowsPerPage}
                page={pageNo}
                onChangePage={onChangePage}
              />
            )}
          </div>
        </>
      ) : (
        <p className="muted margin-left-large" style={{ fontSize: 'larger' }}>
          There are currently no issues reported
        </p>
      )}
      <a className="margin-top" onClick={toggleOpen}>
        Hide alert history
      </a>
    </DeviceDataCollapse>
  );
};

export default DeviceMonitoring;