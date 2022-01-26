import React from 'react';
import FormCheckbox from './formcheckbox';
import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';

describe('FormCheckbox Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<FormCheckbox attachToForm={jest.fn} detachFromForm={jest.fn} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
