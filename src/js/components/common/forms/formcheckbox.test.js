import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import FormCheckbox from './formcheckbox';

describe('FormCheckbox Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<FormCheckbox attachToForm={jest.fn} detachFromForm={jest.fn} label="testbox" />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
