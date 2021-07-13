import React from 'react';
import { render } from '@testing-library/react';
import TextInput from './textinput';
import { undefineds } from '../../../../../tests/mockData';

describe('TextInput Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<TextInput attachToForm={jest.fn} detachFromForm={jest.fn} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
