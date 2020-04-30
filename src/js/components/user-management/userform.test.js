import React from 'react';
import renderer from 'react-test-renderer';
import { createMount } from '@material-ui/core/test-utils';
import UserForm from './userform';

describe('UserForm Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(<UserForm currentUser={{}} roles={[]} user={{}} />).html();
    expect(tree).toMatchSnapshot();
  });
});
