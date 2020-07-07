import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Header from './header';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Header Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: {
        hostedAnnouncement: null,
        features: { hasMultitenancy: false, isDemoMode: false },
        docsVersion: null
      },
      deployments: {
        byStatus: { inprogress: { total: 0 } }
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
      users: {
        byId: { a1: { email: 'a@b.com', id: 'a1' } },
        currentUser: 'a1',
        globalSettings: {
          a1: {
            trackingConsentGiven: false
          }
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
            <Header />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
