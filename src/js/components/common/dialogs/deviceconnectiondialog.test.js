import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import DeviceConnectionDialog from './deviceconnectiondialog';
import { defaultState } from '../../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('DeviceConnectionDialog Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
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
