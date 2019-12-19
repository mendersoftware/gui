import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Devices from './devices';

const mockStore = configureStore([thunk]);

describe('Devices Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: { features: { isEnterprise: false, isHosted: false } },
      deployments: {
        deploymentDeviceLimit: 5000
      },
      devices: {
        byStatus: {
          accepted: { total: 0, deviceIds: [] },
          pending: { total: 0 },
          rejected: { total: 0 }
        },
        filteringAttributes: { inventoryAttributes: [] },
        groups: {
          byId: {},
          selectedGroup: {}
        },
        selectedDeviceList: []
      },
      users: {
        globalSettings: {},
        onboarding: {
          complete: false
        },
        showHelptips: true
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <Devices />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
