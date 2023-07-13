// Copyright 2019 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React from 'react';

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render, selectMaterialUiSelectOption } from '../../../../tests/setupTests';
import * as UserActions from '../../actions/userActions';
import { ALL_DEVICES } from '../../constants/deviceConstants';
import { ALL_RELEASES } from '../../constants/releaseConstants';
import Roles from './roles';

describe('Roles Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<Roles />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const editRoleSpy = jest.spyOn(UserActions, 'editRole');
    const removeRoleSpy = jest.spyOn(UserActions, 'removeRole');

    render(<Roles />);

    const role = screen.getByText(/test description/i).parentElement;
    await user.click(within(role).getByText(/view details/i));
    let collapse = screen.getByText(/edit role/i).parentElement.parentElement;
    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(removeRoleSpy).toHaveBeenCalled();
    // expect(screen.getByLabelText(/Role name/i)).toBeDisabled();
    // userEvent.type(within(collapse).getByLabelText(/Name/i), 'test');
    await user.click(within(role).getByText(/view details/i));
    collapse = screen.getByText(/edit role/i).parentElement.parentElement;
    await user.type(within(collapse).getByLabelText(/Description/i), 'something');
    const groupSelect = within(collapse).getByText(Object.keys(defaultState.devices.groups.byId)[0]);
    await selectMaterialUiSelectOption(groupSelect, ALL_DEVICES, user);
    expect(screen.getByText(/For 'All devices',/)).toBeVisible();

    const permissionSelect = within(collapse).getByDisplayValue(ALL_DEVICES).parentElement?.parentElement?.parentElement;
    const selectButton = within(within(permissionSelect).getByText(/read/i).parentElement?.parentElement).getByRole('button');
    expect(selectButton).not.toBeDisabled();
    // Open the select dropdown
    // Get the dropdown element. We don't use getByRole() because it includes <select>s too.
    await user.click(selectButton);
    const listbox = await within(document.body).findByRole('listbox');
    expect(listbox).toBeTruthy();

    // Click the list item
    let listItem = within(listbox).getByText(/read/i);
    await user.click(listItem);
    const submitButton = screen.getByRole('button', { name: /submit/i, hidden: true });
    expect(submitButton).toBeDisabled();
    listItem = within(listbox).getByText(/deploy/i);
    await user.click(listItem);
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    expect(editRoleSpy).toHaveBeenCalledWith({
      allowUserManagement: false,
      description: `${defaultState.users.rolesById.test.description}something`,
      name: 'test',
      uiPermissions: {
        auditlog: [],
        groups: [
          { disableEdit: false, item: ALL_DEVICES, uiPermissions: ['deploy'] },
          { disableEdit: false, item: '', uiPermissions: [] }
        ],
        releases: [{ item: ALL_RELEASES, uiPermissions: [] }],
        userManagement: []
      },
      source: { ...defaultState.users.rolesById.test, id: defaultState.users.rolesById.test.name }
    });
  });
});
