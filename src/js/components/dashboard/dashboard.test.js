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
    render(
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices/pending" element={<div>pendings route</div>} />
        </Routes>
      </Provider>
    );
    userEvent.click(screen.getByText(/Pending devices/i));
    await waitFor(() => screen.getByText(/pendings route/i));
    expect(screen.getByText(/pendings route/i)).toBeVisible();
  });

  it('allows navigating to accepted devices', async () => {
    render(
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices/*" element={<div>accepted devices route</div>} />
        </Routes>
      </Provider>
    );
    userEvent.click(screen.getByText(/Accepted devices/i));
    await waitFor(() => screen.getByText(/accepted devices route/i));
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
    render(
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/deployments/*" element={<div>deployments route</div>} />
        </Routes>
      </Provider>
    );
    await waitFor(() => screen.findByText(/In progress/i));
    userEvent.click(screen.getAllByText('test deployment 2')[0]);
    await waitFor(() => screen.findByText(/deployments route/i));
    expect(screen.getByText(/deployments route/i)).toBeVisible();
  });
});
