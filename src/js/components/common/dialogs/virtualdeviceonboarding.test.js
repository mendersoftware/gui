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

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import VirtualDeviceOnboarding, { getDemoDeviceCreationCommand } from './virtualdeviceonboarding';

const mockStore = configureStore([thunk]);

describe('VirtualDeviceOnboarding Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <VirtualDeviceOnboarding />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});

describe('getDemoDeviceCreationCommand function', () => {
  const token = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW5kZXIudGVuYW50IjoiNWY5YWI0ZWQ4ZjhhMzc0NmYwYTIxNjU1IiwiaXNzIjoiTWVuZGVyIiwic3`;
  it('should not contain any template string leftovers', async () => {
    let code = getDemoDeviceCreationCommand();
    expect(code).not.toMatch(/\$\{([^}]+)\}/);
    code = getDemoDeviceCreationCommand(token);
    expect(code).not.toMatch(/\$\{([^}]+)\}/);
  });
  it('should return a sane result', async () => {
    let code = getDemoDeviceCreationCommand();
    expect(code).toMatch('./demo --client up');
    code = getDemoDeviceCreationCommand(token);
    expect(code).toMatch(
      `TENANT_TOKEN='${token}'\ndocker run -it -p 85:85 -e SERVER_URL='https://localhost' \\\n-e TENANT_TOKEN=$TENANT_TOKEN --pull=always mendersoftware/mender-client-qemu`
    );
  });
});
