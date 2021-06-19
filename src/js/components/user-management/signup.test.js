import React from 'react';
import { MemoryRouter, Switch, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Cookies from 'universal-cookie';
import Signup from './signup';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Signup Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <Signup match={{ params: { campaign: '' } }} />
        </Provider>
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('allows signing up', async () => {
    const ui = (
      <MemoryRouter>
        <Provider store={store}>
          <Signup location={{ state: { from: '' } }} match={{ params: {} }} />
          <Switch>
            <Route path="/">
              <div>signed up</div>
            </Route>
          </Switch>
        </Provider>
      </MemoryRouter>
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
    userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() => screen.getByText('Company or organization name *'));
    userEvent.type(screen.getByRole('textbox', { name: /company or organization name \*/i }), 'test');
    expect(screen.getByRole('button', { name: /complete signup/i })).toBeDisabled();
    userEvent.click(screen.getByRole('checkbox', { name: /by checking this you agree to our/i }));
    expect(screen.getByRole('button', { name: /complete signup/i })).toBeEnabled();

    const cookies = new Cookies();
    cookies.set.mockReturnValue();
    await userEvent.click(screen.getByRole('button', { name: /complete signup/i }));
    await waitFor(() => expect(container.querySelector('.loaderContainer')).toBeVisible());
    jest.advanceTimersByTime(5000);
    await waitFor(() => expect(cookies.set).toHaveBeenCalledTimes(2));
    await waitFor(() => screen.getByText(/signed up/i));
  }, 10000);
});
