import React from 'react';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import DeviceTwin, { Title, TwinError, TwinSyncStatus } from './devicetwin';

describe('DeviceTwin Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <DeviceTwin
        device={{ ...defaultState.devices.byId.a1, twinsByIntegration: { a123: { something: 'test', other: 'misc', ab: 12, nest: { here: 'some' } } } }}
        integrations={[{ id: 'a123', provider: 'iot-hub' }]}
        setDeviceTwin={jest.fn}
      />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  // ordered like this to trigger empty state + diff count state
  [TwinSyncStatus, TwinSyncStatus, TwinSyncStatus, Title, TwinError].forEach((Component, index) => {
    it(`renders sub component ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(
        <Component diffCount={index} twinError={index > 1 ? 'twinError' : ''} providerTitle="Test" updateTime={defaultState.devices.byId.a1.updated_ts} />
      );
      const view = baseElement.lastChild.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});
