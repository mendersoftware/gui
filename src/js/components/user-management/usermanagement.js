import React from 'react';
import UserList from './userlist';
import UserForm from './userform';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';

// material ui
import Snackbar from '@material-ui/core/Snackbar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import { preformatWithRequestID } from '../../helpers';

export default class UserManagement extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = this._getState();
  }

  componentWillMount() {
    AppStore.changeListener(this._onChange.bind(this));
  }

  componentDidMount() {
    this._getUserList();
  }

  _getState() {
    return {
      snackbar: AppStore.getSnackbar(),
      editPass: false,
      currentUser: AppStore.getCurrentUser()
    };
  }
  _onChange() {
    this.setState(this._getState());
  }
  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this._getUserList();
    }
  }
  componentWillUnmount() {
    AppStore.removeChangeListener(this._onChange.bind(this));
  }
  _getUserList() {
    var self = this;
    return AppActions.getUserList()
      .then(users => self.setState({ users: users }))
      .catch(err => {
        var errormsg = err.error || 'Please check your connection';
        AppActions.setSnackbar(preformatWithRequestID(err.res, `Users couldn't be loaded. ${errormsg}`));
      });
  }
  _openCreate() {
    this._openEdit();
  }
  _openEdit(user) {
    AppActions.setSnackbar('');
    this.setState({ user: user, editDialog: true, removeDialog: false, editPass: !user });
  }

  _openRemove(user) {
    AppActions.setSnackbar('');
    this.setState({ user: user, editDialog: false, removeDialog: true });
  }

  dialogDismiss() {
    this.setState({ editDialog: false, removeDialog: false });
  }
  _editSubmit(userData) {
    var self = this;
    return AppActions.editUser(self.state.user.id, userData)
      .then(() => {
        self.dialogDismiss();
        AppActions.setSnackbar('The user has been updated.');
        // if current logged in user
        if (self.state.user.id === self.state.currentUser.id) {
          AppActions.setCurrentUser(userData);
        }
        self._getUserList();
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res.body.error || '';
        AppActions.setSnackbar(preformatWithRequestID(err.res, `There was an error editing the user. ${errMsg}`));
      });
  }

  _createSubmit(userData) {
    var self = this;
    return AppActions.createUser(userData)
      .then(() => {
        self.dialogDismiss();
        AppActions.setSnackbar('The user was created successfully.');
        self._getUserList();
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res.body.error || '';
        AppActions.setSnackbar(preformatWithRequestID(err.res, `There was an error creating the user. ${errMsg}`));
      });
  }

  _removeSubmit() {
    var self = this;
    return AppActions.removeUser(this.state.user.id)
      .then(() => {
        self.dialogDismiss();
        AppActions.setSnackbar('The user was removed from the system.');
        self._getUserList();
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res.body.error || '';
        AppActions.setSnackbar(preformatWithRequestID(err.res, `There was an error removing the user. ${errMsg}`));
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
      <Button variant="contained" key="remove-button-2" primary="true" onClick={() => this._removeSubmit()} ref="save">
        Remove user
      </Button>
    ];

    return (
      <div>
        <div className="float-right">
          <Button variant="contained" primary="true" onClick={() => this._openCreate()}>
            Create new user
          </Button>
        </div>

        <UserList
          users={this.state.users || []}
          editUser={user => this._openEdit(user)}
          removeUser={user => this._openRemove(user)}
          currentUser={this.state.currentUser}
        />
        <Snackbar
          bodyStyle={{ maxWidth: this.state.snackbar.maxWidth }}
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          autoHideDuration={8000}
        />

        <Dialog ref="edit" open={this.state.editDialog || false}>
          <DialogTitle>{this.state.user ? 'Edit user' : 'Create new user'}</DialogTitle>
          <DialogContent>
            <UserForm
              edit={this.state.user ? true : false}
              editPass={this.state.editPass}
              togglePass={() => this._togglePass()}
              closeDialog={() => this.dialogDismiss()}
              handleSubmit={this.state.user ? this._editSubmit : this._createSubmit}
              user={this.state.user}
              buttonLabel={this.state.user ? 'Save changes' : 'Create user'}
            />
          </DialogContent>
          <DialogActions />
        </Dialog>

        <Dialog ref="remove" open={this.state.removeDialog || false}>
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
