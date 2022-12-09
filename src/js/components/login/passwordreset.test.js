import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { act, screen, render as testingLibRender, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import { Password } from './password';
import PasswordReset, { PasswordReset as PasswordResetComponent } from './passwordreset';

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
    const submitCheck = jest.fn();
    const snackbar = jest.fn();
    const secretHash = 'leHash';

    const ui = (
      <MemoryRouter initialEntries={[`/password/${secretHash}`]}>
        <Routes>
          <Route path="password" element={<Password />} />
          <Route path="password/:secretHash" element={<PasswordResetComponent passwordResetComplete={submitCheck} setSnackbar={snackbar} />} />
        </Routes>
      </MemoryRouter>
    );
    const { rerender } = testingLibRender(ui);

    const passwordInput = screen.getByLabelText('Password *');
    act(() => userEvent.paste(passwordInput, badPassword));
    userEvent.type(screen.getByLabelText(/confirm password \*/i), goodPassword);
    userEvent.click(screen.getByRole('button', { name: /Save password/i }));
    expect(snackbar).toHaveBeenCalledWith('The passwords you provided do not match, please check again.', 5000, '');
    act(() => userEvent.clear(screen.getByDisplayValue(badPassword)));
    await waitFor(() => rerender(ui));
    act(() => userEvent.paste(passwordInput, goodPassword));
    await waitFor(() => rerender(ui));
    submitCheck.mockResolvedValue(true);
    act(() => userEvent.click(screen.getByRole('button', { name: /Save password/i })));
    await waitFor(() => rerender(ui));
    expect(submitCheck).toHaveBeenCalledWith(secretHash, goodPassword);
    expect(screen.queryByText(/Your password has been updated./i)).toBeInTheDocument();
  });
});
