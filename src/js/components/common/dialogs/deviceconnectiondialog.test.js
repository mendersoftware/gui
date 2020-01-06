import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import DeviceConnectionDialog from './deviceconnectiondialog';

const mockStore = configureStore([thunk]);

describe('DeviceConnectionDialog Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: {
        features: { hasMultitenancy: false, isEnterprise: false, isHosted: false }
      },
      devices: { byStatus: { pending: { total: 0 } } },
      users: { onboarding: { deviceType: '' }, organization: {} }
    });
  });

  it('renders correctly', () => {
    const tree = createMount()(
      <Provider store={store}>
        <DeviceConnectionDialog open={true} />
      </Provider>
    );
    expect(tree.html()).toMatchSnapshot();
  });
});
