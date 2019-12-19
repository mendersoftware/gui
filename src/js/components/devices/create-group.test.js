import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import CreateGroup from './create-group';

const mockStore = configureStore([thunk]);
const store = mockStore({
  devices: {
    byId: {},
    selectedDeviceList: [],
    limit: 500
  },
  users: {
    globalSettings: {},
    currentUser: null
  }
});

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Provider store={store}>
        <CreateGroup open={false} getDevicesByStatus={jest.fn()} />
      </Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
