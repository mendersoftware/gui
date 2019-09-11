import React from 'react';
import renderer from 'react-test-renderer';
import DeploymentButton from './deploymentbutton';

it('renders correctly', () => {
  const tree = renderer.create(<DeploymentButton />).toJSON();
  expect(tree).toMatchSnapshot();
});
