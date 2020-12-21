import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import SoftwareDevices from './softwaredevices';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('SoftwareDevices Component', () => {
  it('renders correctly', async () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <SoftwareDevices
            group={null}
            groups={defaultState.devices.groups.byId}
            deploymentDeviceIds={[]}
            hasDynamicGroups={true}
            release={{ Name: 'a1', device_types_compatible: [] }}
            releases={Object.values(defaultState.releases.byId)}
          />
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
