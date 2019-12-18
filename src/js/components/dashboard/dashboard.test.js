import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { mount } from 'enzyme';
import Dashboard from './dashboard';

const mockStore = configureStore([]);
const store = mockStore({
  devices: {
    byStatus: {
      accepted: { deviceIds: [], total: 0 },
      active: { total: 0 },
      inactive: { total: 0 },
      pending: { deviceIds: [], total: 0 }
    }
  },
  deployments: {
    byId: {},
    deploymentDeviceLimit: 500
  },
  users: {
    byId: {},
    currentUser: null,
    showHelptips: true,
    onboarding: { complete: false, showTips: true }
  }
});

it('renders without crashing', () => {
  mount(
    <MemoryRouter>
      <Provider store={store}>
        <Dashboard />
      </Provider>
    </MemoryRouter>
  );
});

it('renders correctly', () => {
  const tree = createMount()(
    <MemoryRouter>
      <Provider store={store}>
        <Dashboard />
      </Provider>
    </MemoryRouter>
  );
  expect(tree.html()).toMatchSnapshot();
});
