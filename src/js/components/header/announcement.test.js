import React from 'react';
import Linkify from 'react-linkify';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Announcement from './announcement';

jest.mock('react-linkify');

describe('Announcement Component', () => {
  it('renders correctly', async () => {
    Linkify.default = jest.fn();
    Linkify.default.mockReturnValue(null);
    const { baseElement } = render(<Announcement errorIconClassName="" iconClassName="" sectionClassName="" />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
