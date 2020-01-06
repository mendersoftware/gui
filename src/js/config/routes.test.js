import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Routes from './routes';
import Login from '../components/user-management/login';
import Settings from '../components/settings/settings';

const mockStore = configureStore([thunk]);

describe('Router', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: {
        docsVersion: null,
        features: { isDemoMode: false, hasMultitenancy: false },
        hostedAnnouncement: null,
        snackbar: {},
        versionInformation: {}
      },
      deployments: { byStatus: { inprogress: { total: 0 } } },
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

  test('invalid path should redirect to Dashboard', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/random']}>
        <Provider store={store}>{Routes}</Provider>
      </MemoryRouter>
    );
    expect(wrapper.find(Settings)).toHaveLength(0);
    expect(wrapper.find(Login)).toHaveLength(1);
  });

  test('valid path should not redirect to 404', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/']}>
        <Provider store={store}>{Routes}</Provider>
      </MemoryRouter>
    );
    expect(wrapper.find(Settings)).toHaveLength(0);
    expect(wrapper.find(Login)).toHaveLength(1);
  });
});
