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

import { act, screen, waitFor } from '@testing-library/react';
import 'jsdom-worker';
import Cookies from 'universal-cookie';

import { defaultState, mockDate, token, undefineds } from '../../../tests/mockData';
import { render } from '../../../tests/setupTests';
import * as DeviceActions from '../actions/deviceActions';
import { TIMEOUTS } from '../constants/appConstants';
import App, { timeout } from './app';

jest.mock('../tracking');

const preloadedState = {
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

const reportsSpy = jest.spyOn(DeviceActions, 'deriveReportsData');

describe('App Component', () => {
  let cookies;
  beforeEach(() => {
    cookies = new Cookies();
    cookies.get.mockReturnValue('omnomnom');
  });
  it(
    'renders correctly',
    async () => {
      window.localStorage.getItem.mockReturnValueOnce('false');
      jest.replaceProperty(window.mender_environment, 'integrationVersion', 'next');

      const ui = <App />;
      const { asFragment, rerender } = render(ui, { preloadedState });
      await waitFor(() => expect(screen.queryByText(/see all deployments/i)).toBeInTheDocument(), { timeout: TIMEOUTS.fiveSeconds });
      await act(async () => {
        jest.runOnlyPendingTimers();
        jest.runAllTicks();
        return new Promise(resolve => resolve(), TIMEOUTS.threeSeconds);
      });
      await waitFor(() => expect(reportsSpy).toHaveBeenCalled(), { timeout: TIMEOUTS.fiveSeconds });
      await waitFor(() => rerender(ui));
      const view = asFragment();
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
      reportsSpy.mockClear();
    },
    10 * TIMEOUTS.oneSecond
  );

  it(
    'works as intended',
    async () => {
      const state = {
        ...preloadedState,
        users: {
          ...preloadedState.users,
          currentUser: 'notNull'
        }
      };
      window.localStorage.getItem.mockReturnValueOnce('false');
      const ui = <App />;
      const { rerender } = render(ui, { preloadedState: state });
      cookies.get.mockReturnValue(token);
      act(() => {
        jest.advanceTimersByTime(timeout + 500);
        jest.runAllTicks();
      });
      cookies.get.mockReturnValue('');
      await waitFor(() => expect(reportsSpy).toHaveBeenCalled(), { timeout: TIMEOUTS.threeSeconds });
      await waitFor(() => rerender(ui));
      await act(async () => {
        jest.runOnlyPendingTimers();
        jest.runAllTicks();
      });
      await waitFor(() => rerender(ui));
      await waitFor(() => expect(screen.queryByText(/Version:/i)).not.toBeInTheDocument(), { timeout: TIMEOUTS.fiveSeconds });
      expect(screen.queryByText(/Northern.tech/i)).toBeInTheDocument();
      expect(screen.queryByText(`© ${mockDate.getFullYear()} Northern.tech`)).toBeInTheDocument();
      await act(async () => {
        jest.runOnlyPendingTimers();
        jest.runAllTicks();
      });
      reportsSpy.mockClear();
    },
    10 * TIMEOUTS.oneSecond
  );
});
