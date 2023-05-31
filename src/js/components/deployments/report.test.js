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

import { prettyDOM } from '@testing-library/dom';
import { act, cleanup, waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import DeploymentReport from './report';

const mockStore = configureStore([thunk]);

describe('DeploymentReport Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      deployments: {
        ...defaultState.deployments,
        selectedDeviceIds: [defaultState.deployments.byId.d1.devices.a1.id],
        selectionState: {
          selectedId: defaultState.deployments.byId.d1.id
        }
      }
    });
  });

  afterEach(cleanup);

  it('renders correctly', async () => {
    const ui = (
      <Provider store={store}>
        <DeploymentReport open type="finished" getDeploymentDevices={jest.fn} getDeviceById={jest.fn} getDeviceAuth={jest.fn} />
      </Provider>
    );
    const { asFragment, rerender } = render(ui);
    act(() => jest.advanceTimersByTime(5000));
    await waitFor(() => rerender(ui));
    const view = prettyDOM(asFragment().childNodes[1], 100000, { highlight: false })
      .replace(/id="mui-[0-9]*"/g, '')
      .replace(/aria-labelledby="(mui-[0-9]* *)*"/g, '')
      .replace(/\\/g, '');
    expect(view).toMatchSnapshot();
  });
});
