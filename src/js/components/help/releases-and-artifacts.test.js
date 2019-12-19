import React from 'react';
import renderer from 'react-test-renderer';
import ReleasesArtifacts from './releases-and-artifacts';

describe('ReleasesArtifacts Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<ReleasesArtifacts />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
