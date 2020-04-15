import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Authorized from './authorized-devices';

const mockStore = configureStore([thunk]);

describe('AuthorizedDevices Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: {
        features: { hasMultitenancy: false, isEnterprise: false, isHosted: false }
      },
      deployments: { deploymentDeviceLimit: 5000 },
      devices: {
        byStatus: {
          accepted: { deviceIds: [], total: 0 },
          rejected: { deviceIds: [], total: 0 }
        },
        filters: [],
        filteringAttributes: {
          identityAttributes: [],
          inventoryAttributes: []
        },
        groups: {
          selectedGroup: null,
          byId: {}
        },
        selectedDeviceList: []
      },
      users: {
        globalSettings: {
          previousFilters: []
        },
        onboarding: {
          complete: false,
          showTips: true
        },
        showHelptips: true
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <Authorized devices={[]} onFilterChange={jest.fn} />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
