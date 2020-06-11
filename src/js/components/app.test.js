import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import App from './app';
import { undefineds } from '../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('App Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      app: {
        hostedAnnouncement: null,
        features: {
          isDemoMode: false
        },
        snackbar: {},
        versionInformation: {}
      },
      deployments: {
        byStatus: {
          inprogress: { total: 0 }
        }
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
        byId: {},
        currentUser: null,
        globalSettings: {},
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
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
