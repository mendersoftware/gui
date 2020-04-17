import React from 'react';
import renderer from 'react-test-renderer';
import BuildDemoArtifact from './build-demo-artifact';
import { helpProps } from '../mockData';
import { undefineds } from '../../../../../tests/mockData';

describe('BuildDemoArtifact Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<BuildDemoArtifact {...helpProps} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
