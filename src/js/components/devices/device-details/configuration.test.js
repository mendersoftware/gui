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

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import * as DeviceActions from '../../../actions/deviceActions';
import Configuration, { ConfigEditingActions, ConfigEmptyNote, ConfigUpToDateNote, ConfigUpdateFailureActions, ConfigUpdateNote } from './configuration';

describe('tiny components', () => {
  [ConfigEditingActions, ConfigUpdateFailureActions, ConfigUpdateNote, ConfigEmptyNote, ConfigUpToDateNote].forEach(async Component => {
    it(`renders ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(
        <Component
          isAccepted={true}
          isSetAsDefault={true}
          isUpdatingConfig={true}
          onCancel={jest.fn}
          onSetAsDefaultChange={jest.fn}
          onSubmit={jest.fn}
          setShowLog={jest.fn}
          updated_ts="testgroup"
        />
      );
      const view = baseElement.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});

describe('Configuration Component', () => {
  const reportedTime = '2019-01-01T09:25:01.000Z';
  it('renders correctly', async () => {
    const { baseElement } = render(
      <Configuration
        device={{
          ...defaultState.devices.byId.a1,
          config: {
            configured: { uiPasswordRequired: true, foo: 'bar', timezone: 'GMT+2' },
            reported: { uiPasswordRequired: true, foo: 'bar', timezone: 'GMT+2' },
            updated_ts: defaultState.devices.byId.a1.updated_ts,
            reported_ts: reportedTime
          }
        }}
      />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it.only('works as expected', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const applyDeviceConfigSpy = jest.spyOn(DeviceActions, 'applyDeviceConfig').mockRejectedValueOnce({}).mockResolvedValue({});
    const setDeviceConfigSpy = jest.spyOn(DeviceActions, 'setDeviceConfig');
    let device = {
      ...defaultState.devices.byId.a1,
      config: {
        configured: {},
        reported: {},
        updated_ts: defaultState.devices.byId.a1.updated_ts,
        reported_ts: reportedTime
      }
    };
    let ui = <Configuration device={device} />;
    const { rerender } = render(ui);
    expect(screen.queryByRole('button', { name: /import configuration/i })).not.toBeInTheDocument();
    while (screen.queryByRole('button', { name: /edit/i })) {
      await user.click(screen.getByRole('button', { name: /edit/i }));
      await waitFor(() => rerender(ui));
    }
    expect(screen.getByRole('button', { name: /import configuration/i })).toBeInTheDocument();
    const fabButton = document.querySelector('.MuiFab-root');
    expect(fabButton).toBeDisabled();
    await user.type(screen.getByPlaceholderText(/key/i), 'testKey');
    await user.type(screen.getByPlaceholderText(/value/i), 'testValue');
    expect(fabButton).not.toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: /save/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => rerender(ui));

    expect(screen.getByText(/Configuration could not be updated on device/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Retry/i }));
    await waitFor(() => rerender(ui));
    ui = <Configuration device={preloadedState.devices.byId.a1} />;
    act(() => jest.advanceTimersByTime(TIMEOUTS.twoSeconds));
    await act(async () => {
      jest.runAllTimers();
      jest.runAllTicks();
    });
    await waitFor(() => rerender(ui));
    await waitFor(() => expect(document.querySelector('.loaderContainer')).not.toBeInTheDocument());

    expect(screen.getByText(/aNumber/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /edit/i }));
    await waitFor(() => expect(screen.getByDisplayValue(/something/i)).toBeInTheDocument(), { timeout: 3000 });
    await user.type(screen.getByDisplayValue('something'), 'testKey');
    await user.type(screen.getByDisplayValue('else'), 'testValue');
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => rerender(ui));
    expect(screen.queryByText(/key/i)).not.toBeInTheDocument();

    // await user.click(screen.getByRole('button', { name: /View log/i }));
    // expect(screen.queryByText(logContent)).toBeInTheDocument();
    // const logDialog = screen.getByText(/Config update log/i).parentElement.parentElement;
    // await user.click(within(logDialog).getByText(/Cancel/i));
  });
});
