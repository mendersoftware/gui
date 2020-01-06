import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import UserManagement from './usermanagement';

const mockStore = configureStore([thunk]);

describe('UserManagement Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: {
        snackbar: {}
      },
      users: {
        currentUser: null,
        byId: {}
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <UserManagement />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
