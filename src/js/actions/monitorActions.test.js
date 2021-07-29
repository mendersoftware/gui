import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState } from '../../../tests/mockData';
import AppConstants from '../constants/appConstants';
import MonitorConstants from '../constants/monitorConstants';
import { changeNotificationSetting, getAlertsForDevice } from './monitorActions';

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
        device: defaultState.devices.byId.a1.id,
        alerts: []
      }
    ];
    const request = store.dispatch(getAlertsForDevice(defaultState.devices.byId.a1.id));
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
