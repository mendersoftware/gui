import React from 'react';
import renderer from 'react-test-renderer';
import DeploymentsList from './deploymentslist';

it('renders correctly', () => {
  const tree = renderer.create(<DeploymentsList pending={[]} refreshPending={() => {}} />).toJSON();
  expect(tree).toMatchSnapshot();
});
