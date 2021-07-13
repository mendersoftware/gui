import React from 'react';
import { render } from '@testing-library/react';
import UserList from './userlist';
import { undefineds } from '../../../../tests/mockData';

describe('UserList Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<UserList users={[]} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
