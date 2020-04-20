import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import DeviceGroups from './device-groups';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('DeviceGroups Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      devices: {
        byStatus: {
          accepted: {
            total: 0,
            deviceIds: []
          },
          rejected: {
            total: 0
          }
        },
        groups: {
          byId: {},
          selectedGroup: null
        },
        filters: [],
        filteringAttributes: {
          identityAttributes: [],
          inventoryAttributes: []
        },
        selectedDevice: null,
        selectedDeviceList: []
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
        globalSettings: {
          id_attribute: null
        },
        onboarding: {
          complete: false
        },
        showHelptips: false
      }
    });
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
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
