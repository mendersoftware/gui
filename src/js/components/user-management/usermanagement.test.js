import React from 'react';
import renderer from 'react-test-renderer';
import UserManagement from './usermanagement';

it('renders correctly', () => {
  const tree = renderer.create(<UserManagement />).toJSON();
  expect(tree).toMatchSnapshot();
});
