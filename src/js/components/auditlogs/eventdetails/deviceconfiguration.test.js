import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { defaultState, undefineds } from '../../../../../tests/mockData';
import { DeviceConfiguration } from './deviceconfiguration';

describe('DeviceConfiguration Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <DeviceConfiguration
          device={defaultState.devices.byId.a1}
          item={{ ...defaultState.organization.events[2], change: '{"something":"here"}' }}
          onClose={jest.fn}
        />
      </MemoryRouter>
    );

    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
