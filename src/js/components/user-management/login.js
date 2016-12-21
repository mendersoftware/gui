import React from 'react';
import { Router, Route} from 'react-router';

var AppActions = require('../../actions/app-actions');
var AppStore = require('../../stores/app-store');
var LocalStore = require('../../stores/local-store');

import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import Snackbar from 'material-ui/Snackbar';


function getState() {
  return {
    snackbar: AppStore.getSnackbar()
  };
}

var Login = React.createClass({
  getInitialState: function() {
    return getState();
  },

  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },

  componentDidMount: function() {
    this._checkLoggedIn();
    this._checkForUsers();
  },

  componentWillUnmount: function () {
    AppStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(getState());
  },

  _handleLogin: function(formData) {
    var self = this;
    AppActions.loginUser({
      success: function(token) {
        // set token in local storage
        AppActions.setLocalStorage("JWT", token);

        // logged in, so redirect
        var location = self.props;

        if (location.state && location.state.nextPathname) {
          self.props.router.replace(location.state.nextPathname);
        } else {
          self.props.router.replace('/');
        }
      },
      error: function(err) {
        AppActions.setSnackbar("Wrong username or password. Please try again");
      }
    }, formData);
  },

  _checkLoggedIn: function() {
    if (this.props.loggedIn) {
      console.log("check logged in");
      //self.props.router.replace('/');
    }
  },

  _checkForUsers: function() {
    var self = this;
    // check to see if a user exists in the system already
    AppActions.checkForExistingUsers({
      success: function(token) {
        self.setState({createToken:token, userExists:false});
      },
      error: function(err) {
        // getting token fails, so user(s) must exist
        self.setState({userExists:true});
      }
    });
  },

  _createUser: function(formData) {
    var self = this;
    var callback = {
      success: function(res) {
        self._handleLogin(formData);
      },
      error: function(err) {
        console.log(err.error);
        AppActions.setSnackbar(err.error);
      }
    };
    AppActions.createInitialUser(callback, formData, this.state.createToken);
  },

  render: function() {
    var title = this.state.userExists ?  "Log in" : "Create a user";
    var buttonLabel = this.state.userExists ? "Log in" : "Create user";
    return (
      <div className="full-screen">
        <div id="login-box">
          <h3>{title}</h3>
          <img src="assets/img/loginlogo.png" alt="mender-logo" />
          {this.state.userExists ? null : <p>Create a user by entering your email and choosing a safe password</p>}

          <Form onSubmit={this.state.userExists ? this._handleLogin : this._createUser} submitLabel={buttonLabel}>

              <TextInput
                hint="Your email"
                label="Your email"
                id="email"
                required={true}
                validations="isLength:1,isEmail" />

              <TextInput
                id="password"
                hint="Password"
                label="Password"
                required={true}
                validations="isLength:8"
                className="margin-bottom" />

            </Form>
        </div>

        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          autoHideDuration={5000}
        />
      </div>
    );
  }
});


Login.contextTypes = {
  router: React.PropTypes.object
};

module.exports = Login;
