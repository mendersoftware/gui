import React from 'react';
import renderer from 'react-test-renderer';
import ReleasesArtifacts from './releases-and-artifacts';

it('renders correctly', () => {
  const tree = renderer.create(<ReleasesArtifacts />).toJSON();
  expect(tree).toMatchSnapshot();
});
