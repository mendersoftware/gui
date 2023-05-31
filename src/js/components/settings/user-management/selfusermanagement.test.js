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

import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import SelfUserManagement from './selfusermanagement';

const mockStore = configureStore([thunk]);

describe('SelfUserManagement Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    store = mockStore({
      ...defaultState,
      users: {
        ...defaultState.users,
        byId: {
          ...defaultState.users.byId,
          [defaultState.users.currentUser]: {
            ...defaultState.users.byId[defaultState.users.currentUser],
            sso: [{ kind: 'oauth2/google' }]
          }
        }
      }
    });
    const { baseElement } = render(
      <Provider store={store}>
        <SelfUserManagement />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    store = mockStore({ ...defaultState, app: { ...defaultState.app, features: { ...defaultState.app.features, isEnterprise: true } } });

    const copyCheck = jest.fn(() => true);
    document.execCommand = copyCheck;
    const ui = (
      <Provider store={store}>
        <SelfUserManagement />
      </Provider>
    );
    const { rerender } = render(ui);

    await user.click(screen.getByRole('button', { name: /email/i }));
    const input = screen.getByDisplayValue(defaultState.users.byId.a1.email);
    await user.clear(input);
    await user.type(input, 'test@test');
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    await user.type(input, '.com');
    expect(screen.queryByText(/enter a valid email address/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await user.click(screen.getByRole('button', { name: /change password/i }));
    const form = screen.getByLabelText('Password *').parentElement.parentElement.parentElement.parentElement;
    const passwordGeneration = within(form).getByRole('button', { name: /generate/i });
    await user.click(passwordGeneration);
    expect(copyCheck).toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    await user.click(screen.getByText(/Enable Two Factor authentication/i));
    await waitFor(() => rerender(ui));
    expect(screen.getByText(/Scan the QR code on the right/i)).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/Verification code/i), '1234');
    expect(screen.getByText(/Must be at least 6 characters long/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Verify/i })).toBeDisabled();
    await user.type(screen.getByPlaceholderText(/Verification code/i), '56');
    expect(screen.getByRole('button', { name: /Verify/i })).not.toBeDisabled();
    expect(screen.queryByText(/Must be at least 6 characters long/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Verify/i }));
    act(() => {
      jest.runAllTimers();
      jest.runAllTicks();
    });
    await waitFor(() => rerender(ui));
    await waitFor(() => expect(screen.queryByText(/Verifying/)).not.toBeInTheDocument(), { timeout: 5000 });
    await user.click(screen.getByRole('button', { name: /Save/i }));
    await act(async () => {});
    await waitFor(() => rerender(ui));
  }, 15000);
});
