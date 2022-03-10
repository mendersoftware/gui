import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import PendingDevices from './pendingdevices';

describe('PendingDevices Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<PendingDevices />);
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
