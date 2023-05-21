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
import { Route, Routes } from 'react-router-dom';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Dashboard from './dashboard';

const mockStore = configureStore([thunk]);

describe('Dashboard Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { container } = render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );
    expect(container.firstChild).toMatchSnapshot();
    expect(container).toEqual(expect.not.stringMatching(undefineds));
  });

  it('allows navigating to pending devices', async () => {
    store = mockStore({
      ...defaultState,
      devices: {
        ...defaultState.devices,
        byStatus: {
          ...defaultState.devices.byStatus,
          accepted: { deviceIds: [], total: 0 }
        }
      }
    });
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices/pending" element={<div>pendings route</div>} />
        </Routes>
      </Provider>
    );
    await user.click(screen.getByText(/Pending devices/i));
    await waitFor(() => screen.queryByText(/pendings route/i));
    expect(screen.getByText(/pendings route/i)).toBeVisible();
  });

  it('allows navigating to accepted devices', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices/*" element={<div>accepted devices route</div>} />
        </Routes>
      </Provider>
    );
    await user.click(screen.getByText(/Accepted devices/i));
    await waitFor(() => screen.queryByText(/accepted devices route/i));
    expect(screen.getByText(/accepted devices route/i)).toBeVisible();
  });

  it('allows navigating to deployments', async () => {
    store = mockStore({
      ...defaultState,
      deployments: {
        ...defaultState.deployments,
        byStatus: {
          ...defaultState.deployments.byStatus,
          inprogress: { deploymentIds: ['d2'], total: 1 }
        }
      }
    });
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const ui = (
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/deployments/*" element={<div>deployments route</div>} />
        </Routes>
      </Provider>
    );
    const { rerender } = render(ui);
    await waitFor(() => rerender(ui));
    await user.click(screen.getAllByText('test deployment 2')[0]);
    await waitFor(() => screen.queryByText(/deployments route/i));
    expect(screen.getByText(/deployments route/i)).toBeVisible();
  });
});
