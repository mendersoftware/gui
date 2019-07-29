import React from 'react';
import renderer from 'react-test-renderer';
import IntegrateDebian from './integrate-debian';

it('renders correctly', () => {
  const tree = renderer.create(<IntegrateDebian />).toJSON();
  expect(tree).toMatchSnapshot();
});
