import React from 'react';
import renderer from 'react-test-renderer';
import CreateArtifactDialog from './createartifactdialog';

it('renders correctly', () => {
  const tree = renderer.create(<CreateArtifactDialog />).toJSON();
  expect(tree).toMatchSnapshot();
});
