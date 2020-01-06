import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Rejected from './rejected-devices';

const mockStore = configureStore([thunk]);

describe('RejectedDevices Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      devices: {
        byStatus: {
          rejected: { total: 0 }
        },
        selectedDeviceList: [],
        limit: 500
      },
      users: {
        globalSettings: {}
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <Rejected />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
