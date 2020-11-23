import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import SoftwareDevices from './softwaredevices';
import { defaultState, undefineds } from '../../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('SoftwareDevices Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      devices: {
        ...defaultState.devices,
        byStatus: {
          ...defaultState.devices.byStatus,
          accepted: { deviceIds: [], total: 0 },
          pending: { deviceIds: [], total: 0 }
        }
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <SoftwareDevices group={null} deploymentDeviceIds={[]} release={{ Name: 'a1', device_types_compatible: [] }} />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
