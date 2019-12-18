import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import UserManagement from './usermanagement';

const mockStore = configureStore([]);
const store = mockStore({
  app: {
    snackbar: {}
  },
  users: {
    currentUser: null,
    byId: {}
  }
});
store.dispatch = jest.fn();

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
