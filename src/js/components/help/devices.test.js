import React from 'react';
import { render } from '@testing-library/react';
import Devices from './devices';
import { helpProps } from './mockData';
import { undefineds } from '../../../../tests/mockData';

describe('GettingStarted Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<Devices {...helpProps} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
