import React from 'react';
import { Router, Route} from 'react-router';
import UserList from './userlist';
import UserForm from './userform';

var AppActions = require('../../actions/app-actions');
var AppStore = require('../../stores/app-store');
var createReactClass = require('create-react-class');

// material ui
import { List, ListItem } from 'material-ui/List';
import Snackbar from 'material-ui/Snackbar';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

function getState() {
  return {
    snackbar: AppStore.getSnackbar(),
    editPass: false,
    currentUser: AppStore.getCurrentUser(),
  };
}

var UserManagement =  createReactClass({
  getInitialState: function() {
     return getState()
  },

  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },

  componentDidMount: function() {
    this._getUserList();
  },
  _onChange: function() {
    this.setState(getState());
  },
  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },
  _getUserList: function() {
    var self = this;
    var callback = {
      success: function(users) {
        self.setState({users: users});
      },
      error: function(err) {
        var errormsg = err || "Please check your connection";
        AppActions.setSnackbar("Users couldn't be loaded. " +errormsg);
      }
    };
    AppActions.getUserList(callback);
  },
  _openCreate: function() {
    this._openEdit();
  },
  _openEdit: function (user) {
    AppActions.setSnackbar("");
    this.setState({user: user, editDialog: true, removeDialog: false, editPass: !user });
  },

  _openRemove: function (user) {
    AppActions.setSnackbar("");
    this.setState({user: user, editDialog: false, removeDialog: true});
  },

  dialogDismiss: function () {
    this.setState({editDialog: false, removeDialog: false});
  },
  _editSubmit: function (userData) {
    var self = this;
    var callback = {
      success: function() {
        self.dialogDismiss();
        AppActions.setSnackbar("The user has been updated.");
        // if current logged in user
        if (self.state.user.id === self.state.currentUser.id) {AppActions.setCurrentUser(userData)};
        self._getUserList();
      },
      error: function(err) {
        console.log(err);
        AppActions.setSnackbar("There was an error editing the user. " +err.error);
      }
    }

    AppActions.editUser(self.state.user.id, userData, callback);
  },

  _createSubmit: function (userData) {
    var self = this;
    var callback = {
      success: function() {
        self.dialogDismiss();
        AppActions.setSnackbar("The user was created successfully.");
        self._getUserList();
      },
      error: function(err) {
        console.log(err);
        AppActions.setSnackbar("There was an error creating the user. " +err.error);
      }
    }

    AppActions.createUser(userData, callback);
  },

  _removeSubmit: function () {
    var self = this;
    var callback = {
      success: function() {
        self.dialogDismiss();
        AppActions.setSnackbar("The user was removed from the system.");
        self._getUserList();
      },
      error: function(err) {
        console.log(err);
        AppActions.setSnackbar("There was an error removing the user. " +err.error);
      }
    }

    AppActions.removeUser(this.state.user.id, callback);
  },

  _togglePass: function() {
    this.setState({editPass: !this.state.editPass})
  },

  render: function() {

    var removeActions = [
      <div style={{marginRight:"10px", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this.dialogDismiss} />
      </div>,
      <RaisedButton
        label="Remove user"
        primary={true}
        onClick={this._removeSubmit}
        ref="save" />
    ];

    return (

      <div>
        <div className="float-right">
          <RaisedButton primary={true} label="Create new user" onClick={this._openCreate} />
        </div>
       
        <UserList users={this.state.users || []} editUser={this._openEdit} removeUser={this._openRemove} currentUser={this.state.currentUser} />
        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          autoHideDuration={8000} 
        />

        <Dialog
          ref="edit"
          title={this.state.user ? "Edit user" : "Create new user"}
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}
          bodyStyle={{paddingTop:"0", fontSize:"13px"}}
          open={this.state.editDialog || false}
          contentStyle={{overflow:"hidden", boxShadow:"0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)" }}
          actionsContainerStyle={{marginBottom:"0"}}
          repositionOnUpdate={false}
          >
          <UserForm edit={this.state.user ? true : false} editPass={this.state.editPass} togglePass={this._togglePass} closeDialog={this.dialogDismiss} handleSubmit={this.state.user ? this._editSubmit : this._createSubmit} user={this.state.user} buttonLabel={this.state.user ? "Save changes" : "Create user"} />          
        </Dialog>

        <Dialog
          ref="remove"
          title="Remove user"
          actions={removeActions}
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}
          bodyStyle={{paddingTop:"0"}}
          open={this.state.removeDialog || false}
          contentStyle={{overflow:"hidden", boxShadow:"0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)"}}
          actionsContainerStyle={{marginBottom:"0"}}
          >
          Are you sure you want to remove the user with email <b><i>{(this.state.user || {}).email}</i></b>?        
        </Dialog>

      </div>
    )
  }

});

module.exports = UserManagement;
