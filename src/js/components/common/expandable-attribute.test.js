import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import ExpandableAttribute from './expandable-attribute';

describe('ExpandableAttribute Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ExpandableAttribute />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
