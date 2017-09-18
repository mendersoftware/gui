import React from 'react';
import { Router, Route} from 'react-router';
import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import FormButton from '../common/forms/formbutton';


var AppActions = require('../../actions/app-actions');
var AppStore = require('../../stores/app-store');
var createReactClass = require('create-react-class');

function getState() {
  return {
    snackbar: AppStore.getSnackbar(),
    currentUser: AppStore.getCurrentUser(),
  };
}

var SelfUserManagement =  createReactClass({
  getInitialState: function() {
     return getState()
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (this.state.editPass !== prevState.editPass) {
      this.forceUpdate();
    }
    if (this.state.editEmail !== prevState.editEmail) {
      this.forceUpdate();
    }
  },


  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(getState());
  },

  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },

  _editSubmit: function (userData) {
    var self = this;
    var callback = {
      success: function(user) {
        AppActions.setSnackbar("The user has been updated.");
        var user = userData;
        user.id=self.state.currentUser.id;
        AppActions.setCurrentUser(user);
        self.setState({editPass: false, editEmail: false});
      },
      error: function(err) {
        console.log(err);
        AppActions.setSnackbar("There was an error editing the user. " +errormsg);
      }
    }

    AppActions.editUser(self.state.currentUser.id, userData, callback);
  },

  handleEmail: function () {
    var uniqueId = this.state.emailFormId;
    if (this.state.editEmail) {
        uniqueId = new Date();
        // changing unique id will reset form values 
    }
    this.setState({editEmail: !this.state.editEmail, emailFormId: uniqueId});

  },

  handlePass: function () {
    this.setState({editPass: !this.state.editPass});
  },

  _togglePass: function() {
    this.setState({editPass: !this.state.editPass})
  },

  render: function() {
    return (
      <div style={{maxWidth: "750px"}} className="margin-top-small">
        
        <h2 style={{marginTop: "15px"}}>My account</h2>
  

        <Form 
          onSubmit={this._editSubmit}
          handleCancel={this.handleEmail}
          submitLabel="Save"
          showButtons={this.state.editEmail}
          submitButtonId="submit_email"
          uniqueId={this.state.emailFormId}
        >

          <TextInput
            hint="Email"
            label="Email"
            id="email"
            disabled={!this.state.editEmail}
            value={(this.state.currentUser || {}).email}
            validations="isLength:1,isEmail"
            focus={this.state.editEmail} />

          <FormButton className={this.state.editEmail ? "hidden" : "inline-block"} primary={true} id="change_email" label="Change email" handleClick={this.handleEmail} />

        </Form>

        <Form 
          onSubmit={this._editSubmit}
          handleCancel={this.handlePass}
          submitLabel="Save"
          submitButtonId="submit_pass"
          showButtons={this.state.editPass}
          className="margin-top"
        >


          <PasswordInput
            className={this.state.editPass ? "edit-pass" : "hidden"}
            id="password"
            label="Password"
            create={this.state.editPass}
            validations="isLength:1"
            disabled={!this.state.editPass}
            onClear={this.handleButton}
            edit={false} />

          <FormButton buttonHolder={true} className={this.state.editPass ? "hidden" : "block"} primary={true} id="change_pass" label="Change password" handleClick={this.handlePass} />
        </Form>

      </div>
    )
  }
});


module.exports = SelfUserManagement;