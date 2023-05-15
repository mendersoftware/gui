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
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { screen, render as testingLibRender, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import * as AppActions from '../../actions/appActions';
import * as UserActions from '../../actions/userActions';
import Password from './password';
import PasswordReset from './passwordreset';

const mockStore = configureStore([thunk]);

const goodPassword = 'mysecretpassword!123';
const badPassword = 'mysecretpassword!546';

describe('PasswordReset Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <PasswordReset match={{ params: { secretHash: '' } }} />
      </Provider>
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    jest.useFakeTimers();
    const snackbarSpy = jest.spyOn(AppActions, 'setSnackbar');
    const completeSpy = jest.spyOn(UserActions, 'passwordResetComplete');

    const secretHash = 'leHash';

    const ui = (
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/password/${secretHash}`]}>
          <Routes>
            <Route path="password" element={<Password />} />
            <Route path="password/:secretHash" element={<PasswordReset />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    const { rerender } = testingLibRender(ui);

    const passwordInput = screen.getByLabelText('Password *');
    await user.type(passwordInput, badPassword);
    await waitFor(() => rerender(ui));
    await user.type(passwordInput, badPassword);
    await user.type(screen.getByLabelText(/confirm password \*/i), goodPassword);
    await user.click(screen.getByRole('button', { name: /Save password/i }));
    expect(snackbarSpy).toHaveBeenCalledWith('The passwords you provided do not match, please check again.', 5000, '');
    await user.clear(passwordInput);
    await user.type(passwordInput, goodPassword, { skipClick: true });
    await waitFor(() => rerender(ui));
    await user.click(screen.getByRole('button', { name: /Save password/i }));
    await waitFor(() => rerender(ui));
    expect(screen.queryByText(/Your password has been updated./i)).toBeInTheDocument();
    expect(completeSpy).toHaveBeenCalledWith(secretHash, goodPassword);
    jest.useRealTimers();
  });
});
