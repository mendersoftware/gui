import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render, selectMaterialUiSelectOption } from '../../../../tests/setupTests';
import Roles, { RoleManagement } from './roles';

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
    const roles = Object.values(defaultState.users.rolesById);

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

    const role = screen.getByText(/test description/i).parentElement;
    userEvent.click(within(role).getByText(/view details/i));
    let collapse = screen.getByText(/edit role/i).parentElement.parentElement;
    userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(removeRoleMock).toHaveBeenCalled();
    // expect(screen.getByLabelText(/Role name/i)).toBeDisabled();
    // userEvent.type(within(collapse).getByLabelText(/Name/i), 'test');
    userEvent.click(within(role).getByText(/view details/i));
    collapse = screen.getByText(/edit role/i).parentElement.parentElement;
    const submitButton = within(collapse).getByRole('button', { name: /submit/i }, { hidden: true });
    expect(within(collapse).getByRole('button', { name: /submit/i })).toBeDisabled();
    userEvent.type(within(collapse).getByLabelText(/Description/i), 'something');
    await selectMaterialUiSelectOption(within(collapse).getByText(/search groups/i), Object.keys(groups)[0]);

    let selectButton = within(collapse)
      .getByText(/select/i)
      .parentNode.parentNode.children[1].querySelector('[role=button]');
    // Open the select dropdown
    userEvent.click(selectButton);
    // Get the dropdown element. We don't use getByRole() because it includes <select>s too.
    let listbox = document.body.querySelector('ul[role=listbox]');
    // Click the list item
    let listItem = within(listbox).getByText(/deploy/i);
    userEvent.click(listItem);
    expect(submitButton).not.toBeDisabled();
    await userEvent.click(submitButton);
    expect(editRoleMock).toHaveBeenCalledWith({
      allowUserManagement: false,
      description: `${defaultState.users.rolesById.test.description}something`,
      name: 'test',
      uiPermissions: {
        auditlog: [],
        groups: [
          { disableEdit: false, group: Object.keys(defaultState.devices.groups.byId)[0], uiPermissions: ['read'] },
          { disableEdit: false, group: Object.keys(defaultState.devices.groups.byId)[0], uiPermissions: ['deploy'] },
          { disableEdit: false, group: '', uiPermissions: [] }
        ],
        releases: [],
        userManagement: []
      },
      source: defaultState.users.rolesById.test
    });
  });
});
