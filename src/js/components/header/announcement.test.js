import React from 'react';
import { render } from '@testing-library/react';
import Announcement from './announcement';
import { undefineds } from '../../../../tests/mockData';

describe('Announcement Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<Announcement />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
