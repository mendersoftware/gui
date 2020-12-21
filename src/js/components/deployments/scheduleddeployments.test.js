import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import ScheduledDeployments from './scheduleddeployments';
import { defaultState } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('ScheduledDeployments Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          isEnterprise: true,
          isHosted: false
        }
      },
      deployments: {
        ...defaultState.deployments,
        byStatus: {
          ...defaultState.deployments.byStatus,
          scheduled: { deploymentIds: [], selectedDeploymentIds: [], total: 0 }
        }
      }
    });
  });

  it('renders correctly', async () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <ScheduledDeployments />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
