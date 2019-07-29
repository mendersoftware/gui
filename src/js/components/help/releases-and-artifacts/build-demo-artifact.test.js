import React from 'react';
import renderer from 'react-test-renderer';
import BuildDemoArtifact from './build-demo-artifact';

it('renders correctly', () => {
  const tree = renderer.create(<BuildDemoArtifact />).toJSON();
  expect(tree).toMatchSnapshot();
});
