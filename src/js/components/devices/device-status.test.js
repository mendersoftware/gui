import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import DeviceStatus from './device-status';

describe('DeviceStatus Component', () => {
  it('renders correctly', async () => {
    let ui = <DeviceStatus device={{ auth_sets: [{ status: 'pending' }] }} />;
    const { baseElement, rerender } = render(ui);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
    ui = <DeviceStatus device={{ monitor: [{ a: 'b' }] }} />;
    render(ui);
    await waitFor(() => rerender(ui));
    expect(screen.getAllByText(/monitoring/i)[0]).toBeInTheDocument();
    ui = <DeviceStatus device={{ isOffline: true }} />;
    render(ui);
    await waitFor(() => rerender(ui));
    expect(screen.getAllByText(/offline/i)[0]).toBeInTheDocument();
  });
});
