import React from 'react';
import renderer from 'react-test-renderer';
import Authsets from './authsets';

it('renders correctly', () => {
  const tree = renderer.create(<Authsets device={{ auth_sets: [] }} />).toJSON();
  expect(tree).toMatchSnapshot();
});
