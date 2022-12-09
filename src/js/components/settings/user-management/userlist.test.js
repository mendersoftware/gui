import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import UserList from './userlist';

describe('UserList Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<UserList users={[]} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
