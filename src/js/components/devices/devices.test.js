import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { createMount } from '@material-ui/core/test-utils';
import Devices from './devices';

const mockStore = configureStore([]);
const store = mockStore({
  devices: {
    byStatus: {
      accepted: { total: 0 },
      pending: { total: 0 }
    },
    selectedDeviceList: []
  }
});
store.dispatch = jest.fn();

it('renders correctly', () => {
  const tree = createMount()(
    <MemoryRouter>
      <Provider store={store}>
        <Devices />
      </Provider>
    </MemoryRouter>
  );
  expect(tree.html()).toMatchSnapshot();
});
