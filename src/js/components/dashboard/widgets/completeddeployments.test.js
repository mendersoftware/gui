import React from 'react';
import renderer from 'react-test-renderer';
import CompletedDeployments from './completeddeployments';

it('renders correctly', () => {
  const tree = renderer.create(<CompletedDeployments deployments={[]} />).toJSON();
  expect(tree).toMatchSnapshot();
});
