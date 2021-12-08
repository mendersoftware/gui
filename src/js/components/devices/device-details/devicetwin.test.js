import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import DeviceTwin, { TwinSyncStatus } from './devicetwin';

describe('DeviceTwin Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <DeviceTwin
          device={{ ...defaultState.devices.byId.a1, twinsByProvider: { something: 'test', other: 'misc', ab: 12, nest: { here: 'some' } } }}
          setDeviceTwin={jest.fn}
        />
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  [TwinSyncStatus, TwinSyncStatus].forEach((Component, index) => {
    it(`renders sub component ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(<Component diffCount={index} updateTime={defaultState.devices.byId.a1.updated_ts} />);
      const view = baseElement.firstChild.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});
