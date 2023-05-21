// Copyright 2019 Northern.tech AS
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
import { Provider } from 'react-redux';

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { adminUserCapabilities, defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import Authorized, { Authorized as AuthorizedDevices } from './authorized-devices';
import { routes } from './base-devices';

const mockStore = configureStore([thunk]);

describe('AuthorizedDevices Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      devices: {
        ...defaultState.devices,
        byStatus: {
          ...defaultState.devices.byStatus,
          accepted: {
            deviceIds: [],
            total: 0
          }
        }
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <Authorized onFilterChange={jest.fn} states={routes} />
      </Provider>
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('behaves as expected', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const submitMock = jest.fn();
    const setUserSettingsMock = jest.fn();
    const setListStateMock = jest.fn().mockResolvedValue();
    const testKey = 'testKey';
    const attributeNames = {
      artifact: 'rootfs-image.version',
      deviceType: 'device_type',
      updateTime: 'updated_ts'
    };
    const devices = defaultState.devices.byStatus.accepted.deviceIds.map(id => defaultState.devices.byId[id]);
    const pageTotal = devices.length;
    const deviceListState = { isLoading: false, selectedState: DEVICE_STATES.accepted, selection: [], sort: {} };
    store = mockStore({ ...defaultState });
    let ui = (
      <Provider store={store}>
        <AuthorizedDevices
          acceptedCount={pageTotal}
          addDevicesToGroup={jest.fn}
          advanceOnboarding={jest.fn}
          allCount={40}
          attributes={[]}
          availableIssueOptions={[{ key: 'offline' }]}
          columnSelection={[]}
          currentUser={defaultState.users.byId[defaultState.users.currentUser]}
          customColumnSizes={[{ attribute: { name: attributeNames.updateTime, scope: 'system' }, size: 220 }]}
          deleteAuthset={jest.fn}
          deviceCount={pageTotal}
          deviceListState={deviceListState}
          devices={devices}
          features={{}}
          filters={[]}
          getIssueCountsByType={jest.fn}
          groupFilters={[]}
          idAttribute={'id'}
          onboardingState={{}}
          onGroupClick={jest.fn}
          onGroupRemoval={jest.fn}
          onPreauthClick={jest.fn}
          openSettingsDialog={jest.fn}
          pendingCount={4}
          removeDevicesFromGroup={jest.fn}
          saveUserSettings={setUserSettingsMock}
          selectedGroup={undefined}
          setDeviceFilters={jest.fn}
          setDeviceListState={setListStateMock}
          setSnackbar={jest.fn}
          settingsInitialized={true}
          showHelptips={jest.fn}
          tenantCapabilities={{ hasMonitor: true }}
          updateDevicesAuth={jest.fn}
          updateUserColumnSettings={submitMock}
          userCapabilities={adminUserCapabilities}
        />
      </Provider>
    );
    const { rerender } = render(ui);
    await user.click(screen.getAllByRole('checkbox')[0]);
    expect(setListStateMock).toHaveBeenCalledWith({ selection: [0, 1], setOnly: true });
    await user.click(screen.getByRole('button', { name: /all/i }));
    await user.click(screen.getByRole('option', { name: /devices with issues/i }));
    await user.keyboard('{Escape}');
    expect(setListStateMock).toHaveBeenCalledWith({ page: 1, refreshTrigger: true, selectedIssues: ['offline'] });
    await waitFor(() => rerender(ui));
    await user.click(screen.getByRole('button', { name: /table options/i }));
    await waitFor(() => rerender(ui));
    await user.click(screen.getByRole('menuitem', { name: /customize/i }));
    await waitFor(() => rerender(ui));
    expect(screen.getByText(/Customize Columns/i)).toBeVisible();
    const attributeSelect = screen.getByLabelText(/add a column/i);
    await user.type(attributeSelect, testKey);
    await user.keyboard('{Enter}');
    act(() => jest.advanceTimersByTime(5000));
    await waitFor(() => expect(screen.getByLabelText(/add a column/i)).toBeVisible());
    const button = screen.getByRole('button', { name: /Save/i });
    expect(button).not.toBeDisabled();
    await user.click(button);

    expect(submitMock).toHaveBeenCalledWith([
      { attribute: { name: attributeNames.deviceType, scope: 'inventory' }, size: 150 },
      { attribute: { name: attributeNames.artifact, scope: 'inventory' }, size: 150 },
      { attribute: { name: attributeNames.updateTime, scope: 'system' }, size: 220 },
      { attribute: { name: testKey, scope: 'inventory' }, size: 150 }
    ]);
    expect(setListStateMock).toHaveBeenCalledWith({
      selectedAttributes: [
        { attribute: attributeNames.deviceType, scope: 'inventory' },
        { attribute: attributeNames.artifact, scope: 'inventory' },
        { attribute: attributeNames.updateTime, scope: 'system' },
        { attribute: testKey, scope: 'inventory' }
      ]
    });
    expect(setUserSettingsMock).toHaveBeenCalledWith({
      columnSelection: [
        { id: 'inventory-device_type', key: attributeNames.deviceType, name: attributeNames.deviceType, scope: 'inventory', title: 'Device type' },
        { id: 'inventory-rootfs-image.version', key: attributeNames.artifact, name: attributeNames.artifact, scope: 'inventory', title: 'Current software' },
        { id: 'system-updated_ts', key: attributeNames.updateTime, name: attributeNames.updateTime, scope: 'system', title: 'Last check-in' },
        { id: 'inventory-testKey', key: testKey, name: testKey, scope: 'inventory', title: testKey }
      ]
    });
  });
});
