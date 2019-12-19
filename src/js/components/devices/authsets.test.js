import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Authsets from './authsets';

const mockStore = configureStore([thunk]);
const store = mockStore({
  devices: {
    byId: {
      a1: {
        auth_sets: []
      }
    }
  }
});

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Provider store={store}>
        <Authsets device={{ id: 'a1' }} />
      </Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
