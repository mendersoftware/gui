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
import { defaultState } from '../../../tests/mockData';
import { DEVICE_ISSUE_OPTIONS } from '../constants/deviceConstants';
import * as MonitorConstants from '../constants/monitorConstants';
import reducer, { initialState } from './monitorReducer';

describe('monitor reducer', () => {
  it('should return the initial state', async () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle CHANGE_ALERT_CHANNEL', async () => {
    expect(
      reducer(undefined, { type: MonitorConstants.CHANGE_ALERT_CHANNEL, channel: MonitorConstants.alertChannels.email, enabled: false }).settings.global
        .channels[MonitorConstants.alertChannels.email].enabled
    ).toEqual(false);
    expect(
      reducer(initialState, { type: MonitorConstants.CHANGE_ALERT_CHANNEL, channel: MonitorConstants.alertChannels.email, enabled: true }).settings.global
        .channels[MonitorConstants.alertChannels.email].enabled
    ).toEqual(true);
  });
  it('should handle RECEIVE_DEVICE_ALERTS', async () => {
    expect(
      reducer(undefined, { type: MonitorConstants.RECEIVE_DEVICE_ALERTS, deviceId: defaultState.devices.byId.a1.id, alerts: [] }).alerts.byDeviceId[
        defaultState.devices.byId.a1.id
      ].alerts
    ).toEqual([]);

    expect(
      reducer(initialState, { type: MonitorConstants.RECEIVE_DEVICE_ALERTS, deviceId: defaultState.devices.byId.a1.id, alerts: [123, 456] }).alerts.byDeviceId[
        defaultState.devices.byId.a1.id
      ].alerts
    ).toEqual([123, 456]);
  });
  it('should handle RECEIVE_LATEST_DEVICE_ALERTS', async () => {
    expect(
      reducer(undefined, { type: MonitorConstants.RECEIVE_LATEST_DEVICE_ALERTS, deviceId: defaultState.devices.byId.a1.id, alerts: [] }).alerts.byDeviceId[
        defaultState.devices.byId.a1.id
      ].latest
    ).toEqual([]);

    expect(
      reducer(initialState, { type: MonitorConstants.RECEIVE_LATEST_DEVICE_ALERTS, deviceId: defaultState.devices.byId.a1.id, alerts: [123, 456] }).alerts
        .byDeviceId[defaultState.devices.byId.a1.id].latest
    ).toEqual([123, 456]);
  });
  it('should handle RECEIVE_DEVICE_ISSUE_COUNTS', async () => {
    expect(
      reducer(undefined, {
        type: MonitorConstants.RECEIVE_DEVICE_ISSUE_COUNTS,
        issueType: DEVICE_ISSUE_OPTIONS.monitoring.key,
        counts: { filtered: 1, total: 3 }
      }).issueCounts.byType[DEVICE_ISSUE_OPTIONS.monitoring.key]
    ).toEqual({ filtered: 1, total: 3 });

    expect(
      reducer(initialState, {
        type: MonitorConstants.RECEIVE_DEVICE_ISSUE_COUNTS,
        issueType: DEVICE_ISSUE_OPTIONS.monitoring.key,
        counts: { total: 3 }
      }).issueCounts.byType[DEVICE_ISSUE_OPTIONS.monitoring.key]
    ).toEqual({ total: 3 });
  });
  it('should handle SET_ALERT_LIST_STATE', async () => {
    expect(reducer(undefined, { type: MonitorConstants.SET_ALERT_LIST_STATE, value: { total: 3 } }).alerts.alertList).toEqual({ total: 3 });
    expect(reducer(initialState, { type: MonitorConstants.SET_ALERT_LIST_STATE, value: 'something' }).alerts.alertList).toEqual('something');
  });
});
