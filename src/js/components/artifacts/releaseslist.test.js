import React from 'react';
import { render } from '@testing-library/react';
import ReleasesList from './releaseslist';
import { undefineds } from '../../../../tests/mockData';

describe('ReleasesList Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ReleasesList releases={[]} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
