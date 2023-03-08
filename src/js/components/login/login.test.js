import React from 'react';
import { Provider } from 'react-redux';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Login, { Login as LoginComponent } from './login';

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
    const submitCheck = jest.fn().mockResolvedValue();
    const ui = <LoginComponent isHosted={true} currentUser={{}} loginUser={submitCheck} logoutUser={jest.fn} setSnackbar={jest.fn} />;
    const { rerender } = render(ui);

    await user.type(screen.queryByLabelText(/your email/i), 'something@example.com');
    await user.type(screen.queryByLabelText(/password/i), 'mysecretpassword!123');
    expect(screen.queryByLabelText(/Two Factor Authentication Code/i)).not.toBeInTheDocument();
    submitCheck.mockRejectedValueOnce({ error: '2fa needed' });
    await user.click(screen.getByRole('button', { name: /Log in/i }));
    expect(submitCheck).toHaveBeenCalled();
    await waitFor(() => rerender(ui));
    expect(screen.queryByLabelText(/Two Factor Authentication Code/i)).toBeInTheDocument();
    await user.type(screen.queryByLabelText(/Two Factor Authentication Code/i), '123456');
    await user.click(screen.getByRole('button', { name: /Log in/i }));
    expect(submitCheck).toHaveBeenCalled();
  });
});
