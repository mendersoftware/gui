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

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import * as UserActions from '../../actions/userActions';
import Login from './login';

const mockStore = configureStore([thunk]);

describe('Login Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          isHosted: true
        }
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <Login location={{ state: { from: '' } }} />
      </Provider>
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const loginSpy = jest.spyOn(UserActions, 'loginUser');
    const origDispatch = store.dispatch;
    store.dispatch = jest.fn(origDispatch);
    const ui = (
      <Provider store={store}>
        <Login />
      </Provider>
    );
    const { rerender } = render(ui);

    await user.type(screen.queryByLabelText(/your email/i), 'something@example.com');
    await user.type(screen.queryByLabelText(/password/i), 'mysecretpassword!123');
    expect(screen.queryByLabelText(/Two Factor Authentication Code/i)).not.toBeInTheDocument();
    store.dispatch.mockRejectedValueOnce({ error: '2fa needed' });
    await user.click(screen.getByRole('button', { name: /Log in/i }));
    expect(loginSpy).toHaveBeenCalled();
    await waitFor(() => rerender(ui));
    expect(screen.queryByLabelText(/Two Factor Authentication Code/i)).toBeInTheDocument();
    await user.type(screen.queryByLabelText(/Two Factor Authentication Code/i), '123456');
    await user.click(screen.getByRole('button', { name: /Log in/i }));
    expect(loginSpy).toHaveBeenCalledWith({ email: 'something@example.com', password: 'mysecretpassword!123', token2fa: '123456' }, false);
  });
});
