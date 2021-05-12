import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Login, { Login as LoginComponent } from './login';
import { defaultState, undefineds } from '../../../../tests/mockData';

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
      <MemoryRouter>
        <Provider store={store}>
          <Login location={{ state: { from: '' } }} />
        </Provider>
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const submitCheck = jest.fn().mockResolvedValue();
    const ui = (
      <MemoryRouter>
        <LoginComponent isHosted={true} currentUser={{}} loginUser={submitCheck} logoutUser={jest.fn} setSnackbar={jest.fn} />
      </MemoryRouter>
    );
    const { rerender } = render(ui);

    userEvent.type(screen.queryByLabelText(/your email/i), 'something@example.com');
    userEvent.type(screen.queryByLabelText(/password/i), 'mysecretpassword!123');
    expect(screen.queryByLabelText(/Two Factor Authentication Code/i)).not.toBeInTheDocument();
    submitCheck.mockRejectedValueOnce({ error: '2fa needed' });
    userEvent.click(screen.getByRole('button', { name: /Log in/i }));
    expect(submitCheck).toHaveBeenCalled();
    await waitFor(() => rerender(ui));
    expect(screen.queryByLabelText(/Two Factor Authentication Code/i)).toBeInTheDocument();
    userEvent.type(screen.queryByLabelText(/Two Factor Authentication Code/i), '123456');
    userEvent.click(screen.getByRole('button', { name: /Log in/i }));
    expect(submitCheck).toHaveBeenCalled();
  });
});
