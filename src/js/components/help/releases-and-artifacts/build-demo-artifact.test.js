import React from 'react';
import renderer from 'react-test-renderer';
import BuildDemoArtifact from './build-demo-artifact';
import { helpProps } from '../mockData';

describe('BuildDemoArtifact Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<BuildDemoArtifact {...helpProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
