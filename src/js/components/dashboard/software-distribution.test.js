import React from 'react';
import { Provider } from 'react-redux';

import { act, waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import { chartTypes } from '../../constants/appConstants';
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

describe('Devices Component', () => {
  it('renders correctly', async () => {
    let store = mockStore(state);
    const { baseElement } = render(
      <Provider store={store}>
        <SoftwareDistribution getDeviceAttributes={jest.fn} getReportingLimits={jest.fn} getReportsData={jest.fn} getGroupDevices={jest.fn} />
      </Provider>
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
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
    await waitFor(() => rerender(ui));
    await act(async () => {});
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
