import React from 'react';
import { MemoryRouter } from 'react-router-dom';
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
        filters: [],
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
      <MemoryRouter>
        <Provider store={store}>
          <CreateGroup selectedDevices={[]} />
        </Provider>
      </MemoryRouter>
    );
    expect(tree.html()).toMatchSnapshot();
  });
});
