import React from 'react';
import SoftwareDevices from './softwaredevices';
import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';

describe('SoftwareDevices Component', () => {
  it('renders correctly', async () => {
    const getReleasesMock = jest.fn();
    getReleasesMock.mockResolvedValue();
    const { baseElement } = render(
      <SoftwareDevices
        getReleases={getReleasesMock}
        groups={defaultState.devices.groups.byId}
        hasDynamicGroups={true}
        releases={Object.keys(defaultState.releases.byId)}
        releasesById={defaultState.releases.byId}
        setDeploymentSettings={jest.fn}
      />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
