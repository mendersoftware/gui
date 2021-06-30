import React from 'react';
import { render } from '@testing-library/react';
import DeploymentPhaseNotification from './deploymentphasenotification';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('PhaseProgress Component', () => {
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
