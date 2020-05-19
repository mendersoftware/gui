import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import UserForm from './userform';
import { undefineds } from '../../../../tests/mockData';

describe('UserForm Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(<UserForm currentUser={{}} roles={[]} user={{}} />).html();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
