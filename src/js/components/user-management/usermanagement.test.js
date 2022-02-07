import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { defaultState, userId, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import UserManagement from './usermanagement';

const mockStore = configureStore([thunk]);

describe('UserManagement Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          isEnterprise: true
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
    userEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(screen.queryByText(/remove the user with email/i)).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    const user = screen.getByText(defaultState.users.byId[userId].email).parentElement;
    userEvent.click(within(user).getByRole('button', { name: /edit/i }));
    const input = screen.getByDisplayValue(defaultState.users.byId[userId].email);
    userEvent.clear(input);
    userEvent.type(input, 'test@test');
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    userEvent.type(input, '.com');
    expect(screen.queryByText(/enter a valid email address/i)).not.toBeInTheDocument();
    userEvent.click(screen.getByRole('checkbox', { name: /reset the password/i }));
    userEvent.click(screen.getByRole('checkbox', { name: /reset the password/i }));
    userEvent.click(screen.getByRole('button', { name: /Save changes/i }));
  });

  it('allows role adjustments', async () => {
    render(
      <Provider store={store}>
        <UserManagement />
      </Provider>
    );
    userEvent.click(
      within(screen.getByText(defaultState.users.byId[userId].email).parentElement).getByRole('button', {
        name: /edit/i,
        hidden: true
      })
    );
    const selectButton = screen.getByText(/roles/i).parentNode.querySelector('[role=button]');
    userEvent.click(selectButton);
    const listbox = document.body.querySelector('ul[role=listbox]');
    const listItem = within(listbox).getByText(/releases/i);
    userEvent.click(listItem);
    userEvent.click(screen.getByDisplayValue(defaultState.users.byId[userId].email));
    expect(screen.getByText(/the selected role may prevent/i)).toBeInTheDocument();
  });
});
