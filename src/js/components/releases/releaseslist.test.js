import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import ReleasesList from './releaseslist';

describe('ReleasesList Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ReleasesList features={{}} releases={[]} releasesListState={{ sort: { key: 'Name' } }} setReleasesListState={jest.fn} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
