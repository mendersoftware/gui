import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import DeviceTwin, { Title, TwinError, TwinSyncStatus } from './devicetwin';

describe('DeviceTwin Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <DeviceTwin
          device={{ ...defaultState.devices.byId.a1, twinsByIntegration: { a123: { something: 'test', other: 'misc', ab: 12, nest: { here: 'some' } } } }}
          integrations={[{ id: 'a123', provider: 'iot-hub' }]}
          setDeviceTwin={jest.fn}
        />
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  // ordered like this to trigger empty state + diff count state
  [TwinSyncStatus, TwinSyncStatus, TwinSyncStatus, Title, TwinError].forEach((Component, index) => {
    it(`renders sub component ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(
        <MemoryRouter>
          <Component diffCount={index} twinError={index > 1 ? 'twinError' : ''} providerTitle="Test" updateTime={defaultState.devices.byId.a1.updated_ts} />
        </MemoryRouter>
      );
      const view = baseElement.lastChild.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});
