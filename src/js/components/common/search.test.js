import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Search from './search';

describe('Search Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<Search isSearching searchTerm="something" onSearch={jest.fn} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
