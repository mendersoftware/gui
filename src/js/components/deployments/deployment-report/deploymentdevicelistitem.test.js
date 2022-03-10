import React from 'react';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import DeploymentDeviceListItem from './deploymentdevicelistitem';

describe('DeploymentDeviceListItem Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <DeploymentDeviceListItem device={defaultState.deployments.byId.d1.devices.a1} created="2019-01-01" idAttribute="Device ID" viewLog={jest.fn} />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
