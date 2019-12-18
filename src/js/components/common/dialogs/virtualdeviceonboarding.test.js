import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import VirtualDeviceOnboarding from './virtualdeviceonboarding';

const mockStore = configureStore([]);
const store = mockStore({
  app: { features: { isHosted: false } },
  users: {
    organization: { tenant_token: null }
  }
});
store.dispatch = jest.fn();

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Provider store={store}>
          <VirtualDeviceOnboarding />
        </Provider>
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
