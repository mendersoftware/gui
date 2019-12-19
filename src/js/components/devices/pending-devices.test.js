import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Pending from './pending-devices';

const mockStore = configureStore([thunk]);
const store = mockStore({
  devices: {
    byId: {},
    byStatus: {
      accepted: { total: 0 },
      pending: { total: 0 }
    },
    selectedDeviceList: [],
    limit: 500
  },
  users: {
    globalSettings: { id_attribute: null },
    showHelptips: false,
    onboarding: {
      complete: false,
      showTips: true
    }
  }
});

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Provider store={store}>
          <Pending />
        </Provider>
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
