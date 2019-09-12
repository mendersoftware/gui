import React from 'react';
import renderer from 'react-test-renderer';
import ArtifactPayload from './artifactPayload';

it('renders correctly', () => {
  const tree = renderer.create(<ArtifactPayload payload={{ files: [], type_info: { type: 'test' } }} />).toJSON();
  expect(tree).toMatchSnapshot();
});
