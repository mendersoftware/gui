import React from 'react';
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
} from '@material-ui/core';

import Form from '../common/forms/form';
import FormCheckbox from '../common/forms/formcheckbox';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import { rolesByName } from '../../constants/userConstants';
import { deepCompare } from '../../helpers';

import { OAuth2Providers } from './oauth2providers';

export default class UserForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    const isCreation = !Object.keys(props.user).length;
    this.state = {
      editPass: isCreation,
      hadRoleChanges: false,
      isCreation,
      selectedRoles: (props.user.roles || []).reduce((accu, role) => {
        const foundRole = props.roles.find(currentRole => currentRole.id === role);
        if (foundRole) {
          accu.push(foundRole);
        }
        return accu;
      }, [])
    };
  }

  componentDidUpdate(prevProps, prevState) {
    // TODO: this is needed due to the re-registering of inputs in the form component and should be fixed at some point
    if (prevState.editPass !== this.state.editPass || prevState.selectedRoles !== this.state.selectedRoles) {
      this.forceUpdate();
    }
  }

  onSelect(role) {
    const { selectedRoles } = this.state;
    const {
      user: { roles = [] }
    } = this.props;
    const isSelectedAlready = selectedRoles.some(currentRole => role.id === currentRole.id);
    let newlySelectedRoles;
    if (isSelectedAlready) {
      newlySelectedRoles = selectedRoles.filter(currentRole => role.id !== currentRole.id);
    } else {
      newlySelectedRoles = [...selectedRoles, role];
    }
    const hadRoleChanges =
      roles.length !== newlySelectedRoles.length || roles.some(currentRoleId => !newlySelectedRoles.some(role => currentRoleId === role.id));
    this.setState({ selectedRoles: newlySelectedRoles, hadRoleChanges });
  }

  onSubmit(data) {
    const { submit, user } = this.props;
    const { hadRoleChanges, isCreation } = this.state;
    if (!isCreation && !hadRoleChanges && data.email == user.email) {
      return submit(null, 'edit', user.id, data.password_reset ? data.email : null);
    }
    const { selectedRoles } = this.state;
    let submissionData = Object.assign({}, data, hadRoleChanges ? { roles: selectedRoles.map(role => role.id) } : {});
    delete submissionData['password_new'];
    submissionData['password'] = data.password_new;
    submissionData = Object.entries(submissionData).reduce((accu, [key, value]) => {
      if (!deepCompare(user[key], value)) {
        accu[key] = value;
      }
      return accu;
    }, {});
    return !isCreation ? submit(submissionData, 'edit', user.id, data.password_reset ? data.email : null) : submit(submissionData, 'create');
  }

  render() {
    const self = this;
    const { editPass, isCreation, selectedRoles } = self.state;
    const { closeDialog, currentUser, isAdmin, isEnterprise, roles, user } = self.props;
    const showRoleUsageNotification = selectedRoles.reduce((accu, item) => {
      const hasUiApiAccess = [rolesByName.ci].includes(item.id)
        ? false
        : item.id === rolesByName.admin || item.permissions.some(permission => ![rolesByName.deploymentCreation.action].includes(permission.action));
      if (hasUiApiAccess) {
        return false;
      }
      return typeof accu !== 'undefined' ? accu : true;
    }, undefined);
    const isOAuth2 = !!user.login;
    const provider = isOAuth2 ? OAuth2Providers.find(provider => !!user.login[provider.id]) : null;
    return (
      <Dialog open={true} fullWidth={true} maxWidth="sm">
        <DialogTitle>{isCreation ? 'Create new user' : 'Edit user'}</DialogTitle>
        <DialogContent style={{ overflowY: 'initial' }}>
          <Form
            uniqueId={`usereditform-${editPass}`}
            dialog={true}
            onSubmit={data => self.onSubmit(data)}
            handleCancel={closeDialog}
            submitLabel={isCreation ? 'Create user' : 'Save changes'}
            submitButtonId="submit_button"
            showButtons={true}
            autocomplete="off"
          >
            <TextInput
              hint="Email"
              label="Email"
              id="email"
              value={user.email}
              validations="isLength:1,isEmail"
              required={isCreation}
              disabled={isOAuth2}
              autocomplete="off"
            />
            {isOAuth2 ? (
              <div className="flexbox margin-top-small margin-bottom">
                <div style={{ fontSize: '36px', marginRight: '10px' }}>{provider.icon}</div>
                <div className="info">
                  This user logs in using his <strong>{provider.name}</strong> account.
                  <br />
                  He can connect to {provider.name} to update his login settings.
                </div>
              </div>
            ) : null}
            {isCreation ? (
              <PasswordInput
                className="edit-pass"
                id="password_new"
                label="Password"
                create={true}
                validations={`isLength:8,isNot:${user.email}`}
                edit={false}
                required={true}
                autocomplete="off"
              />
            ) : null}
            {!isOAuth2 && !isCreation ? (
              <FormCheckbox id="password_reset" label="Send an email to the user containing a link to reset the password" checked={false} />
            ) : null}
            {isEnterprise && isAdmin ? (
              <div id="roles-form-container">
                <FormControl id="roles-form">
                  <InputLabel id="roles-selection-label">Roles</InputLabel>
                  <Select
                    labelId="roles-selection-label"
                    id={`roles-selector-${selectedRoles.length}`}
                    multiple
                    value={selectedRoles}
                    required={true}
                    renderValue={selected => selected.map(role => role.title).join(', ')}
                  >
                    {roles.map(role => (
                      <MenuItem key={role.id} value={role} id={role.id} onClick={() => self.onSelect(role)}>
                        <Checkbox id={`${role.id}-checkbox`} checked={selectedRoles.some(item => role.id === item.id)} />
                        <ListItemText id={`${role}-text`} primary={role.title} />
                      </MenuItem>
                    ))}
                  </Select>
                  {showRoleUsageNotification && (
                    <FormHelperText className="info">
                      The selected {pluralize('role', selectedRoles.length)} may prevent {currentUser.email === user.email ? 'you' : <i>{user.email}</i>} from
                      using the Mender UI.
                      <br />
                      Consider adding the <i>Read only</i> role as well.
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
            ) : (
              <></>
            )}
          </Form>
        </DialogContent>
        <DialogActions />
      </Dialog>
    );
  }
}
