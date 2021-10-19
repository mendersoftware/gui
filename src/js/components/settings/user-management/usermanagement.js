import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
// material ui
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { setSnackbar } from '../../../actions/appActions';
import { createUser, editUser, getUserList, passwordResetStart, removeUser } from '../../../actions/userActions';
import { getCurrentUser, getIsEnterprise, getUserRoles } from '../../../selectors';
import UserList from './userlist';
import UserForm from './userform';
import { UserDefinition } from './userdefinition';

const actions = {
  create: 'createUser',
  edit: 'editUser',
  remove: 'removeUser'
};

export const UserManagement = props => {
  const { currentUser, getUserList, isAdmin, passwordResetStart, roles, setSnackbar, users } = props;
  const [showCreate, setShowCreate] = useState(false);
  const [removeDialog, setRemoveDialog] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    getUserList();
  }, []);

  useEffect(() => {
    getUserList();
  }, [currentUser.id, users.length]);

  const openEdit = user => {
    setUser(user);
    setRemoveDialog(false);
    setSnackbar('');
  };

  const openRemove = () => {
    setSnackbar('');
    setRemoveDialog(true);
  };

  const dialogDismiss = () => {
    setUser({});
    setShowCreate(false);
    setRemoveDialog(false);
  };

  const submit = (userData, type, id, passwordResetEmail) => {
    if (userData) {
      let request = null;
      if (id) {
        request = props[actions[type]](id, userData);
      } else {
        request = props[actions[type]](userData);
      }
      return request.then(() => {
        if (passwordResetEmail) {
          passwordResetStart(passwordResetEmail);
        }
        dialogDismiss();
      });
    } else {
      if (passwordResetEmail) {
        passwordResetStart(passwordResetEmail);
      }
      return dialogDismiss();
    }
  };

  return (
    <div>
      <div className="flexbox centered space-between" style={{ marginLeft: '20px' }}>
        <h2>Users</h2>
        <Button variant="contained" color="primary" onClick={setShowCreate}>
          Create new user
        </Button>
      </div>

      <UserList {...props} editUser={openEdit} />
      {showCreate && <UserForm {...props} closeDialog={dialogDismiss} submit={submit} />}
      <UserDefinition
        currentUser={currentUser}
        isAdminCurrentUser={isAdmin}
        onRemove={openRemove}
        onCancel={dialogDismiss}
        onSubmit={submit}
        roles={roles}
        selectedUser={user}
      />
      {removeDialog && (
        <Dialog open>
          <DialogTitle>Remove user?</DialogTitle>
          <DialogContent style={{ overflow: 'hidden' }}>
            Are you sure you want to remove the user with email{' '}
            <b>
              <i>{user.email}</i>
            </b>
            ?
          </DialogContent>
          <DialogActions>
            <Button style={{ marginRight: 10 }} onClick={dialogDismiss}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={() => submit(user, 'remove', user.id)}>
              Remove user
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

const actionCreators = { createUser, editUser, getUserList, passwordResetStart, removeUser, setSnackbar };

const mapStateToProps = state => {
  const { isAdmin } = getUserRoles(state);
  return {
    currentUser: getCurrentUser(state),
    isAdmin,
    isEnterprise: getIsEnterprise(state),
    roles: state.users.rolesById,
    snackbar: state.app.snackbar,
    users: Object.values(state.users.byId)
  };
};

export default connect(mapStateToProps, actionCreators)(UserManagement);
