import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import CreateDeployment from './createdeployment';

const mockStore = configureStore([thunk]);

describe('CreateDeployment Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      app: {
        features: {
          isEnterprise: true,
          isHosted: false
        }
      },
      devices: {
        byStatus: {
          accepted: { deviceIds: [], total: 0 },
          pending: { deviceIds: [], total: 0 }
        },
        selectedDevice: null,
        groups: {
          byId: {}
        },
        limit: 500
      },
      releases: {
        byId: {},
        selectedRelease: null
      },
      users: {
        globalSettings: {
          retries: 0
        },
        organization: {
          plan: 'professional'
        }
      }
    });
  });

  it('renders correctly', () => {
    const tree = createMount()(
      <MemoryRouter>
        <Provider store={store}>
          <CreateDeployment open={true} deploymentObject={{ group: null, deploymentDeviceIds: [], release: { device_types_compatible: [] } }} />
        </Provider>
      </MemoryRouter>
    ).html();
    expect(tree).toMatchSnapshot();
  });
});
