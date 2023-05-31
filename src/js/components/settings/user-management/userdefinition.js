// Copyright 2021 Northern.tech AS
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
import React, { useEffect, useMemo, useState } from 'react';

// material ui
import { Close as CloseIcon } from '@mui/icons-material';
import { Button, Checkbox, Divider, Drawer, FormControl, FormControlLabel, FormHelperText, IconButton, InputLabel, TextField } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import validator from 'validator';

import { mapUserRolesToUiPermissions } from '../../../actions/userActions';
import { uiPermissionsByArea, uiPermissionsById } from '../../../constants/userConstants';
import { toggle } from '../../../helpers';
import { TwoColumnData } from '../../common/configurationobject';
import { OAuth2Providers, genericProvider } from '../../login/oauth2providers';
import { UserRolesSelect } from './userform';

const useStyles = makeStyles()(theme => ({
  actionButtons: { justifyContent: 'flex-end' },
  divider: { marginTop: theme.spacing(4) },
  leftButton: { marginRight: theme.spacing(2) },
  oauthIcon: { fontSize: '36px', marginRight: 10 },
  widthLimit: { maxWidth: 500 }
}));

export const getUserSSOState = user => {
  const { sso = [] } = user;
  const isOAuth2 = !!sso.length;
  const provider = isOAuth2 ? OAuth2Providers.find(provider => sso.some(({ kind }) => kind.includes(provider.id))) ?? genericProvider : null;
  return { isOAuth2, provider };
};

const mapPermissions = permissions => permissions.map(permission => uiPermissionsById[permission].title).join(', ');

const scopedPermissionAreas = ['groups', 'releases'];

export const UserDefinition = ({ currentUser, isEnterprise, onCancel, onSubmit, onRemove, roles, selectedUser }) => {
  const { email = '', id } = selectedUser;

  const { classes } = useStyles();

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
    const submissionData = { ...selectedUser, ...changedRoles, email: currentEmail };
    return onSubmit(submissionData, 'edit', id, shouldResetPassword ? currentEmail : null);
  };

  const togglePasswordReset = () => setShouldResetPassword(toggle);

  const { areas, groups } = useMemo(() => {
    const emptySelection = { areas: {}, groups: {}, releases: {} };
    if (!(selectedRoles && roles)) {
      return emptySelection;
    }

    return Object.entries(mapUserRolesToUiPermissions(selectedRoles, roles)).reduce((accu, [key, values]) => {
      if (scopedPermissionAreas.includes(key)) {
        accu[key] = Object.entries(values).reduce((groupsAccu, [name, uiPermissions]) => {
          groupsAccu[name] = mapPermissions(uiPermissions);
          return groupsAccu;
        }, {});
      } else {
        accu.areas[uiPermissionsByArea[key].title] = mapPermissions(values);
      }
      return accu;
    }, emptySelection);
  }, [selectedRoles, roles]);

  const isSubmitDisabled = !selectedRoles.length;

  const { isOAuth2, provider } = getUserSSOState(selectedUser);
  return (
    <Drawer anchor="right" open={!!id} PaperProps={{ style: { minWidth: 600, width: '50vw' } }}>
      <div className="flexbox margin-bottom-small space-between">
        <h3>Edit user</h3>
        <div className="flexbox center-aligned">
          {currentUser.id !== id && (
            <Button className={`flexbox center-aligned ${classes.leftButton}`} color="secondary" onClick={onRemoveClick}>
              delete user
            </Button>
          )}
          <IconButton onClick={onCancel} aria-label="close">
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <Divider />
      <FormControl className={classes.widthLimit}>
        <TextField label="Email" id="email" value={currentEmail} disabled={isOAuth2 || currentUser.id === id} error={nameError} onChange={validateNameChange} />
        {nameError && <FormHelperText className="warning">Please enter a valid email address</FormHelperText>}
      </FormControl>
      {isOAuth2 ? (
        <div className="flexbox margin-top-small margin-bottom">
          <div className={classes.oauthIcon}>{provider.icon}</div>
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
      {isEnterprise && (
        <>
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
        </>
      )}
      <Divider className={classes.divider} light />
      <div className={`flexbox centered margin-top ${classes.actionButtons}`}>
        <Button className={classes.leftButton} onClick={onCancel}>
          Cancel
        </Button>
        <Button color="secondary" variant="contained" disabled={isSubmitDisabled} target="_blank" onClick={onSubmitClick}>
          Save
        </Button>
      </div>
    </Drawer>
  );
};

export default UserDefinition;
