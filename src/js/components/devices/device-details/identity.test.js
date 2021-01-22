import React from 'react';
import { render } from '@testing-library/react';
import DeviceIdentity from './identity';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('DeviceIdentity Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceIdentity device={defaultState.devices.byId.a1} setSnackbar={jest.fn} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
