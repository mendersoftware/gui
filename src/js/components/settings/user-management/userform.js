// Copyright 2017 Northern.tech AS
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
import React, { useMemo, useState } from 'react';

import { InfoOutlined } from '@mui/icons-material';
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Tooltip
} from '@mui/material';

import pluralize from 'pluralize';

import { rolesById, rolesByName, uiPermissionsById } from '../../../constants/userConstants';
import { toggle } from '../../../helpers';
import Form from '../../common/forms/form';
import PasswordInput from '../../common/forms/passwordinput';
import TextInput from '../../common/forms/textinput';

export const UserRolesSelect = ({ currentUser, onSelect, roles, user }) => {
  const [selectedRoleIds, setSelectedRoleIds] = useState(
    (user.roles || []).reduce((accu, roleId) => {
      const foundRole = roles[roleId];
      if (foundRole) {
        accu.push(roleId);
      }
      return accu;
    }, [])
  );

  const onInputChange = ({ target: { value } }) => {
    const { roles = [] } = user;
    let newlySelectedRoles = value;
    if (value.includes('')) {
      newlySelectedRoles = [];
    }
    const hadRoleChanges =
      roles.length !== newlySelectedRoles.length || roles.some(currentRoleId => !newlySelectedRoles.some(roleId => currentRoleId === roleId));
    setSelectedRoleIds(newlySelectedRoles);
    onSelect(newlySelectedRoles, hadRoleChanges);
  };

  const editableRoles = useMemo(
    () =>
      Object.entries(roles).map(([id, role]) => {
        const enabled = selectedRoleIds.some(roleId => id === roleId);
        return { enabled, id, ...role };
      }),
    [roles, selectedRoleIds]
  );

  const showRoleUsageNotification = useMemo(
    () =>
      selectedRoleIds.reduce((accu, roleId) => {
        const { permissions, uiPermissions } = roles[roleId];
        const hasUiApiAccess = [rolesByName.ci].includes(roleId)
          ? false
          : roleId === rolesByName.admin ||
            permissions.some(permission => ![rolesByName.deploymentCreation.action].includes(permission.action)) ||
            uiPermissions.userManagement.includes(uiPermissionsById.read.value);
        if (hasUiApiAccess) {
          return false;
        }
        return typeof accu !== 'undefined' ? accu : true;
      }, undefined),
    [selectedRoleIds]
  );

  return (
    <FormControl id="roles-form" style={{ maxWidth: 400 }}>
      <InputLabel id="roles-selection-label">Roles</InputLabel>
      <Select
        labelId="roles-selection-label"
        id={`roles-selector-${selectedRoleIds.length}`}
        multiple
        value={selectedRoleIds}
        required
        onChange={onInputChange}
        renderValue={selected => selected.map(role => roles[role].name).join(', ')}
      >
        {editableRoles.map(role => (
          <MenuItem id={role.id} key={role.id} value={role.id}>
            <Checkbox id={`${role.id}-checkbox`} checked={role.enabled} />
            <ListItemText id={`${role.id}-text`} primary={role.name} />
          </MenuItem>
        ))}
      </Select>
      {showRoleUsageNotification && (
        <FormHelperText className="info">
          The selected {pluralize('role', selectedRoleIds.length)} may prevent {currentUser.email === user.email ? 'you' : <i>{user.email}</i>} from using the
          Mender UI.
          <br />
          Consider adding the <i>{rolesById[rolesByName.readOnly].name}</i> role as well.
        </FormHelperText>
      )}
    </FormControl>
  );
};

const PasswordLabel = () => (
  <div className="flexbox center-aligned">
    Optional
    <Tooltip
      title={
        <>
          <p>You can skip setting a password for now - you can opt to send the new user an email containing a password reset link by checking the box below.</p>
          <p>Organizations using Single Sign-On or other means of authorization may want to create users with no password.</p>
        </>
      }
    >
      <InfoOutlined fontSize="small" className="margin-left-small" />
    </Tooltip>
  </div>
);

export const UserForm = ({ closeDialog, currentUser, canManageUsers, isEnterprise, roles, submit }) => {
  const [hadRoleChanges, setHadRoleChanges] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState();
  const [shouldResetPassword, setShouldResetPassword] = useState(false);

  const onSelect = (newlySelectedRoles, hadRoleChanges) => {
    setSelectedRoles(newlySelectedRoles);
    setHadRoleChanges(hadRoleChanges);
  };

  const onSubmit = data => {
    const { password_new: password, ...remainder } = data;
    const roleData = hadRoleChanges ? { roles: selectedRoles } : {};
    return submit({ ...remainder, ...roleData, password }, 'create');
  };

  const togglePasswordReset = () => setShouldResetPassword(toggle);

  return (
    <Dialog open={true} fullWidth={true} maxWidth="sm">
      <DialogTitle>Create new user</DialogTitle>
      <DialogContent style={{ overflowY: 'initial' }}>
        <Form
          uniqueId="usereditform"
          dialog={true}
          onSubmit={onSubmit}
          handleCancel={closeDialog}
          submitLabel="Create user"
          submitButtonId="submit_button"
          showButtons={true}
          autocomplete="off"
        >
          <TextInput hint="Email" label="Email" id="email" validations="isLength:1,isEmail" required autocomplete="off" />
          <PasswordInput
            id="password_new"
            className="edit-pass"
            autocomplete="off"
            create
            edit={false}
            generate
            InputLabelProps={{ shrink: true }}
            label={<PasswordLabel />}
            placeholder="Password"
            validations="isLength:8"
          />
          <FormControlLabel
            control={<Checkbox checked={shouldResetPassword} onChange={togglePasswordReset} />}
            label="Send an email to the user containing a link to reset the password"
          />
          {canManageUsers && isEnterprise && <UserRolesSelect currentUser={currentUser} onSelect={onSelect} roles={roles} user={{}} />}
        </Form>
      </DialogContent>
      <DialogActions />
    </Dialog>
  );
};

export default UserForm;
