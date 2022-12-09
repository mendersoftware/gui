import React from 'react';
import { Provider } from 'react-redux';

import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds, userId } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import UserManagement from './usermanagement';

const mockStore = configureStore([thunk]);

describe('UserManagement Component', () => {
  let store;
  // eslint-disable-next-line no-unused-vars
  const { roles, ...user } = defaultState.users.byId[userId];
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          isEnterprise: true
        }
      },
      users: {
        ...defaultState.users,
        byId: {
          ...defaultState.users.byId,
          [userId]: user
        }
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <UserManagement />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const copyCheck = jest.fn(() => true);
    document.execCommand = copyCheck;
    render(
      <Provider store={store}>
        <UserManagement />
      </Provider>
    );

    expect(screen.queryByText(/remove the user with email/i)).not.toBeInTheDocument();
    const list = screen.getAllByText(/view details/i);
    userEvent.click(list[list.length - 1]);
    userEvent.click(screen.getByRole('button', { name: /delete user/i }));
    expect(screen.queryByText(/remove the user with email/i)).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    userEvent.click(list[list.length - 1]);
    const input = screen.getByDisplayValue(defaultState.users.byId[userId].email);
    userEvent.clear(input);
    userEvent.type(input, 'test@test');
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    userEvent.type(input, '.com');
    expect(screen.queryByText(/enter a valid email address/i)).not.toBeInTheDocument();
    userEvent.click(screen.getByRole('checkbox', { name: /reset the password/i }));
    userEvent.click(screen.getByRole('checkbox', { name: /reset the password/i }));
    expect(screen.getByRole('button', { name: /Save/i })).toBeDisabled();
    const selectButton = screen.getByText(/roles/i).parentNode.querySelector('[role=button]');
    userEvent.click(selectButton);
    const listbox = document.body.querySelector('ul[role=listbox]');
    const listItem = within(listbox).getByText(/admin/i);
    userEvent.click(listItem);
    act(() => userEvent.type(listbox, '{esc}'));
    userEvent.click(screen.getByRole('button', { name: /Save/i }));
  });

  it('allows role adjustments', async () => {
    render(
      <Provider store={store}>
        <UserManagement />
      </Provider>
    );
    const list = screen.getAllByText(/view details/i);
    userEvent.click(list[list.length - 1]);
    const selectButton = screen.getByText(/roles/i).parentNode.querySelector('[role=button]');
    userEvent.click(selectButton);
    const listbox = document.body.querySelector('ul[role=listbox]');
    const listItem = within(listbox).getByText(/releases/i);
    userEvent.click(listItem);
    userEvent.click(screen.getByDisplayValue(defaultState.users.byId[userId].email));
    expect(screen.getByText(/the selected role may prevent/i)).toBeInTheDocument();
  });
});
