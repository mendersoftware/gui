import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SelfUserManagement from './selfusermanagement';

const mockStore = configureStore([]);
const store = mockStore({
  app: {
    features: {
      isEnterprise: false,
      isHosted: false
    }
  },
  users: {
    globalSettings: {},
    currentUser: null,
    byId: {}
  }
});

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Provider store={store}>
        <SelfUserManagement />
      </Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
