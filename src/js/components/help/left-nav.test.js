import React from 'react';
import { render } from '@testing-library/react';
import LeftNav from './left-nav';
import { undefineds } from '../../../../tests/mockData';

describe('LeftNav Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<LeftNav />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
