import React from 'react';
import renderer from 'react-test-renderer';
import SelectedArtifact from './selectedartifact';

it('renders correctly', () => {
  const tree = renderer.create(<SelectedArtifact artifact={{ description: 'text' }} />).toJSON();
  expect(tree).toMatchSnapshot();
});
