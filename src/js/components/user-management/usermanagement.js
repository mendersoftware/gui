import React from 'react';
import { connect } from 'react-redux';
// material ui
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import UserList from './userlist';
import UserForm from './userform';
import { setSnackbar } from '../../actions/appActions';
import { createUser, editUser, getUserList, passwordResetStart, removeUser } from '../../actions/userActions';
import { getCurrentUser, getIsEnterprise, getUserRoles } from '../../selectors';

const actions = {
  create: 'createUser',
  edit: 'editUser',
  remove: 'removeUser'
};

export class UserManagement extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      editDialog: false,
      removeDialog: false,
      user: {}
    };
  }

  componentDidMount() {
    this.props.getUserList();
  }

  componentDidUpdate(prevProps) {
    const changed =
      prevProps.currentUser.id !== this.props.currentUser.id ||
      prevProps.users.some(
        (user, index) => this.props.users[index] && (user.id !== this.props.users[index].id || user.email !== this.props.users[index].email)
      );
    if (changed) {
      this.props.getUserList();
    }
  }

  _openEdit(user) {
    this.props.setSnackbar('');
    this.setState({ user, editDialog: true, removeDialog: false });
  }

  _openRemove(user) {
    this.props.setSnackbar('');
    this.setState({ user, editDialog: false, removeDialog: true });
  }

  dialogDismiss() {
    this.setState({ editDialog: false, removeDialog: false });
  }

  submit(userData, type, id, passwordResetEmail) {
    const self = this;
    const { passwordResetStart } = self.props;
    if (userData) {
      let request = null;
      if (id) {
        request = self.props[actions[type]](id, userData);
      } else {
        request = self.props[actions[type]](userData);
      }
      return request.then(() => {
        if (passwordResetEmail) {
          passwordResetStart(passwordResetEmail);
        }
        self.dialogDismiss();
      });
    } else {
      if (passwordResetEmail) {
        passwordResetStart(passwordResetEmail);
      }
      return self.dialogDismiss();
    }
  }

  render() {
    const self = this;
    const { editDialog, removeDialog, user } = self.state;
    return (
      <div>
        <div className="flexbox centered space-between" style={{ marginLeft: '20px' }}>
          <h2>Users</h2>
          <Button variant="contained" color="primary" onClick={() => self._openEdit({})}>
            Create new user
          </Button>
        </div>

        <UserList {...self.props} editUser={user => self._openEdit(user)} removeUser={user => self._openRemove(user)} />
        {editDialog && (
          <UserForm
            {...self.props}
            closeDialog={() => self.dialogDismiss()}
            handleRolesChange={event => self.handleRolesChange(event.target.value)}
            submit={(...args) => self.submit(...args)}
            user={user}
          />
        )}

        {removeDialog && (
          <Dialog open={true}>
            <DialogTitle>Remove user?</DialogTitle>
            <DialogContent style={{ overflow: 'hidden' }}>
              Are you sure you want to remove the user with email{' '}
              <b>
                <i>{user.email}</i>
              </b>
              ?
            </DialogContent>
            <DialogActions>
              <Button style={{ marginRight: '10px' }} onClick={() => self.dialogDismiss()}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={() => self.submit(user, 'remove', user.id)}>
                Remove user
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
    );
  }
}

const actionCreators = { createUser, editUser, getUserList, passwordResetStart, removeUser, setSnackbar };

const mapStateToProps = state => {
  const { isAdmin } = getUserRoles(state);
  return {
    currentUser: getCurrentUser(state),
    isAdmin,
    isEnterprise: getIsEnterprise(state),
    roles: Object.entries(state.users.rolesById).map(([id, role]) => ({ id, ...role })),
    snackbar: state.app.snackbar,
    users: Object.values(state.users.byId)
  };
};

export default connect(mapStateToProps, actionCreators)(UserManagement);
