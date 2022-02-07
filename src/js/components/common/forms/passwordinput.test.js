import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import PasswordInput from './passwordinput';

describe('PasswordInput Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<PasswordInput attachToForm={jest.fn} detachFromForm={jest.fn} id="test" create={true} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
