import React from 'react';
import { Router, Route} from 'react-router';

var AppActions = require('../../actions/app-actions');
var AppStore = require('../../stores/app-store');

import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';

var Login = React.createClass({
  getInitialState: function() {
    return {
      userExists: false
    };
  },

  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },

  componentDidMount: function() {
    this.setState({userExists: this._checkForUsers()});
  },

  _onChange: function() {

  },

  _handleSubmit: function(event) {

   /* const email = this.refs.email.value
    const pass = this.refs.pass.value

    auth.login(email, pass, (loggedIn) => {
      if (!loggedIn)
        return this.setState({ error: true })
    */
      const { location } = this.props;
      console.log(location);

      if (location.state && location.state.nextPathname) {
        this.props.router.replace(location.state.nextPathname);
      } else {
        this.props.router.replace('/');
      }
    /* }) */
  },

  _checkForUsers: function() {
    // check to see if a user exists in the system already
    return false
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

          <Form onSubmit={this._handleSubmit} submitLabel={buttonLabel}>

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
      </div>
    );
  }
});


Login.contextTypes = {
  router: React.PropTypes.object
};

module.exports = Login;
