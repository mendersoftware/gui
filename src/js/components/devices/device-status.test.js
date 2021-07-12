import React from 'react';
import { render } from '@testing-library/react';
import DeviceStatus from './device-status';
import { undefineds } from '../../../../tests/mockData';

describe('DeviceStatus Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceStatus device={{ auth_sets: [{ status: 'pending' }] }} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
