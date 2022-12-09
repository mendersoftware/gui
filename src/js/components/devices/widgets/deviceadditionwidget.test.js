import React from 'react';

import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import DeviceAdditionWidget from './deviceadditionwidget';

describe('DeviceAdditionWidget Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceAdditionWidget docsVersion="" features={{}} onConnectClick={jest.fn} tenantCapabilities={{}} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const clickMock = jest.fn();
    render(<DeviceAdditionWidget docsVersion="" features={{}} onConnectClick={clickMock} tenantCapabilities={{}} />);
    act(() => userEvent.click(screen.getByRole('button', { name: /connect a new device/i })));
    expect(clickMock).toHaveBeenCalled();
  });
});
