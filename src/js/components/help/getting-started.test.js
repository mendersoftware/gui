import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import GettingStarted from './getting-started';
import { helpProps } from './mockData';

describe('GettingStarted Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<GettingStarted {...helpProps} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
