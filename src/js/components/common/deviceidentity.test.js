import React from 'react';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import DeviceIdentityDisplay from './deviceidentity';

describe('DeviceIdentityDisplay Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceIdentityDisplay device={defaultState.devices.byId.a1} isEditable={false} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
