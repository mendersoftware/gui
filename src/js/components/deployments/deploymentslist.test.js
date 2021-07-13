import React from 'react';
import { render } from '@testing-library/react';
import DeploymentsList from './deploymentslist';
import { undefineds } from '../../../../tests/mockData';

describe('DeploymentsList Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeploymentsList items={[]} refreshItems={() => {}} type="pending" title="pending" />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
