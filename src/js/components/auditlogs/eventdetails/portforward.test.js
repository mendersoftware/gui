import React from 'react';
import { waitFor } from '@testing-library/react';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import { PortForward } from './portforward';

describe('PortForward Component', () => {
  it('renders correctly', async () => {
    const detailsMock = jest.fn();
    detailsMock.mockResolvedValue({ start: defaultState.organization.auditlog.events[2].time, end: defaultState.organization.auditlog.events[1].time });
    const ui = (
      <PortForward
        canReadDevices
        item={defaultState.organization.auditlog.events[2]}
        device={defaultState.devices.byId.a1}
        idAttribute="Device ID"
        getSessionDetails={detailsMock}
      />
    );
    const { baseElement, rerender } = render(ui);
    await waitFor(() => rerender(ui));
    jest.advanceTimersByTime(150);
    expect(detailsMock).toHaveBeenCalled();

    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
