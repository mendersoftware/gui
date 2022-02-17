import React from 'react';

import { render } from '../../../../../tests/setupTests';
import { undefineds } from '../../../../../tests/mockData';
import Form from './form';

describe('Form Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<Form showButtons={true} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
