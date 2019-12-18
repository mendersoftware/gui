import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Devices from './devices';

const mockStore = configureStore([]);
const store = mockStore({
  deployments: {
    deploymentDeviceLimit: 5000
  },
  devices: {
    byId: {},
    byStatus: {
      accepted: {
        total: 0,
        deviceIds: []
      },
      inactive: {
        total: 0
      },
      pending: {
        total: 0
      }
    }
  },
  users: {
    onboarding: { complete: false },
    showHelptips: true
  }
});

it('renders correctly', () => {
  const tree = createMount()(
    <MemoryRouter>
      <Provider store={store}>
        <Devices />
      </Provider>
    </MemoryRouter>
  );
  expect(tree.html()).toMatchSnapshot();
});
