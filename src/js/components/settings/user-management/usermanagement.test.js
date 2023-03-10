import React from 'react';
import { Provider } from 'react-redux';

import { screen, within } from '@testing-library/react';
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
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const copyCheck = jest.fn(() => true);
    document.execCommand = copyCheck;
    render(
      <Provider store={store}>
        <UserManagement />
      </Provider>
    );

    expect(screen.queryByText(/remove the user with email/i)).not.toBeInTheDocument();
    const list = screen.getAllByText(/view details/i);
    await user.click(list[list.length - 1]);
    await user.click(screen.getByRole('button', { name: /delete user/i }));
    expect(screen.queryByText(/remove the user with email/i)).toBeInTheDocument();
    // const userView = screen.getByText(defaultState.users.byId[userId].email).parentElement;
    // await user.click(within(userView).getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    await user.click(list[list.length - 1]);
    const input = screen.getByDisplayValue(defaultState.users.byId[userId].email);
    await user.clear(input);
    await user.type(input, 'test@test');
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    await user.type(input, '.com');
    expect(screen.queryByText(/enter a valid email address/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: /reset the password/i }));
    await user.click(screen.getByRole('checkbox', { name: /reset the password/i }));
    expect(screen.getByRole('button', { name: /Save/i })).toBeDisabled();
    const selectButton = screen.getByText(/roles/i).parentNode.querySelector('[role=button]');
    await user.click(selectButton);
    const listbox = document.body.querySelector('ul[role=listbox]');
    const listItem = within(listbox).getByText(/admin/i);
    await user.click(listItem);
    await user.type(listbox, '{Escape}');
    await user.click(screen.getByRole('button', { name: /Save/i }));
  });

  it('allows role adjustments', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <Provider store={store}>
        <UserManagement />
      </Provider>
    );
    const list = screen.getAllByText(/view details/i);
    await user.click(list[list.length - 1]);
    const selectButton = screen.getByText(/roles/i).parentNode.querySelector('[role=button]');
    await user.click(selectButton);
    const listbox = document.body.querySelector('ul[role=listbox]');
    const listItem = within(listbox).getByText(/releases/i);
    await user.click(listItem);
    await user.click(screen.getByDisplayValue(defaultState.users.byId[userId].email));
    expect(screen.getByText(/the selected role may prevent/i)).toBeInTheDocument();
  });
});
