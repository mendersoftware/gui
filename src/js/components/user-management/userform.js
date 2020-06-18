import React from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  ListItemText,
  InputLabel,
  MenuItem,
  Select
} from '@material-ui/core';

import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import { colors } from '../../themes/mender-theme';

export default class UserForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    const isCreation = !Object.keys(props.user).length;
    this.state = {
      editPass: isCreation,
      isCreation,
      selectedRoles: props.user.roles ? props.user.roles.map(role => props.roles.find(currentRole => currentRole.id === role)) : []
    };
  }

  componentDidUpdate(_, prevState) {
    // TODO: this is needed due to the re-registering of inputs in the form component and should be fixed at some point
    if (prevState.editPass !== this.state.editPass || prevState.selectedRoles !== this.state.selectedRoles) {
      this.forceUpdate();
    }
  }

  handleCheckboxClick(isSelected, role) {
    const foundIndex = this.state.selectedRoles.findIndex(currentRole => role.id === currentRole.id);
    let newlySelectedRoles = [...this.state.selectedRoles];
    if (isSelected) {
      newlySelectedRoles.push(role);
    } else if (foundIndex > -1) {
      newlySelectedRoles.splice(foundIndex);
    }
    this.setState({ selectedRoles: newlySelectedRoles });
  }

  onSubmit(data) {
    const { submit, user } = this.props;
    const { isCreation, selectedRoles } = this.state;
    const submissionData = Object.assign({}, data, selectedRoles.length ? { roles: selectedRoles.map(role => role.id) } : {});
    delete submissionData['password_new'];
    submissionData['password'] = data.password_new;
    return !isCreation ? submit(submissionData, 'edit', user.id) : submit(submissionData, 'create');
  }

  render() {
    const self = this;
    const { editPass, isCreation, selectedRoles } = self.state;
    const { closeDialog, currentUser, isEnterprise, roles, user } = self.props;
    const isAdmin = currentUser.roles && currentUser.roles.some(role => role === 'RBAC_ROLE_PERMIT_ALL');
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
            <TextInput hint="Email" label="Email" id="email" value={user.email} validations="isLength:1,isEmail" required={isCreation} autocomplete="off" />
            {editPass ? (
              <PasswordInput
                className="edit-pass margin-top-small"
                id="password_new"
                label="Password"
                create={editPass}
                validations="isLength:1"
                disabled={!editPass}
                onClear={() => self.setState({ editPass: !editPass })}
                edit={isCreation ? false : true}
                required={isCreation}
                autocomplete="off"
              />
            ) : (
              <Button
                color="primary"
                id="change"
                style={{ marginTop: 15, backgroundColor: colors.expansionBackground }}
                onClick={() => self.setState({ editPass: !editPass })}
              >
                Change password
              </Button>
            )}
            {isEnterprise && isAdmin ? (
              <div id="roles-form-container">
                <FormControl id="roles-form">
                  <InputLabel id="roles-selection-label">Roles</InputLabel>
                  <Select
                    labelId="roles-selection-label"
                    id={`roles-selector-${selectedRoles.length}`}
                    multiple
                    value={selectedRoles}
                    onChange={e => self.setState({ selectedRoles: e.target.value })}
                    required={true}
                    renderValue={selected => selected.map(role => role.title).join(', ')}
                  >
                    {roles.map(role => (
                      <MenuItem key={role.id} value={role} id={role.id}>
                        <Checkbox
                          id={`${role.id}-checkbox`}
                          checked={selectedRoles.some(item => role.id === item.id)}
                          onChange={e => self.handleCheckboxClick(e.target.checked, role)}
                        />
                        <ListItemText id={`${role}-text`} primary={role.title} />
                      </MenuItem>
                    ))}
                  </Select>
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
