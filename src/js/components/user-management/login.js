import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route} from 'react-router';
import cookie from 'react-cookie';
import { clearAllRetryTimers } from '../../utils/retrytimer';

var AppActions = require('../../actions/app-actions');
var AppStore = require('../../stores/app-store');
var createReactClass = require('create-react-class');

import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import Snackbar from 'material-ui/Snackbar';


function getState() {
  return {
    snackbar: AppStore.getSnackbar()
  };
}

var Login = createReactClass({
  getInitialState: function() {
    return getState();
  },

  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },

  componentDidMount: function() {
    clearAllRetryTimers();
    AppActions.setCurrentUser(null);
  },

  componentWillUnmount: function () {
    AppStore.removeChangeListener(this._onChange);
    AppActions.setSnackbar("");
  },

  _onChange: function() {
    this.setState(getState());
  },

  _handleLogin: function(formData) {
    var self = this;

    if (formData.hasOwnProperty("email")) {
      AppActions.loginUser({
        success: function(token) {

          AppActions.setSnackbar("");
          // save token as cookie
          cookie.save("JWT", token);

          // logged in, so redirect
          var location = self.props;

          if (location.state && location.state.nextPathname) {
            self.props.router.replace(location.state.nextPathname);
          } else {
            self.props.router.replace('/');
          }
        },
        error: function(err) {
          AppActions.setSnackbar("Wrong username or password. Please try again!");
        }
      }, formData);
    }
  },

  render: function() {
    var title = "Log in";
    var buttonLabel = "Log in";
    return (
      <div className="full-screen">
        <div id="login-box">
          <h3>{title}</h3>
          <img src="assets/img/loginlogo.png" alt="mender-logo" />
         
          <Form showButtons={true} onSubmit={this._handleLogin} submitLabel={buttonLabel} submitButtonId="login_button">

              <TextInput
                hint="Your email"
                label="Your email"
                id="email"
                required={true}
                validations="isLength:1,isEmail" />

              <PasswordInput
                id="password"
                label="Password"
                required={true} />

            </Form>
        </div>

        <Snackbar
          open={this.state.snackbar.open}
          bodyStyle={{maxWidth: this.state.snackbar.maxWidth}}
          message={this.state.snackbar.message}
          autoHideDuration={8000}
        />
      </div>
    );
  }
});


Login.contextTypes = {
  router: PropTypes.object
};

module.exports = Login;
