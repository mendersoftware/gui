import React from 'react';

import { adminUserCapabilities, defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import DeploymentDeviceListItem from './deploymentdevicelistitem';

describe('DeploymentDeviceListItem Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <DeploymentDeviceListItem
        device={defaultState.deployments.byId.d1.devices.a1}
        idAttribute="Device ID"
        viewLog={jest.fn}
        userCapabilities={adminUserCapabilities}
      />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
