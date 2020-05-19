import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import SoftwareDistribution from './software-distribution';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Devices Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: {
        features: {
          isEnterprise: false
        }
      },
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
        },
        filteringAttributes: {
          inventoryAttributes: []
        },
        groups: {
          byId: {}
        }
      },
      users: {
        byId: {},
        currentUser: null,
        globalSettings: {},
        onboarding: { complete: false },
        showHelptips: true
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <SoftwareDistribution getAllDevicesByStatus={jest.fn()} />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
