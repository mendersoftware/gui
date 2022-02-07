import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import DeviceStatus from './device-status';

describe('DeviceStatus Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceStatus device={{ auth_sets: [{ status: 'pending' }] }} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
