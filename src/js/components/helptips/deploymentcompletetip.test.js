import React from 'react';
import renderer from 'react-test-renderer';
import DeploymentCompleteTip from './deploymentcompletetip';

it('renders correctly', () => {
  const tree = renderer.create(<DeploymentCompleteTip />).toJSON();
  expect(tree).toMatchSnapshot();
});
