import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import DeploymentDeviceListItem from './deploymentdevicelistitem';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('DeploymentDeviceListItem Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <DeploymentDeviceListItem device={defaultState.deployments.byId.d1.devices.a1} created="2019-01-01" idAttribute="Device ID" viewLog={jest.fn} />
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
