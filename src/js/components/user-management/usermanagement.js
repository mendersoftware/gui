import React from 'react';
import UserList from './userlist';
import UserForm from './userform';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';

// material ui
import Snackbar from 'material-ui/Snackbar';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

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
    if (prevProps.currentTab !== this.props.currentTab && this.props.currentTab === '/settings/user-management') {
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
        <FlatButton label="Cancel" onClick={() => this.dialogDismiss()} />
      </div>,
      <RaisedButton key="remove-button-2" label="Remove user" primary={true} onClick={() => this._removeSubmit()} ref="save" />
    ];

    return (
      <div>
        <div className="float-right">
          <RaisedButton primary={true} label="Create new user" onClick={() => this._openCreate()} />
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

        <Dialog
          ref="edit"
          title={this.state.user ? 'Edit user' : 'Create new user'}
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}
          bodyStyle={{ paddingTop: '0', fontSize: '13px' }}
          open={this.state.editDialog || false}
          contentStyle={{ overflow: 'hidden', boxShadow: '0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)' }}
          actionsContainerStyle={{ marginBottom: '0' }}
          repositionOnUpdate={false}
        >
          <UserForm
            edit={this.state.user ? true : false}
            editPass={this.state.editPass}
            togglePass={this._togglePass}
            closeDialog={() => this.dialogDismiss()}
            handleSubmit={this.state.user ? this._editSubmit : this._createSubmit}
            user={this.state.user}
            buttonLabel={this.state.user ? 'Save changes' : 'Create user'}
          />
        </Dialog>

        <Dialog
          ref="remove"
          title="Remove user"
          actions={removeActions}
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}
          bodyStyle={{ paddingTop: '0' }}
          open={this.state.removeDialog || false}
          contentStyle={{ overflow: 'hidden', boxShadow: '0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)' }}
          actionsContainerStyle={{ marginBottom: '0' }}
        >
          Are you sure you want to remove the user with email{' '}
          <b>
            <i>{(this.state.user || {}).email}</i>
          </b>
          ?
        </Dialog>
      </div>
    );
  }
}
