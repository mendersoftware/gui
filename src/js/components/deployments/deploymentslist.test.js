import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import DeploymentsList from './deploymentslist';

describe('DeploymentsList Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeploymentsList items={[]} refreshItems={() => {}} type="pending" title="pending" />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
