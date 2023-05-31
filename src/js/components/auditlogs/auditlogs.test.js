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

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import { prettyDOM } from '@testing-library/dom';
import { screen, render as testingLibRender, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import AuditLogs from './auditlogs';

const mockStore = configureStore([thunk]);

describe('Auditlogs Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState, app: { ...defaultState.app, features: { ...defaultState.app.features, hasAuditlogs: true } } });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Provider store={store}>
          <AuditLogs />
        </Provider>
      </LocalizationProvider>
    );
    const view = prettyDOM(baseElement.firstChild, 100000, { highlight: false })
      .replace(/id="mui-[0-9]*"/g, '')
      .replace(/aria-labelledby="(mui-[0-9]* *)*"/g, '')
      .replace(/\\/g, '');
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as expected', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Provider store={store}>
          <AuditLogs />
        </Provider>
      </LocalizationProvider>
    );
    await user.click(screen.getByText(/last 7 days/i));
    await user.click(screen.getByText(/clear filter/i));
    await user.click(screen.getByRole('button', { name: /Download results as csv/i }));
    await user.click(screen.getByText(/open_terminal/i));
  });

  it('allows navigating by url as expected', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const ui = (
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <MemoryRouter initialEntries={['/auditlog?startDate=2020-01-01']}>
          <Provider store={store}>
            <AuditLogs />
          </Provider>
        </MemoryRouter>
      </LocalizationProvider>
    );
    const { rerender } = testingLibRender(ui);
    await waitFor(() => rerender(ui));
    await user.click(screen.getByText(/clear filter/i));
  });
});
