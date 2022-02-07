import React from 'react';
import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import EmailVerification from './emailverification';

describe('EmailVerification Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<EmailVerification verifyEmailComplete={jest.fn} verifyEmailStart={jest.fn} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
