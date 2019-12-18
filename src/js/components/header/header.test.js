import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Header from './header';

const mockStore = configureStore([]);
const store = mockStore({
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
    showHelptips: true
  }
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
});
