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
import { MemoryRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState } from '../../../tests/mockData';
import { PublicRoutes } from './routes';

const mockStore = configureStore([thunk]);

describe('Router', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.features,
          isHosted: true
        }
      }
    });
  });

  test('invalid path should redirect to Dashboard', async () => {
    render(
      <MemoryRouter initialEntries={['/random']}>
        <Provider store={store}>
          <PublicRoutes />
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getAllByText('Log in')).toBeTruthy();
    expect(screen.queryByText('Settings')).toBeFalsy();
  });

  test('valid path should not redirect to 404', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Provider store={store}>
          <PublicRoutes />
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getAllByText('Log in')).toBeTruthy();
    expect(screen.queryByText('Settings')).toBeFalsy();
  });
});
