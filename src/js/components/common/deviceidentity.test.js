import React from 'react';
import { render } from '@testing-library/react';
import DeviceIdentityDisplay from './deviceidentity';
import { defaultState, undefineds } from '../../../../tests/mockData';

describe('DeviceIdentityDisplay Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceIdentityDisplay device={defaultState.devices.byId.a1} isEditable={false} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
