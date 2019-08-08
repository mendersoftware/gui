import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import cookie from 'react-cookie';
import { clearAllRetryTimers } from '../../utils/retrytimer';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';

import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import FormCheckbox from '../common/forms/formcheckbox';

import { preformatWithRequestID } from '../../helpers';

export default class Login extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
    location: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = this._getState();
  }

  componentWillMount() {
    AppStore.changeListener(this._onChange.bind(this));
  }

  componentDidMount() {
    clearAllRetryTimers();
    AppActions.setCurrentUser(null);
  }

  componentWillUnmount() {
    AppStore.removeChangeListener(this._onChange.bind(this));
    AppActions.setSnackbar('');
  }

  _getState() {
    return {
      noExpiry: cookie.load('noExpiry'),
      isHosted: AppStore.getIsHosted(),
      redirectToReferrer: false,
      has2FA: AppStore.get2FARequired(),
      isEnterprise: AppStore.getIsEnterprise()
    };
  }

  _onChange() {
    this.setState(this._getState());
  }

  _handleLogin(formData) {
    var self = this;

    if (!formData.hasOwnProperty('email')) {
      return;
    }
    if (self.state.isEnterprise && AppStore.get2FARequired() && !formData.hasOwnProperty('token2fa')) {
      return;
    }
    return AppActions.loginUser(formData)
      .catch(err => {
        if (err.error.text.error.includes('2fa')) {
          const settings = AppStore.getGlobalSettings();
          AppActions.saveGlobalSettings(Object.assign(settings, { '2fa': 'enabled' }));
          return self.setState({ has2FA: true });
        }
      })
      .then(token => {
        if (!token) {
          return;
        }
        var options = {};
        if (!formData.noExpiry) {
          options = { maxAge: 900 };
        }

        // set no expiry as cookie to remember checkbox value
        cookie.save('noExpiry', formData.noExpiry.toString());

        // save token as cookie
        // set maxAge if noexpiry checkbox not checked
        cookie.save('JWT', token, options);

        // logged in, so redirect
        self.setState({ redirectToReferrer: true });
        return AppActions.setSnackbar('');
      })
      .catch(err => {
        var errMsg = 'There was a problem logging in';
        if (err.res.body && Object.keys(err.res.body).includes('error')) {
          // if error message, check for "unauthorized"
          errMsg = err.res.body['error'] === 'unauthorized' ? 'The username or password is incorrect' : `${errMsg}: ${err.res.body['error']}`;
        }
        AppActions.setSnackbar(preformatWithRequestID(err.res, errMsg), null, 'Copy to clipboard');
      });
  }

  render() {
    const { has2FA } = this.state;
    let { from } = { from: { pathname: '/' } };
    if (this.props.location.state && this.props.location.state.from.pathname !== '/ui/') {
      from = this.props.location.state.from;
    }
    let { isHosted, noExpiry, redirectToReferrer } = this.state;
    if (redirectToReferrer) {
      return <Redirect to={from} />;
    }

    var title = 'Log in';
    var buttonLabel = 'Log in';
    return (
      <div className="full-screen">
        <div id="login-box">
          <h3>{title}</h3>
          <img src="assets/img/loginlogo.png" alt="mender-logo" className="margin-bottom-small" />

          <Form
            showButtons={true}
            buttonColor="primary"
            onSubmit={formdata => this._handleLogin(formdata)}
            submitLabel={buttonLabel}
            submitButtonId="login_button"
          >
            <TextInput hint="Your email" label="Your email" id="email" required={true} validations="isLength:1,isEmail" />
            <PasswordInput className="margin-bottom-small" id="password" label="Password" required={true} />
            {has2FA ? <TextInput hint="Two Factor Authentication Code" label="Two Factor Authentication Code" id="token2fa" /> : <div />}
            <FormCheckbox id="noExpiry" label="Stay logged in" checked={noExpiry === 'true'} />
          </Form>

          <div className="clear" />
          {isHosted ? (
            <div className="flexbox margin-top" style={{ color: 'rgba(0, 0, 0, 0.3)', justifyContent: 'center' }}>
              <span>
                Don&#39;t have an account?{' '}
                <a style={{ marginLeft: '4px' }} href="https://mender.io/signup" target="_blank">
                  Sign up here
                </a>
              </span>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
