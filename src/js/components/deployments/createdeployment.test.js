import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import CreateDeployment from './createdeployment';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('CreateDeployment Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.features,
          isEnterprise: true,
          isHosted: false
        }
      },
      releases: {
        ...defaultState.releases,
        byId: {}
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
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
