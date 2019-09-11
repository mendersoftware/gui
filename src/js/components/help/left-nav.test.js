import React from 'react';
import renderer from 'react-test-renderer';
import LeftNav from './left-nav';

it('renders correctly', () => {
  const tree = renderer.create(<LeftNav />).toJSON();
  expect(tree).toMatchSnapshot();
});
