import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import { helpProps } from './mockData';
import DeviceSupport from './device-support';

describe('DeviceSupport Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceSupport {...helpProps} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
