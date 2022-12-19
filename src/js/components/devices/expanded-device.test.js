import React from 'react';
import { Provider } from 'react-redux';

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import { EXTERNAL_PROVIDER } from '../../constants/deviceConstants';
import ExpandedDevice from './expanded-device';

const mockStore = configureStore([thunk]);

describe('ExpandedDevice Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          hasDeviceConfig: true,
          hasDeviceConnect: true,
          hasMonitor: true,
          hasMultitenancy: true
        }
      },
      devices: {
        ...defaultState.devices,
        byId: {
          ...defaultState.devices.byId,
          [defaultState.devices.byId.a1.id]: {
            ...defaultState.devices.byId.a1,
            attributes: {
              ...defaultState.devices.byId.a1.attributes,
              mender_is_gateway: true
            }
          }
        },
        groups: {
          ...defaultState.devices.groups,
          selectedGroup: 'testGroup'
        }
      },
      organization: {
        ...defaultState.organization,
        externalDeviceIntegrations: [{ ...EXTERNAL_PROVIDER['iot-hub'], id: 'test' }]
      },
      users: {
        ...defaultState.users,
        onboarding: {
          ...defaultState.onboarding,
          complete: false
        }
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <ExpandedDevice deviceId={defaultState.devices.byId.a1.id} setDetailsTab={jest.fn} />
      </Provider>
    );
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
