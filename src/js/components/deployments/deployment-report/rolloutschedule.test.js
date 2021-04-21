import React from 'react';
import { render } from '@testing-library/react';
import DeploymentStatus from './deploymentstatus';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('DeploymentStatus Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeploymentStatus deployment={defaultState.deployments.byId.d2} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
