import React from 'react';
import renderer from 'react-test-renderer';
import UserList from './userlist';

describe('UserList Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<UserList users={[]} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
