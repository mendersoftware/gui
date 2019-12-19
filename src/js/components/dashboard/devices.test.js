import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Devices from './devices';

const mockStore = configureStore([thunk]);
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
      active: {
        total: 0
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
  const tree = renderer
    .create(
      <MemoryRouter>
        <Provider store={store}>
          <Devices getAllDevicesByStatus={jest.fn()} />
        </Provider>
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
