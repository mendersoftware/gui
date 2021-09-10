import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState } from '../../../tests/mockData';
import AppConstants from '../constants/appConstants';
import { DEVICE_ISSUE_OPTIONS } from '../constants/deviceConstants';
import MonitorConstants from '../constants/monitorConstants';
import { changeNotificationSetting, getDeviceAlerts, getIssueCountsByType, getLatestDeviceAlerts } from './monitorActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

/* eslint-disable sonarjs/no-identical-functions */
describe('monitor actions', () => {
  it('should handle device based alert retrieval', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: MonitorConstants.RECEIVE_DEVICE_ALERTS,
        deviceId: defaultState.devices.byId.a1.id,
        alerts: []
      }
    ];
    const request = store.dispatch(getDeviceAlerts(defaultState.devices.byId.a1.id));
    expect(request).resolves.toBeTruthy();
    await request.then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should handle device based latest alert retrieval', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: MonitorConstants.RECEIVE_LATEST_DEVICE_ALERTS,
        deviceId: defaultState.devices.byId.a1.id,
        alerts: []
      }
    ];
    const request = store.dispatch(getLatestDeviceAlerts(defaultState.devices.byId.a1.id));
    expect(request).resolves.toBeTruthy();
    await request.then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should handle device issue count retrieval', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: MonitorConstants.RECEIVE_DEVICE_ISSUE_COUNTS,
        issueType: DEVICE_ISSUE_OPTIONS.monitoring.key,
        counts: { filtered: 0, total: 0 }
      }
    ];
    const request = store.dispatch(getIssueCountsByType(DEVICE_ISSUE_OPTIONS.monitoring.key));
    expect(request).resolves.toBeTruthy();
    await request.then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should handle changes to alert notification settings', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: MonitorConstants.CHANGE_ALERT_CHANNEL,
        channel: 'email',
        enabled: false
      },
      {
        type: AppConstants.SET_SNACKBAR,
        snackbar: {
          message: 'Successfully disabled email alerts'
        }
      }
    ];
    const request = store.dispatch(changeNotificationSetting(false));
    expect(request).resolves.toBeTruthy();
    await request.then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
});
