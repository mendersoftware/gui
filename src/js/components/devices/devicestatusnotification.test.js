import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import DeviceStatusNotification from './devicestatusnotification';

describe('DeviceStatusNotification Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceStatusNotification deviceCount={1} onClick={jest.fn} state={DEVICE_STATES.pending} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const clickMock = jest.fn();
    render(<DeviceStatusNotification deviceCount={1} onClick={clickMock} state={DEVICE_STATES.pending} />);
    userEvent.click(screen.getByText(/pending authorization/i));
    expect(clickMock).toHaveBeenCalled();
  });
});
