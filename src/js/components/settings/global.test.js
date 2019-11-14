import React from 'react';
import renderer from 'react-test-renderer';
import { Global } from './global';

it('renders correctly', () => {
  const tree = renderer.create(<Global />).toJSON();
  expect(tree).toMatchSnapshot();
});
