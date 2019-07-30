import React from 'react';
import renderer from 'react-test-renderer';
import UserList from './userlist';

it('renders correctly', () => {
  const tree = renderer.create(<UserList users={[]} />).toJSON();
  expect(tree).toMatchSnapshot();
});
