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
          getReleases={jest.fn}
          groups={defaultState.devices.groups.byId}
          hasDynamicGroups={true}
          releases={Object.values(defaultState.releases.byId)}
          setDeploymentSettings={jest.fn}
        />
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
