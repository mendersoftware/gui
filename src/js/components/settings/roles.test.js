import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Roles, { RoleManagement } from './roles';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Roles Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <Roles />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const createRoleMock = jest.fn();
    const editRoleMock = jest.fn();
    const removeRoleMock = jest.fn();
    const groups = defaultState.devices.groups.byId;
    const roles = Object.entries(defaultState.users.rolesById).map(([id, role]) => ({ id, ...role }));

    const ui = (
      <RoleManagement
        createRole={createRoleMock}
        editRole={editRoleMock}
        getDynamicGroups={jest.fn}
        getGroups={jest.fn}
        getRoles={jest.fn}
        groups={groups}
        removeRole={removeRoleMock}
        roles={roles}
      />
    );
    render(ui);

    userEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(removeRoleMock).toHaveBeenCalled();
    const collapse = screen.getByText(/Edit the role/i).parentElement;
    expect(collapse).not.toBeVisible();
    userEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(collapse).toBeVisible();
    expect(screen.getByLabelText(/Role name/i)).toBeDisabled();
    userEvent.type(within(collapse).getByLabelText(/Description/i), 'something');
    expect(within(collapse).getByRole('button', { name: /submit/i })).toBeDisabled();
    userEvent.click(within(collapse).getByLabelText(/manage other users/));
    userEvent.click(within(collapse).getByLabelText(Object.keys(groups)[0]));
    expect(within(collapse).getByRole('button', { name: /submit/i })).not.toBeDisabled();
    await userEvent.click(within(collapse).getByRole('button', { name: /submit/i }));
    expect(editRoleMock).toHaveBeenCalledWith({
      allowUserManagement: true,
      description: `${defaultState.users.rolesById.test.description}something`,
      groups: [Object.keys(defaultState.devices.groups.byId)[0]],
      name: 'test'
    });
  });
});
