import React from 'react';
import { render } from '@testing-library/react';
import UserForm from './userform';
import { undefineds } from '../../../../tests/mockData';

describe('UserForm Component', () => {
  it('renders correctly', () => {
    const { baseElement } = render(<UserForm currentUser={{}} roles={[]} user={{}} />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
