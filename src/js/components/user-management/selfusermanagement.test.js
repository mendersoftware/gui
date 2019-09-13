import React from 'react';
import renderer from 'react-test-renderer';
import SelfUserManagement from './selfusermanagement';

it('renders correctly', () => {
  const tree = renderer.create(<SelfUserManagement />).toJSON();
  expect(tree).toMatchSnapshot();
});
