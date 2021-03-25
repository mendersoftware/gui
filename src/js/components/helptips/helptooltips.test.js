import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { AddGroup, AuthButton, ConfigureRaspberryLedTip, ConfigureTimezoneTip, DeviceSupportTip, ExpandArtifact, ExpandDevice } from './helptooltips';
import { defaultState } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Helptooltips Components', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          hasMultitenancy: true,
          isHosted: true
        }
      },
      devices: {
        ...defaultState.devices,
        byId: {
          ...defaultState.devices.byId,
          a1: {
            ...defaultState.devices.byId.a1,
            attributes: {
              ...defaultState.devices.byId.a1.attributes,
              device_type: 'raspberrypi12'
            }
          }
        }
      }
    });
  });

  [AddGroup, AuthButton, ConfigureRaspberryLedTip, ConfigureTimezoneTip, DeviceSupportTip, ExpandArtifact, ExpandDevice].forEach(async Component => {
    it(`renders ${Component.displayName || Component.name} correctly`, () => {
      const tree = renderer
        .create(
          <MemoryRouter>
            <Provider store={store}>
              <Component deviceId={defaultState.devices.byId.a1.id} />
            </Provider>
          </MemoryRouter>
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
