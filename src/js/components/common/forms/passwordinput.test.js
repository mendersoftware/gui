import React from 'react';
import { render } from '@testing-library/react';
import PasswordInput from './passwordinput';
import { undefineds } from '../../../../../tests/mockData';

describe('PasswordInput Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<PasswordInput attachToForm={jest.fn} detachFromForm={jest.fn} id="test" create={true} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
