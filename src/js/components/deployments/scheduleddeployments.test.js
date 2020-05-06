import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import ScheduledDeployments from './scheduleddeployments';

const mockStore = configureStore([thunk]);

describe('ScheduledDeployments Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: {
        hostedAnnouncement: null,
        features: { isEnterprise: true, isHosted: false },
        docsVersion: null
      },
      deployments: {
        byId: {},
        byStatus: {
          finished: { deploymentIds: [], selectedDeploymentIds: [], total: 0 },
          inprogress: { deploymentIds: [], selectedDeploymentIds: [], total: 0 },
          pending: { deploymentIds: [], selectedDeploymentIds: [], total: 0 },
          scheduled: { deploymentIds: [], selectedDeploymentIds: [], total: 0 }
        },
        selectedDeployment: null
      },
      devices: {
        byId: {},
        byStatus: {
          accepted: {
            total: 0
          },
          pending: {
            total: 0
          }
        },
        groups: { byId: {} },

        limit: 500
      },
      users: {
        byId: { a1: { email: 'a@b.com', id: 'a1' } },
        currentUser: 'a1',
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
            <ScheduledDeployments />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
