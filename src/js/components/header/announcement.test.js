import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Announcement from './announcement';

describe('Announcement Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<Announcement errorIconClassName="" iconClassName="" sectionClassName="" />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
