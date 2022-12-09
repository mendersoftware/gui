import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import DeviceInventoryLoader from './deviceinventoryloader';

describe('CreateGroup Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceInventoryLoader />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
