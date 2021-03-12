import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Login, { Login as LoginComponent } from './login';
import { defaultState, undefineds } from '../../../../tests/mockData';
import { twoFAStates } from '../../constants/userConstants';

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
      },
      users: {
        ...defaultState.users,
        globalSettings: {
          ...defaultState.users.globalSettings,
          [`${defaultState.users.currentUser}_2fa`]: twoFAStates.enabled
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
    render(
      <MemoryRouter>
        <LoginComponent has2FA={true} isHosted={true} currentUser={{}} loginUser={submitCheck} logoutUser={jest.fn} setSnackbar={jest.fn} />
      </MemoryRouter>
    );

    userEvent.type(screen.queryByLabelText(/your email/i), 'something@example.com');
    userEvent.type(screen.queryByLabelText(/password/i), 'mysecretpassword!123');
    userEvent.click(screen.getByRole('button', { name: /Log in/i }));
    expect(submitCheck).not.toHaveBeenCalled();
    userEvent.type(screen.queryByLabelText(/Two Factor Authentication Code/i), '123456');
    userEvent.click(screen.getByRole('button', { name: /Log in/i }));
    expect(submitCheck).toHaveBeenCalled();
  });
});
