import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Pending from './pending-devices';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('PendingDevices Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      devices: {
        byId: {},
        byStatus: {
          accepted: { total: 0 },
          pending: { total: 0, deviceIds: [] }
        },
        filters: [],
        selectedDeviceList: [],
        limit: 500
      },
      users: {
        globalSettings: { id_attribute: null },
        showHelptips: false,
        onboarding: {
          complete: false,
          showTips: true
        }
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <Pending />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
