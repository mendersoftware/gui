import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Global from './global';

const mockStore = configureStore([]);
const store = mockStore({
  devices: {
    byId: {},
    filteringAttributes: { identityAttributes: ['id_attribute'] },
    filteringAttributesLimit: 10
  },
  users: {
    globalSettings: {}
  }
});

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Provider store={store}>
        <Global />
      </Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
