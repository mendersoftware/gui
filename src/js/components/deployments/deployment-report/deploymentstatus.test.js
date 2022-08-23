import React from 'react';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';

import DeploymentStatus, { DeploymentPhaseNotification } from './deploymentstatus';

describe('DeploymentStatus Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeploymentStatus deployment={defaultState.deployments.byId.d2} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});

describe('DeploymentPhaseNotification Component', () => {
  const deployment = {
    ...defaultState.deployments.byId.d1,
    stats: {
      ...defaultState.deployments.byId.d1.stats,
      pause_before_committing: 0,
      pause_before_installing: 0,
      pause_before_rebooting: 1
    }
  };
  it('renders correctly', async () => {
    const { baseElement } = render(<DeploymentPhaseNotification deployment={deployment} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
