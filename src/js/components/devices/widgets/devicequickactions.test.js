import React from 'react';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import DeviceQuickActions from './devicequickactions';

describe('DeviceQuickActions Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <DeviceQuickActions
        devices={[
          ...Object.values(defaultState.devices.byId),
          {
            id: 'd1',
            auth_sets: [],
            attributes: {
              device_type: 'qemux86-128'
            },
            status: 'pending'
          }
        ]}
        actionCallbacks={{ onAddDevicesToGroup: jest.fn, onAuthorizationChange: jest.fn, onDeviceDismiss: jest.fn, onRemoveDevicesFromGroup: jest.fn }}
        features={{ isHosted: true }}
        selectedGroup=""
        selectedRows={[3]}
        tenantCapabilities={{ isEnterprise: true }}
      />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
