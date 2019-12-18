import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Deployments from './deployments';

const mockStore = configureStore([]);
const store = mockStore({
  app: {
    hostedAnnouncement: null,
    features: { isEnterprise: false, isHosted: false },
    docsVersion: null
  },
  deployments: {
    byId: {},
    byStatus: {
      finished: { deploymentIds: [], total: 0 },
      inprogress: { deploymentIds: [], total: 0 },
      pending: { deploymentIds: [], total: 0 }
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

it('renders correctly', () => {
  const tree = createMount()(
    <MemoryRouter>
      <Provider store={store}>
        <Deployments location={{ search: '' }} />
      </Provider>
    </MemoryRouter>
  );
  expect(tree.html()).toMatchSnapshot();
});
