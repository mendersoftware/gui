import React from 'react';
import renderer from 'react-test-renderer';
import BuildDemoArtifact from './build-demo-artifact';

describe('BuildDemoArtifact Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<BuildDemoArtifact />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
