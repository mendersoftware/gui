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

import { act, screen, waitFor } from '@testing-library/react';
import 'jsdom-worker';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Cookies from 'universal-cookie';

import { defaultState, mockDate, token, undefineds } from '../../../tests/mockData';
import { render } from '../../../tests/setupTests';
import { TIMEOUTS } from '../constants/appConstants';
import { getConfiguredStore } from '../reducers';
import App, { timeout } from './app';

jest.mock('../tracking');

const mockStore = configureStore([thunk]);

const state = {
  ...defaultState,
  app: {
    ...defaultState.app,
    trackerCode: 'testtracker',
    versionInformation: {
      Integration: 'next'
    }
  },
  deployments: {
    ...defaultState.deployments,
    byId: {},
    byStatus: {
      ...defaultState.deployments.byStatus,
      inprogress: {
        ...defaultState.deployments.byStatus.inprogress,
        total: 0
      }
    },
    deploymentDeviceLimit: null
  }
};

describe('App Component', () => {
  let cookies;
  beforeEach(() => {
    cookies = new Cookies();
    cookies.get.mockReturnValue('omnomnom');
  });
  it('renders correctly', async () => {
    const store = mockStore(state);

    window.localStorage.getItem.mockReturnValueOnce('false');
    const ui = (
      <Provider store={store}>
        <App />
      </Provider>
    );
    const { asFragment, rerender } = render(ui);
    await waitFor(() => expect(screen.queryByText(/see all deployments/i)).toBeInTheDocument(), { timeout: TIMEOUTS.fiveSeconds });
    await act(async () => {
      jest.runOnlyPendingTimers();
      jest.runAllTicks();
      return new Promise(resolve => resolve(), TIMEOUTS.threeSeconds);
    });
    await waitFor(() => rerender(ui));
    const view = asFragment();
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const store = getConfiguredStore({
      preloadedState: {
        ...state,
        users: {
          ...state.users,
          currentUser: 'notNull'
        }
      }
    });
    window.localStorage.getItem.mockReturnValueOnce('false');
    const ui = (
      <Provider store={store}>
        <App />
      </Provider>
    );
    const { rerender } = render(ui);
    cookies.get.mockReturnValue(token);
    act(() => {
      jest.advanceTimersByTime(timeout + 500);
      jest.runAllTicks();
    });
    cookies.get.mockReturnValue('');
    await waitFor(() => rerender(ui));
    await act(async () => {
      jest.runOnlyPendingTimers();
      jest.runAllTicks();
      return new Promise(resolve => resolve(), TIMEOUTS.threeSeconds);
    });
    await waitFor(() => rerender(ui));
    await waitFor(() => expect(screen.queryByText(/Version:/i)).not.toBeInTheDocument(), { timeout: TIMEOUTS.fiveSeconds });
    expect(screen.queryByText(/Northern.tech/i)).toBeInTheDocument();
    expect(screen.queryByText(`© ${mockDate.getFullYear()} Northern.tech`)).toBeInTheDocument();
    await act(async () => {
      jest.runOnlyPendingTimers();
      jest.runAllTicks();
      return new Promise(resolve => resolve(), TIMEOUTS.fiveSeconds);
    });
  }, 10000);
});
