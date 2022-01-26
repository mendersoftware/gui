import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Devices from './devices';
import { helpProps } from './mockData';

describe('GettingStarted Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<Devices {...helpProps} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
