import React from 'react';
import { render } from '@testing-library/react';
import DeviceConnection from './connection';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('DeviceConnection Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceConnection device={defaultState.devices.byId.a1} setSnackbar={jest.fn} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
