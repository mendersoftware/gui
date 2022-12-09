import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import TextInput from './textinput';

describe('TextInput Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<TextInput attachToForm={jest.fn} detachFromForm={jest.fn} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
