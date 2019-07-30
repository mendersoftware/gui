import React from 'react';
import renderer from 'react-test-renderer';
import MyOrganization from './organization';

it('renders correctly', () => {
  const tree = renderer.create(<MyOrganization />).toJSON();
  expect(tree).toMatchSnapshot();
});
