import React from 'react';
import { render } from '@testing-library/react';
import Loader from './loader';
import { undefineds } from '../../../../tests/mockData';

describe('Loader Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<Loader />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
