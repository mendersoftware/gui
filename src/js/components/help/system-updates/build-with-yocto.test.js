import React from 'react';
import renderer from 'react-test-renderer';
import BuildYocto from './build-with-yocto';

it('renders correctly', () => {
  const tree = renderer.create(<BuildYocto />).toJSON();
  expect(tree).toMatchSnapshot();
});
