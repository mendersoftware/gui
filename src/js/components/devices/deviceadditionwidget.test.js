import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeviceAdditionWidget from './deviceadditionwidget';
import { undefineds } from '../../../../tests/mockData';

describe('DeviceAdditionWidget Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceAdditionWidget docsVersion="" onConnectClick={jest.fn} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const clickMock = jest.fn();
    render(<DeviceAdditionWidget docsVersion="" onConnectClick={clickMock} />);
    act(() => userEvent.click(screen.getByRole('button', { name: /connect a new device/i })));
    expect(clickMock).toHaveBeenCalled();
  });
});
