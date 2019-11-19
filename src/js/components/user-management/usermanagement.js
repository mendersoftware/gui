import React from 'react';
import { connect } from 'react-redux';
// material ui
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar } from '@material-ui/core';

import UserList from './userlist';
import UserForm from './userform';
import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import { createUser, editUser, getUserList, removeUser } from '../../actions/userActions';
import { preformatWithRequestID } from '../../helpers';

export class UserManagement extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = this._getState();
  }

  componentWillMount() {
    AppStore.changeListener(this._onChange.bind(this));
  }

  componentDidMount() {
    this.props.getUserList();
  }

  _getState() {
    return {
      snackbar: AppStore.getSnackbar()
    };
  }
  _onChange() {
    this.setState(this._getState());
  }
  componentDidUpdate(prevProps) {
    const changed = prevProps.currentUser !== this.props.currentUser || prevProps.users.some((user, index) => user !== this.props.users[index]);
    if (changed) {
      this.props.getUserList();
    }
  }
  componentWillUnmount() {
    AppStore.removeChangeListener(this._onChange.bind(this));
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
    return self.props
      .editUser(self.state.user.id, userData)
      .then(() => {
        self.dialogDismiss();
        AppActions.setSnackbar('The user has been updated.');
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res.body.error || '';
        AppActions.setSnackbar(preformatWithRequestID(err.res, `There was an error editing the user. ${errMsg}`));
      });
  }

  _createSubmit(userData) {
    var self = this;
    return self.props
      .createUser(userData)
      .then(() => {
        self.dialogDismiss();
        AppActions.setSnackbar('The user was created successfully.');
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res.body.error || '';
        AppActions.setSnackbar(preformatWithRequestID(err.res, `There was an error creating the user. ${errMsg}`));
      });
  }

  _removeSubmit() {
    var self = this;
    return self.props
      .removeUser(this.state.user.id)
      .then(() => {
        self.dialogDismiss();
        AppActions.setSnackbar('The user was removed from the system.');
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
        <Snackbar
          bodyStyle={{ maxWidth: this.state.snackbar.maxWidth }}
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          autoHideDuration={8000}
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

const actionCreators = { createUser, editUser, getUserList, removeUser };

const mapStateToProps = state => {
  return {
    currentUser: state.users.byId[state.users.currentUser] || {},
    users: Object.values(state.users.byId)
  };
};

export default connect(
  mapStateToProps,
  actionCreators
)(UserManagement);
