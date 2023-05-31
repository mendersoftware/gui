// Copyright 2021 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { useTheme } from '@mui/material/styles';

import { getDeviceAlerts, setAlertListState } from '../../../actions/monitorActions';
import { DEVICE_LIST_DEFAULTS } from '../../../constants/deviceConstants';
import { getDocsVersion, getOfflineThresholdSettings } from '../../../selectors';
import Pagination from '../../common/pagination';
import Time from '../../common/time';
import MonitorDetailsDialog from '../dialogs/monitordetailsdialog';
import { DeviceConnectionNote } from './connection';
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
  latestAlerts,
  offlineThresholdSettings,
  onDetailsClick,
  setAlertListState
}) => {
  const { page: pageNo = defaultPage, perPage: pageLength = defaultPerPage, total: alertCount } = alertListState;
  const theme = useTheme();

  useEffect(() => {
    getAlerts(device.id, alertListState);
  }, [device.id, pageNo, pageLength]);

  const onChangePage = page => setAlertListState({ page });

  const onChangeRowsPerPage = perPage => setAlertListState({ page: 1, perPage });

  const { monitors = [], isOffline, updated_ts = '' } = device;
  const hasMonitorsDefined = !!(monitors.length || alerts.length || latestAlerts.length);

  return (
    <DeviceDataCollapse
      header={
        hasMonitorsDefined || isOffline ? (
          <>
            {hasMonitorsDefined && !latestAlerts.length && <NoAlertsHeaderNotification />}
            {latestAlerts.map(alert => (
              <MonitoringAlert alert={alert} key={alert.id} onDetailsClick={onDetailsClick} style={{ marginBottom: theme.spacing() }} />
            ))}
            {isOffline && <DeviceOfflineHeaderNotification offlineThresholdSettings={offlineThresholdSettings} />}
          </>
        ) : (
          <DeviceMonitorsMissingNote docsVersion={docsVersion} />
        )
      }
      isAddOn
      title={
        <div className="flexbox center-aligned">
          <h4 className="margin-bottom-small margin-right">Monitoring</h4>
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
        hasMonitorsDefined && (
          <p className="muted margin-left-large" style={{ fontSize: 'larger' }}>
            There are currently no issues reported
          </p>
        )
      )}
    </DeviceDataCollapse>
  );
};

export const MonitoringTab = ({ alertListState, alerts, device, docsVersion, getDeviceAlerts, latestAlerts, offlineThresholdSettings, setAlertListState }) => {
  const [monitorDetails, setMonitorDetails] = useState();

  return (
    <>
      <DeviceMonitoring
        alertListState={alertListState}
        alerts={alerts}
        device={device}
        docsVersion={docsVersion}
        getAlerts={getDeviceAlerts}
        latestAlerts={latestAlerts}
        onDetailsClick={setMonitorDetails}
        setAlertListState={setAlertListState}
        offlineThresholdSettings={offlineThresholdSettings}
      />
      <MonitorDetailsDialog alert={monitorDetails} onClose={() => setMonitorDetails()} />
    </>
  );
};

const actionCreators = { getDeviceAlerts, setAlertListState };

const mapStateToProps = (state, ownProps) => {
  const { alerts = [], latest = [] } = state.monitor.alerts.byDeviceId[ownProps.device.id] || {};
  return {
    alertListState: state.monitor.alerts.alertList,
    alerts,
    docsVersion: getDocsVersion(state),
    latestAlerts: latest,
    offlineThresholdSettings: getOfflineThresholdSettings(state)
  };
};

export default connect(mapStateToProps, actionCreators)(MonitoringTab);
