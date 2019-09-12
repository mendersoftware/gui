import React from 'react';
import renderer from 'react-test-renderer';
import UpdateModules from './update-modules';

it('renders correctly', () => {
  const tree = renderer.create(<UpdateModules />).toJSON();
  expect(tree).toMatchSnapshot();
});
