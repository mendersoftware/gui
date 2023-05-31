// Copyright 2019 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
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
