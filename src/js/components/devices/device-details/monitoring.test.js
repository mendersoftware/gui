import React from 'react';
import { prettyDOM } from '@testing-library/dom';
import { render } from '@testing-library/react';
import DeviceMonitoring, { DeviceMonitorsMissingNote } from './monitoring';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('tiny components', () => {
  [DeviceMonitorsMissingNote].forEach(async Component => {
    it(`renders ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(<Component docsVersion="" />);
      const view = baseElement.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});

describe('DeviceMonitoring Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <DeviceMonitoring
        alerts={defaultState.monitor.alerts.byDeviceId.a1}
        alertListState={{ page: 2, perPage: 20, total: 9001 }}
        device={defaultState.devices.byId.a1}
        getAlerts={jest.fn}
        isOffline
        latestAlerts={defaultState.monitor.alerts.byDeviceId.a1}
        setAlertListState={jest.fn}
      />
    );
    // special snapshot handling here to work around unstable ids in mui code...
    const view = prettyDOM(baseElement.firstChild.firstChild, 100000, { highlight: false })
      .replace(/id="mui-[0-9]*"/g, '')
      .replace(/aria-labelledby="(mui-[0-9]* *)*"/g, '')
      .replace(/\\/g, '');
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
