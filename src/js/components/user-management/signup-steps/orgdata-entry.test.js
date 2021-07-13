import React from 'react';
import { render } from '@testing-library/react';
import { undefineds } from '../../../../../tests/mockData';
import OrgDataEntry from './orgdata-entry';

describe('Login Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<OrgDataEntry data={{}} setSnackbar={jest.fn} onSubmit={jest.fn} recaptchaSiteKey="test" />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
