import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import CompletedDeployments from './completeddeployments';

describe('CompletedDeployments Component', () => {
  it('renders correctly', async () => {
    const cutoffDate = new Date('2019-01-01');
    const { baseElement } = render(<CompletedDeployments deployments={[]} cutoffDate={cutoffDate} />);
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
