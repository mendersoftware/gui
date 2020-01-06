import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import VirtualDeviceOnboarding from './virtualdeviceonboarding';

const mockStore = configureStore([thunk]);

describe('VirtualDeviceOnboarding Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: { features: { isHosted: false } },
      users: {
        organization: { tenant_token: null }
      }
    });
  });

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
});
