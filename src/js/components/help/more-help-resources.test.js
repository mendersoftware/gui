import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import { helpProps } from './mockData';
import MoreHelp from './more-help-resources';

describe('MoreHelp Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<MoreHelp {...helpProps} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
