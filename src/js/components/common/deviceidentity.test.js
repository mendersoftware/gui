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

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import { ATTRIBUTE_SCOPES } from '../../constants/deviceConstants';
import DeviceIdentityDisplay from './deviceidentity';

const mockStore = configureStore([thunk]);

describe('DeviceIdentityDisplay Component', () => {
  it('renders correctly', async () => {
    const store = mockStore({
      ...defaultState,
      users: {
        ...defaultState.users,
        globalSettings: { ...defaultState.users.globalSettings, id_attribute: { attribute: 'mac', scope: ATTRIBUTE_SCOPES.identity } }
      }
    });
    const { baseElement } = render(
      <Provider store={store}>
        <DeviceIdentityDisplay device={defaultState.devices.byId.a1} isEditable={false} />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
