import React from 'react';

import { render } from '../../../../../tests/setupTests';
import { undefineds } from '../../../../../tests/mockData';
import UserDataEntry from './userdata-entry';

describe('Login Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<UserDataEntry classes={{ userData: 'test' }} setSnackbar={jest.fn} onSubmit={jest.fn} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
