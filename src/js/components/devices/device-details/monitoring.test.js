import React from 'react';
import { render } from '@testing-library/react';
import DeviceMonitoring from './monitoring';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('DeviceMonitoring Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceMonitoring alerts={defaultState.monitor.alerts.byDeviceId.a1} device={defaultState.devices.byId.a1} isOffline />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
