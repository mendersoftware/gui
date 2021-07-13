import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import SoftwareDevices from './softwaredevices';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('SoftwareDevices Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
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
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
