import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import CompletedDeployments from './completeddeployments';

it('renders correctly', () => {
  const tree = createMount()(<CompletedDeployments deployments={[]} cutoffDate="2019-01-01" />);
  expect(tree.html()).toMatchSnapshot();
});
