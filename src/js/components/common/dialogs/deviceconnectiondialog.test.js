import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DeviceConnectionDialog from './deviceconnectiondialog';

const mockStore = configureStore([]);
const store = mockStore({
  app: {
    features: { hasMultitenancy: false, isEnterprise: false, isHosted: false }
  },
  devices: { byStatus: { pending: { total: 0 } } },
  users: { onboarding: { deviceType: '' }, organization: {} }
});

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Provider store={store}>
        <DeviceConnectionDialog />
      </Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
