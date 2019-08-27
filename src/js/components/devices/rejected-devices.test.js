import React from 'react';
import renderer from 'react-test-renderer';
import Rejected from './rejected-devices';

it('renders correctly', () => {
  const tree = renderer.create(<Rejected />).toJSON();
  expect(tree).toMatchSnapshot();
});
