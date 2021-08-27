import reducer, { initialState } from './monitorReducer';
import MonitorConstants from '../constants/monitorConstants';
import { defaultState } from '../../../tests/mockData';

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
});
