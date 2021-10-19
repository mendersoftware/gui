import React, { useState, useMemo } from 'react';
import pluralize from 'pluralize';
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  ListItemText,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';

import Form from '../../common/forms/form';
import TextInput from '../../common/forms/textinput';
import PasswordInput from '../../common/forms/passwordinput';
import { rolesById, rolesByName, uiPermissionsById } from '../../../constants/userConstants';

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
            uiPermissions.userManagement.some(permission => permission === uiPermissionsById.read.value);
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
        renderValue={selected => selected.map(role => roles[role].title).join(', ')}
      >
        {editableRoles.map(role => (
          <MenuItem id={role.id} key={role.id} value={role.id}>
            <Checkbox id={`${role.id}-checkbox`} checked={role.enabled} />
            <ListItemText id={`${role.id}-text`} primary={role.title} />
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

export const UserForm = ({ closeDialog, currentUser, isAdmin, isEnterprise, roles, submit }) => {
  const [hadRoleChanges, setHadRoleChanges] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState();

  const onSelect = (newlySelectedRoles, hadRoleChanges) => {
    setSelectedRoles(newlySelectedRoles);
    setHadRoleChanges(hadRoleChanges);
  };

  const onSubmit = data => {
    let submissionData = Object.assign({}, data, hadRoleChanges ? { roles: selectedRoles } : {});
    delete submissionData['password_new'];
    submissionData['password'] = data.password_new;
    return submit(submissionData, 'create');
  };

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
            className="edit-pass"
            id="password_new"
            label="Password"
            create={true}
            validations="isLength:8"
            edit={false}
            required={true}
            autocomplete="off"
          />
          {isEnterprise && isAdmin && <UserRolesSelect currentUser={currentUser} onSelect={onSelect} roles={roles} user={{}} />}
        </Form>
      </DialogContent>
      <DialogActions />
    </Dialog>
  );
};

export default UserForm;
