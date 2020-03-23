import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Preauthorize from './preauthorize-devices';

const mockStore = configureStore([thunk]);

describe('PreauthorizeDevices Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      devices: {
        byStatus: {
          accepted: { total: 0 },
          preauthorized: { total: 0 }
        },
        filters: [],
        selectedDeviceList: [],
        limit: 500
      },
      users: {
        globalSettings: { id_attribute: null }
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <Preauthorize />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
