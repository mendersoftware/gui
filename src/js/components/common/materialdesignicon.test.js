import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import MaterialDesignIcon from './materialdesignicon';

describe('MaterialDesignIcon Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<MaterialDesignIcon />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
