import React from 'react';
import { Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { act, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Cookies from 'universal-cookie';
import Signup from './signup';
import { defaultState, token, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';

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
    const view = baseElement.firstChild.firstChild;
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
    await waitFor(() => expect(cookies.set).toHaveBeenLastCalledWith('JWT', token, { maxAge: 900, path: '/', sameSite: 'strict', secure: true }));
    await waitFor(() => screen.getByText(/signed up/i));
  }, 10000);
});
