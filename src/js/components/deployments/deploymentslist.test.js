import React from 'react';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import DeploymentsList from './deploymentslist';

describe('DeploymentsList Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <DeploymentsList items={Object.values(defaultState.deployments.byId)} refreshItems={() => {}} type="pending" title="pending" />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
