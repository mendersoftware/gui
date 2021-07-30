import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { act, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import PasswordReset, { PasswordReset as PasswordResetComponent } from './passwordreset';
import { defaultState, undefineds } from '../../../../tests/mockData';

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
      <MemoryRouter>
        <Provider store={store}>
          <PasswordReset match={{ params: { secretHash: '' } }} />
        </Provider>
      </MemoryRouter>
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
      <MemoryRouter>
        <PasswordResetComponent match={{ params: { secretHash } }} passwordResetComplete={submitCheck} setSnackbar={snackbar} />
      </MemoryRouter>
    );
    const { rerender } = render(ui);

    const passwordInput = screen.getByLabelText('Password *');
    act(() => userEvent.paste(passwordInput, badPassword));
    await waitFor(() => rerender(ui));
    act(() => userEvent.paste(passwordInput, badPassword));
    userEvent.type(screen.getByLabelText(/confirm password \*/i), goodPassword);
    userEvent.click(screen.getByRole('button', { name: /Save password/i }));
    expect(snackbar).toHaveBeenCalledWith('The passwords you provided do not match, please check again.', 5000, '');
    act(() => userEvent.clear(screen.getByDisplayValue(badPassword)));
    await waitFor(() => rerender(ui));
    act(() => userEvent.paste(passwordInput, goodPassword));
    await waitFor(() => rerender(ui));
    submitCheck.mockResolvedValue();
    act(() => userEvent.click(screen.getByRole('button', { name: /Save password/i })));
    await waitFor(() => rerender(ui));
    expect(submitCheck).toHaveBeenCalledWith(secretHash, goodPassword);
    expect(screen.queryByText(/Your password has been updated./i)).toBeInTheDocument();
  });
});
