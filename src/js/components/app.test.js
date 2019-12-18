import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import App from './app';

const mockStore = configureStore([]);
const store = mockStore({
  app: {
    hostedAnnouncement: null
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
    limit: 500
  },
  releases: {
    artifactProgress: 0,
    uploadInProgress: false
  },
  users: {
    currentUser: null,
    onboarding: {
      complete: false,
      showCreateArtifactDialog: false,
      showConnectDeviceDialog: false,
      showTipsDialog: false
    },
    organization: {},
    showHelptips: true
  }
});

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Provider store={store}>
          <App />
        </Provider>
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
