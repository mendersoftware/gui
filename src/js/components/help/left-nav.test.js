import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import LeftNav from './left-nav';

describe('LeftNav Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<LeftNav />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
