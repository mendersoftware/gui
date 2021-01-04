import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import DeploymentDeviceListItem from './deploymentdevicelistitem';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('DeploymentDeviceListItem Component', () => {
  it('renders correctly', async () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <DeploymentDeviceListItem device={defaultState.deployments.byId.d1.devices.a1} created="2019-01-01" idAttribute="Device ID" viewLog={jest.fn} />
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
