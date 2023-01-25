import React from 'react';

import { screen } from '@testing-library/react';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render, selectMaterialUiSelectOption } from '../../../../../tests/setupTests';
import Deployments from './deployments';

describe('Deployments Component', () => {
  it('renders correctly', async () => {
    const deviceDeployments = [
      {
        created: '2021-07-08T17:56:49.366Z',
        deviceId: 'somne-id',
        finished: '2021-07-08T17:58:38.23Z',
        log: true,
        status: 'failure',
        release: 'some-release',
        deploymentStatus: 'inprogress',
        target: 'ALL THE DEVICES'
      }
    ];

    const getDeployments = jest.fn();

    const { baseElement } = render(
      <Deployments
        device={{ ...defaultState.devices.byId.a1, deploymentsCount: 4, deviceDeployments }}
        getDeviceDeployments={getDeployments}
        resetDeviceDeployments={jest.fn}
      />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
    expect(getDeployments).toHaveBeenCalled();

    await selectMaterialUiSelectOption(screen.getByText(/any/i), /in progress/i);
    expect(getDeployments).toHaveBeenLastCalledWith('a1', { filterSelection: ['downloading', 'installing', 'rebooting'], page: 1, perPage: 10 });
  });
});
