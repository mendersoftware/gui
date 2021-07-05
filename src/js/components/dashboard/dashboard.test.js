import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import Dashboard from './dashboard';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Dashboard Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <Dashboard />
        </Provider>
      </MemoryRouter>
    );
    expect(container.firstChild).toMatchSnapshot();
    expect(container).toEqual(expect.not.stringMatching(undefineds));
  });

  it('allows navigating to pending devices', async () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <Dashboard />
          <Switch>
            <Route path="/devices/pending">
              <div>pendings route</div>
            </Route>
          </Switch>
        </Provider>
      </MemoryRouter>
    );
    userEvent.click(screen.getByText(/Pending devices/i));
    await waitFor(() => screen.getByText(/pendings route/i));
    expect(screen.getByText(/pendings route/i)).toBeVisible();
  });

  it('allows navigating to accepted devices', async () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <Dashboard />
          <Switch>
            <Route path="/devices">
              <div>accepted devices route</div>
            </Route>
          </Switch>
        </Provider>
      </MemoryRouter>
    );
    userEvent.click(screen.getByText(/Accepted devices/i));
    await waitFor(() => screen.getByText(/accepted devices route/i));
    expect(screen.getByText(/accepted devices route/i)).toBeVisible();
  });

  it('allows navigating to deployments', async () => {
    const ui = (
      <MemoryRouter>
        <Provider store={store}>
          <Dashboard />
          <Switch>
            <Route path="/deployments">
              <div>deployments route</div>
            </Route>
          </Switch>
        </Provider>
      </MemoryRouter>
    );
    const { rerender } = render(ui);
    await waitFor(() => rerender(ui));
    await waitFor(() => screen.getByText(/View progress/i));
    userEvent.click(screen.getByText(/View progress/i));
    await waitFor(() => screen.getByText(/deployments route/i));
    expect(screen.getByText(/deployments route/i)).toBeVisible();
  });
});
