// Copyright 2021 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React from 'react';

import { adminUserCapabilities, defaultState, undefineds } from '../../../../../tests/mockData';
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
        userCapabilities={adminUserCapabilities}
      />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
