import React from 'react';
import renderer from 'react-test-renderer';
import ReleasesArtifacts from './releases-and-artifacts';
import { helpProps } from './mockData';

describe('ReleasesArtifacts Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<ReleasesArtifacts {...helpProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
