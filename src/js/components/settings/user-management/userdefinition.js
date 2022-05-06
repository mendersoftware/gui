import React, { useEffect, useMemo, useState } from 'react';
import validator from 'validator';

// material ui
import { Button, Checkbox, Divider, Drawer, FormControl, FormControlLabel, FormHelperText, IconButton, InputLabel, TextField } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

import { UserRolesSelect } from './userform';
import { uiPermissionsById, uiPermissionsByArea } from '../../../constants/userConstants';
import { TwoColumnData } from '../../common/configurationobject';
import { OAuth2Providers } from '../../login/oauth2providers';
import { mapUserRolesToUiPermissions } from '../../../actions/userActions';

export const UserDefinition = ({ canManageUsers, currentUser, onCancel, onSubmit, onRemove, roles, selectedUser }) => {
  const { email = '', id, login } = selectedUser;

  const theme = useTheme();

  const [nameError, setNameError] = useState(false);
  const [hadRoleChanges, setHadRoleChanges] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [shouldResetPassword, setShouldResetPassword] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');

  useEffect(() => {
    setCurrentEmail(email);
  }, [email]);

  useEffect(() => {
    setSelectedRoles(selectedUser.roles || []);
  }, [selectedUser.roles]);

  const validateNameChange = ({ target: { value } }) => {
    setNameError(!validator.isEmail(value) || validator.isEmpty(value));
    setCurrentEmail(value);
  };

  const onRemoveClick = () => {
    onRemove(selectedUser);
  };

  const onRolesSelect = (newlySelectedRoles, hadRoleChanges) => {
    setSelectedRoles(newlySelectedRoles);
    setHadRoleChanges(hadRoleChanges);
  };

  const onSubmitClick = () => {
    if (id && !hadRoleChanges && email === currentEmail) {
      return onSubmit(null, 'edit', id, shouldResetPassword ? email : null);
    }
    const changedRoles = hadRoleChanges ? { roles: selectedRoles } : {};
    const submissionData = { ...selectedUser, ...changedRoles };
    return onSubmit(submissionData, 'edit', id, shouldResetPassword ? currentEmail : null);
  };

  const togglePasswordReset = () => {
    setShouldResetPassword(!shouldResetPassword);
  };

  const { areas, groups } = useMemo(() => {
    const things = { areas: {}, groups: {} };
    if (!(selectedRoles && roles)) {
      return things;
    }
    const mapPermissions = permissions => permissions.map(permission => uiPermissionsById[permission].title).join(', ');

    return Object.entries(mapUserRolesToUiPermissions(selectedRoles, roles)).reduce((accu, [key, values]) => {
      if (key === 'groups') {
        accu[key] = Object.entries(values).reduce((groupsAccu, [name, uiPermissions]) => {
          groupsAccu[name] = mapPermissions(uiPermissions);
          return groupsAccu;
        }, {});
      } else {
        accu.areas[uiPermissionsByArea[key].title] = mapPermissions(values);
      }
      return accu;
    }, things);
  }, [selectedRoles, roles]);

  const isOAuth2 = !!login;
  const provider = isOAuth2 ? OAuth2Providers.find(provider => !!login[provider.id]) : {};
  return (
    <Drawer anchor="right" open={!!id} PaperProps={{ style: { minWidth: 600, width: '50vw' } }}>
      <div className="flexbox margin-bottom-small space-between">
        <h3>Edit user</h3>
        <div className="flexbox center-aligned">
          {currentUser.id !== id && canManageUsers && (
            <Button className="flexbox center-aligned" color="secondary" onClick={onRemoveClick} style={{ marginRight: theme.spacing(2) }}>
              delete user
            </Button>
          )}
          <IconButton onClick={onCancel} aria-label="close">
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <Divider />

      <FormControl style={{ maxWidth: 500 }}>
        <TextField label="Email" id="email" value={currentEmail} disabled={isOAuth2} error={nameError} onChange={validateNameChange} />
        {nameError && <FormHelperText className="warning">Please enter a valid email address</FormHelperText>}
      </FormControl>
      {isOAuth2 ? (
        <div className="flexbox margin-top-small margin-bottom">
          <div style={{ fontSize: '36px', marginRight: '10px' }}>{provider.icon}</div>
          <div className="info">
            This user logs in using his <strong>{provider.name}</strong> account.
            <br />
            He can connect to {provider.name} to update his login settings.
          </div>
        </div>
      ) : (
        <FormControlLabel
          control={<Checkbox checked={shouldResetPassword} onChange={togglePasswordReset} />}
          label="Send an email to the user containing a link to reset the password"
        />
      )}
      <UserRolesSelect currentUser={currentUser} onSelect={onRolesSelect} roles={roles} user={selectedUser} />
      {!!(Object.keys(groups).length || Object.keys(areas).length) && (
        <InputLabel className="margin-top" shrink>
          Role permissions
        </InputLabel>
      )}
      <TwoColumnData config={areas} />
      {!!Object.keys(groups).length && (
        <>
          <div className="slightly-smaller text-muted">Device groups</div>
          <TwoColumnData config={groups} />
        </>
      )}
      <Divider light style={{ marginTop: theme.spacing(4) }} />
      <div className="flexbox centered margin-top" style={{ justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} style={{ marginRight: theme.spacing(2) }}>
          Cancel
        </Button>
        <Button color="secondary" variant="contained" target="_blank" onClick={onSubmitClick}>
          Save
        </Button>
      </div>
    </Drawer>
  );
};

export default UserDefinition;
