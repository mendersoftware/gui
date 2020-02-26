import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import * as DeviceConstants from '../../../constants/deviceConstants';
import SoftwareDevices from './softwaredevices';

const mockStore = configureStore([thunk]);

describe('SoftwareDevices Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      devices: {
        byId: {},
        selectedDevice: null,
        byStatus: {
          accepted: { deviceIds: [], total: 0 },
          pending: { deviceIds: [], total: 0 }
        },
        groups: {
          byId: {
            [DeviceConstants.UNGROUPED_GROUP.id]: { deviceIds: [] }
          }
        }
      },
      releases: {
        byId: {
          a1: {
            Name: 'a1',
            device_types_compatible: []
          }
        }
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <SoftwareDevices deploymentObject={{ group: null, deploymentDeviceIds: [], release: { device_types_compatible: [] } }} />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
