import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DeviceGroups from './device-groups';

const mockStore = configureStore([]);
const store = mockStore({
  devices: {
    groups: {
      byId: {},
      selectedGroup: null
    },
    byStatus: {
      accepted: {
        total: 0,
        deviceIds: []
      }
    },
    filters: [],
    filteringAttributes: { inventoryAttributes: [] },
    selectedDevice: null
  },
  deployments: {
    deploymentDeviceLimit: 5000
  },
  app: {
    features: {
      isEnterprise: false,
      isHosted: false
    }
  },
  users: {
    showHelptips: false
  }
});

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Provider store={store}>
        <DeviceGroups />
      </Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
