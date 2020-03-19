import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import CreateGroup from './create-group';

const mockStore = configureStore([thunk]);

describe('CreateGroup Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      devices: {
        byId: {},
        byStatus: {
          accepted: { deviceIds: [], total: 0 }
        },
        groups: {
          byId: {},
          selectedGroup: null
        },
        selectedDeviceList: [],
        limit: 500
      },
      users: {
        globalSettings: {},
        currentUser: null
      }
    });
  });

  it('renders correctly', () => {
    const tree = createMount()(
      <Provider store={store}>
        <CreateGroup selectedDevices={[]} />
      </Provider>
    );
    expect(tree.html()).toMatchSnapshot();
  });
});
