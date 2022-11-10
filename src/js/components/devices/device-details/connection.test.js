import React from 'react';
import DeviceConnection, { DeviceConnectionMissingNote, DeviceDisconnectedNote, PortForwardLink } from './connection';
import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import { DEVICE_CONNECT_STATES } from '../../../constants/deviceConstants';

describe('tiny DeviceConnection components', () => {
  [DeviceConnectionMissingNote, DeviceDisconnectedNote, PortForwardLink].forEach(async Component => {
    it(`renders ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(<Component docsVersion="" lastConnectionTs={defaultState.devices.byId.a1.updated_ts} />);
      const view = baseElement.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});

describe('DeviceConnection Component', () => {
  const userCapabilities = { canAuditlog: true, canTroubleshoot: true, canWriteDevices: true };
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceConnection device={defaultState.devices.byId.a1} userCapabilities={userCapabilities} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
  it('renders correctly when disconnected', async () => {
    const { baseElement } = render(
      <DeviceConnection device={{ ...defaultState.devices.byId.a1, connect_status: DEVICE_CONNECT_STATES.disconnected }} userCapabilities={userCapabilities} />
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
  it('renders correctly when connected', async () => {
    const { baseElement } = render(
      <DeviceConnection
        device={{ ...defaultState.devices.byId.a1, connect_status: DEVICE_CONNECT_STATES.connected }}
        hasAuditlogs
        userCapabilities={userCapabilities}
      />
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
