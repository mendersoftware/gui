import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ProgressDeviceList from './deploymentdevicelist';

const mockStore = configureStore([]);
const store = mockStore({
  devices: {
    byId: {}
  },
  users: {
    globalSettings: { id_attribute: null }
  }
});

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Provider store={store}>
        <ProgressDeviceList devices={[]} />
      </Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
