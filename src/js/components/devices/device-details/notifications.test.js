import React from 'react';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import DeviceNotifications, { DeviceOfflineHeaderNotification, LastConnection, NoAlertsHeaderNotification, ServiceNotification } from './notifications';

describe('tiny components', () => {
  [LastConnection, ServiceNotification, NoAlertsHeaderNotification, DeviceOfflineHeaderNotification].forEach(async Component => {
    it(`renders ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(
        <Component
          alerts={[1, 2]}
          onClick={jest.fn}
          offlineThresholdSettings={{ intervalUnit: 'hour', interval: 24 }}
          updated_ts={defaultState.devices.byId.a1.updated_ts}
        />
      );
      const view = baseElement.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});

describe('DeviceNotifications Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <DeviceNotifications
        device={{
          ...defaultState.devices.byId.a1
        }}
        alerts={defaultState.monitor.alerts.byDeviceId.a1.alerts}
        onClick={jest.fn}
      />
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
