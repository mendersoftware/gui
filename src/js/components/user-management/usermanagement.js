import React from 'react';
import { connect } from 'react-redux';
// material ui
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import UserList from './userlist';
import UserForm from './userform';
import { setSnackbar } from '../../actions/appActions';
import { createUser, editUser, getUserList, removeUser } from '../../actions/userActions';
import { preformatWithRequestID } from '../../helpers';

const actions = {
  create: {
    successMessage: 'The user was created successfully.',
    errorMessage: 'creating',
    action: 'createUser'
  },
  edit: {
    successMessage: 'The user has been updated.',
    errorMessage: 'editing',
    action: 'editUser'
  },
  remove: {
    successMessage: 'The user was removed from the system.',
    errorMessage: 'removing',
    action: 'removeUser'
  }
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

  submit(userData, type, id) {
    const self = this;
    let request = null;
    if (id) {
      request = self.props[actions[type].action](id, userData);
    } else {
      request = self.props[actions[type].action](userData);
    }
    return request
      .then(() => {
        self.dialogDismiss();
        self.props.setSnackbar(actions[type].successMessage);
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res.body.error || '';
        self.props.setSnackbar(preformatWithRequestID(err.res, `There was an error ${actions[type].errorMessage} the user. ${errMsg}`));
      });
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

const actionCreators = { createUser, editUser, getUserList, removeUser, setSnackbar };

const mapStateToProps = state => {
  const plan = state.users.organization ? state.users.organization.plan : 'os';
  return {
    currentUser: state.users.byId[state.users.currentUser] || {},
    isEnterprise: state.app.features.isEnterprise || (state.app.features.isHosted && plan === 'enterprise'),
    roles: Object.entries(state.users.rolesById).map(([id, role]) => ({ id, ...role })),
    snackbar: state.app.snackbar,
    users: Object.values(state.users.byId)
  };
};

export default connect(mapStateToProps, actionCreators)(UserManagement);
