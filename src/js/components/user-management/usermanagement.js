import React from 'react';
import { connect } from 'react-redux';
// material ui
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import UserList from './userlist';
import UserForm from './userform';
import { setSnackbar } from '../../actions/appActions';
import { createUser, editUser, getUserList, removeUser } from '../../actions/userActions';
import { preformatWithRequestID } from '../../helpers';

export class UserManagement extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      editDialog: false,
      editPass: false,
      removeDialog: false,
      user: null
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
  _openCreate() {
    this._openEdit();
  }
  _openEdit(user) {
    this.props.setSnackbar('');
    this.setState({ user: user, editDialog: true, removeDialog: false, editPass: !user });
  }

  _openRemove(user) {
    this.props.setSnackbar('');
    this.setState({ user: user, editDialog: false, removeDialog: true });
  }

  dialogDismiss() {
    this.setState({ editDialog: false, removeDialog: false });
  }
  _editSubmit(userData) {
    var self = this;
    return self.props
      .editUser(self.state.user.id, userData)
      .then(() => {
        self.dialogDismiss();
        self.props.setSnackbar('The user has been updated.');
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res.body.error || '';
        self.props.setSnackbar(preformatWithRequestID(err.res, `There was an error editing the user. ${errMsg}`));
      });
  }

  _createSubmit(userData) {
    var self = this;
    return self.props
      .createUser(userData)
      .then(() => {
        self.dialogDismiss();
        self.props.setSnackbar('The user was created successfully.');
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res.body.error || '';
        self.props.setSnackbar(preformatWithRequestID(err.res, `There was an error creating the user. ${errMsg}`));
      });
  }

  _removeSubmit() {
    var self = this;
    return self.props
      .removeUser(this.state.user.id)
      .then(() => {
        self.dialogDismiss();
        self.props.setSnackbar('The user was removed from the system.');
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res.body.error || '';
        self.props.setSnackbar(preformatWithRequestID(err.res, `There was an error removing the user. ${errMsg}`));
      });
  }

  _togglePass() {
    this.setState({ editPass: !this.state.editPass });
  }

  render() {
    var removeActions = [
      <div key="remove-button-1" style={{ marginRight: '10px', display: 'inline-block' }}>
        <Button onClick={() => this.dialogDismiss()}>Cancel</Button>
      </div>,
      <Button variant="contained" key="remove-button-2" color="primary" onClick={() => this._removeSubmit()}>
        Remove user
      </Button>
    ];

    return (
      <div>
        <div className="float-right">
          <Button variant="contained" color="primary" onClick={() => this._openCreate()}>
            Create new user
          </Button>
        </div>

        <UserList
          users={this.props.users}
          editUser={user => this._openEdit(user)}
          removeUser={user => this._openRemove(user)}
          currentUser={this.props.currentUser}
        />

        <Dialog open={this.state.editDialog || false} fullWidth={true} maxWidth="sm">
          <DialogTitle>{this.state.user ? 'Edit user' : 'Create new user'}</DialogTitle>
          <DialogContent style={{ overflowY: 'initial' }}>
            <UserForm
              edit={this.state.user ? true : false}
              editPass={this.state.editPass}
              togglePass={() => this._togglePass()}
              closeDialog={() => this.dialogDismiss()}
              handleSubmit={this.state.user ? data => this._editSubmit(data) : data => this._createSubmit(data)}
              user={this.state.user}
              buttonLabel={this.state.user ? 'Save changes' : 'Create user'}
            />
          </DialogContent>
          <DialogActions />
        </Dialog>

        <Dialog open={this.state.removeDialog || false}>
          <DialogTitle>Remove user?</DialogTitle>
          <DialogContent style={{ overflow: 'hidden' }}>
            Are you sure you want to remove the user with email{' '}
            <b>
              <i>{(this.state.user || {}).email}</i>
            </b>
            ?
          </DialogContent>
          <DialogActions>{removeActions}</DialogActions>
        </Dialog>
      </div>
    );
  }
}

const actionCreators = { createUser, editUser, getUserList, removeUser, setSnackbar };

const mapStateToProps = state => {
  return {
    currentUser: state.users.byId[state.users.currentUser] || {},
    snackbar: state.app.snackbar,
    users: Object.values(state.users.byId)
  };
};

export default connect(mapStateToProps, actionCreators)(UserManagement);
