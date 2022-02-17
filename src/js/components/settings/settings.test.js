import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Settings from './settings';

const mockStore = configureStore([thunk]);

describe('Settings Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          isHosted: false,
          hasMultitenancy: true
        }
      },
      organization: {
        ...defaultState.organization,
        organization: {}
      },
      users: {
        ...defaultState.users,
        byId: {},
        currentUser: null
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter initialEntries={['/settings']}>
        <Provider store={store}>
          <Route path="/settings/:section?" component={Settings} />
        </Provider>
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
