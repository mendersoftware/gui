import React from 'react';
import { render } from '@testing-library/react';
import EmailVerification from './emailverification';
import { undefineds } from '../../../../../tests/mockData';

describe('EmailVerification Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<EmailVerification verifyEmailComplete={jest.fn} verifyEmailStart={jest.fn} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
