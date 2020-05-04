import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Rejected from './rejected-devices';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('RejectedDevices Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      devices: {
        byStatus: {
          accepted: { total: 0 },
          rejected: { total: 0, deviceIds: [] }
        },
        filters: [],
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
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
