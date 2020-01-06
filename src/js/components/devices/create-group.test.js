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
        <CreateGroup open={true} />
      </Provider>
    );
    expect(tree.html()).toMatchSnapshot();
  });
});
