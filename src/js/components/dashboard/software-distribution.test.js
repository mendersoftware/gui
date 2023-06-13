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

import { act, waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import * as DeviceActions from '../../actions/deviceActions';
import { TIMEOUTS, chartTypes } from '../../constants/appConstants';
import { rootfsImageVersion } from '../../constants/releaseConstants';
import SoftwareDistribution from './software-distribution';

const mockStore = configureStore([thunk]);

const state = {
  ...defaultState,
  devices: {
    ...defaultState.devices,
    reports: [
      {
        items: [
          { key: 'something', count: 10 },
          { key: 'somethingMore', count: 20 }
        ],
        otherCount: 12,
        total: 42
      },
      {
        items: [
          { key: 'something', count: 10 },
          { key: 'somethingMore', count: 20 }
        ],
        otherCount: 12,
        total: 42
      }
    ]
  },
  users: {
    ...defaultState.users,
    globalSettings: {
      ...defaultState.users.globalSettings,
      [defaultState.users.currentUser]: {
        ...defaultState.users.globalSettings[defaultState.users.currentUser],
        reports: [
          { group: Object.keys(defaultState.devices.groups.byId)[0], attribute: 'artifact_name', type: 'distribution', chartType: chartTypes.pie.key },
          { group: Object.keys(defaultState.devices.groups.byId)[1], software: rootfsImageVersion, type: 'distribution', chartType: chartTypes.bar.key }
        ]
      }
    }
  }
};

const reportsSpy = jest.spyOn(DeviceActions, 'deriveReportsData');

describe('Devices Component', () => {
  it('renders correctly', async () => {
    let store = mockStore(state);
    const ui = (
      <Provider store={store}>
        <SoftwareDistribution />
      </Provider>
    );

    const { baseElement, rerender } = render(ui);
    await act(async () => {
      jest.runAllTimers();
      jest.runAllTicks();
      return new Promise(resolve => resolve(), TIMEOUTS.threeSeconds);
    });
    await waitFor(() => expect(reportsSpy).toHaveBeenCalled());
    await waitFor(() => rerender(ui));
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
    reportsSpy.mockClear();
  });

  it('renders correctly for enterprise', async () => {
    let store = mockStore({
      ...state,
      app: {
        ...state,
        features: {
          ...state.app.features,
          isEnterprise: true
        }
      }
    });
    const ui = (
      <Provider store={store}>
        <SoftwareDistribution />
      </Provider>
    );
    const { baseElement, rerender } = render(ui);
    await act(async () => {
      jest.runAllTimers();
      jest.runAllTicks();
      return new Promise(resolve => resolve(), TIMEOUTS.threeSeconds);
    });
    await waitFor(() => expect(reportsSpy).toHaveBeenCalled());
    await waitFor(() => rerender(ui));
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
