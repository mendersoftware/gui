import React from 'react';
import renderer from 'react-test-renderer';
import CreateGroup from './create-group';

it('renders correctly', () => {
  const tree = renderer.create(<CreateGroup />).toJSON();
  expect(tree).toMatchSnapshot();
});
