import React from 'react';
import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import UserForm from './userform';

describe('UserForm Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<UserForm currentUser={{}} roles={[]} user={{}} />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
