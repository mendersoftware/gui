import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import { helpProps } from './mockData';
import Support from './support';

describe('Support Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<Support {...helpProps} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
