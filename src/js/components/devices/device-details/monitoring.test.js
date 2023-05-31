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
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import DeviceMonitoring, { DeviceMonitorsMissingNote } from './monitoring';

const mockStore = configureStore([thunk]);

describe('tiny components', () => {
  [DeviceMonitorsMissingNote].forEach(async Component => {
    it(`renders ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(<Component docsVersion="" />);
      const view = baseElement.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});

describe('DeviceMonitoring Component', () => {
  it('renders correctly', async () => {
    const store = mockStore({
      ...defaultState,
      monitor: {
        ...defaultState.monitor,
        alerts: {
          ...defaultState.monitor.alerts,
          alertList: { page: 2, perPage: 20, total: 9001 },
          byDeviceId: {
            ...defaultState.monitor.alerts.byDeviceId,
            a1: {
              ...defaultState.monitor.alerts.byDeviceId.a1,
              latest: defaultState.monitor.alerts.byDeviceId.a1.alerts
            }
          }
        }
      }
    });
    const { baseElement } = render(
      <Provider store={store}>
        <DeviceMonitoring device={defaultState.devices.byId.a1} isOffline />
      </Provider>
    );
    // special snapshot handling here to work around unstable ids in mui code...
    const view = prettyDOM(baseElement.firstChild.firstChild, 100000, { highlight: false })
      .replace(/id="mui-[0-9]*"/g, '')
      .replace(/aria-labelledby="(mui-[0-9]* *)*"/g, '')
      .replace(/\\/g, '');
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
