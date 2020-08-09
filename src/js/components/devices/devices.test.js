import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Devices from './devices';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Devices Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      devices: {
        ...defaultState.devices,
        byStatus: {
          ...defaultState.devices.byStatus,
          accepted: { total: 0, deviceIds: [] }
        },
        groups: {
          ...defaultState.devices.groups,
          byId: {}
        }
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <Devices />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
