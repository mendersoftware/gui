import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import CompletedDeployments from './completeddeployments';

it('renders correctly', () => {
  const cutoffDate = new Date('2019-01-01');
  const tree = createMount()(<CompletedDeployments deployments={[]} cutoffDate={cutoffDate} />);
  expect(tree.html()).toMatchSnapshot();
});
