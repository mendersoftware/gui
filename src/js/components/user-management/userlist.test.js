import React from 'react';
import renderer from 'react-test-renderer';
import UserList from './userlist';
import { undefineds } from '../../../../tests/mockData';

describe('UserList Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<UserList users={[]} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
