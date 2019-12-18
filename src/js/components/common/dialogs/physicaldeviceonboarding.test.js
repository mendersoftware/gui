import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import PhysicalDeviceOnboarding from './physicaldeviceonboarding';

const mockStore = configureStore([]);
const store = mockStore({
  app: {
    features: { isEnterprise: false, isHosted: false },
    hostAddress: null,
    menderDebPackageVersion: null
  },
  users: {
    organization: { tenant_token: null }
  }
});
store.dispatch = jest.fn();

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Provider store={store}>
        <PhysicalDeviceOnboarding />
      </Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
