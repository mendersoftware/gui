import React from 'react';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Cookies from 'universal-cookie';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Signup from './signup';

const mockStore = configureStore([thunk]);

describe('Signup Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <Signup match={{ params: { campaign: '' } }} />
      </Provider>
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('allows signing up', async () => {
    const ui = (
      <Provider store={store}>
        <Signup location={{ state: { from: '' } }} match={{ params: {} }} />
        <Routes>
          <Route path="/" element={<div>signed up</div>} />
        </Routes>
      </Provider>
    );
    const { container, rerender } = render(ui);
    expect(screen.getByText('Sign up with:')).toBeInTheDocument();
    userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    userEvent.paste(screen.getByLabelText('Password *'), 'mysecretpassword!123');
    expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled();
    userEvent.type(screen.getByLabelText(/Confirm password/i), 'mysecretpassword!123');
    expect(container.querySelector('#pass-strength > meter')).toBeVisible();
    await waitFor(() => rerender(ui));
    expect(screen.getByRole('button', { name: /sign up/i })).toBeEnabled();
    act(() => userEvent.click(screen.getByRole('button', { name: /sign up/i })));
    await waitFor(() => screen.getByText('Company or organization name *'));
    act(() => userEvent.type(screen.getByRole('textbox', { name: /company or organization name \*/i }), 'test'));
    expect(screen.getByRole('button', { name: /complete signup/i })).toBeDisabled();
    act(() => userEvent.click(screen.getByRole('checkbox', { name: /by checking this you agree to our/i })));
    await waitFor(() => rerender(ui));
    expect(screen.getByRole('button', { name: /complete signup/i })).toBeEnabled();

    const cookies = new Cookies();
    cookies.set.mockReturnValue();
    await act(async () => {
      userEvent.click(screen.getByRole('button', { name: /complete signup/i }));
      jest.advanceTimersByTime(5000);
      return waitFor(() => expect(container.querySelector('.loaderContainer')).toBeVisible());
    });
    await waitFor(() => rerender(ui));
    await waitFor(() =>
      expect(cookies.set).toHaveBeenLastCalledWith('firstLoginAfterSignup', true, { domain: '.mender.io', maxAge: 60, path: '/', sameSite: false })
    );
  }, 10000);
});
