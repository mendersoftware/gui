import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import GroupDeviceList from './group-device-list';
import { undefineds } from '../../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('GroupDeviceList Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      devices: {
        byStatus: {
          accepted: { deviceIds: [], total: 0 }
        }
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
          <GroupDeviceList selectedDevices={[]} />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
