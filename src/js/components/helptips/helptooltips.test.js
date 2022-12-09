import React from 'react';
import { Provider } from 'react-redux';

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import {
  AddGroup,
  AuthButton,
  ConfigureAddOnTip,
  ConfigureRaspberryLedTip,
  ConfigureTimezoneTip,
  DeviceSupportTip,
  ExpandArtifact,
  ExpandDevice
} from './helptooltips';

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
              device_type: ['raspberrypi12']
            }
          }
        }
      }
    });
  });

  [AddGroup, AuthButton, ConfigureAddOnTip, ConfigureRaspberryLedTip, ConfigureTimezoneTip, DeviceSupportTip, ExpandArtifact, ExpandDevice].forEach(
    async Component => {
      it(`renders ${Component.displayName || Component.name} correctly`, () => {
        const { baseElement } = render(
          <Provider store={store}>
            <Component deviceId={defaultState.devices.byId.a1.id} />
          </Provider>
        );
        const view = baseElement.firstChild.childNodes.length > 1 ? baseElement.firstChild.childNodes : baseElement.firstChild.firstChild;
        expect(view).toMatchSnapshot();
      });
    }
  );
});
