import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';
import ReactTooltip from 'react-tooltip';

import { Button } from '@material-ui/core';
import { Help as HelpIcon } from '@material-ui/icons';

import loginLogo from '../../../assets/img/loginlogo.png';
import { setSnackbar } from '../../actions/appActions';
import { loginUser, logoutUser } from '../../actions/userActions';

import { getToken } from '../../auth';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import FormCheckbox from '../common/forms/formcheckbox';

import { OAuth2Providers } from './oauth2providers';

export class Login extends React.Component {
  constructor(props, context) {
    super(props, context);
    const cookies = new Cookies();
    this.state = {
      noExpiry: cookies.get('noExpiry')
    };
  }

  componentDidMount() {
    clearAllRetryTimers(this.props.setSnackbar);
    if (getToken()) {
      this.props.logoutUser();
    }
    const cookies = new Cookies();
    const loginError = cookies.get('error');
    if (loginError) {
      this.props.setSnackbar(loginError, 10000);
      cookies.remove('error');
    }
  }

  componentDidUpdate(prevProps) {
    const self = this;
    if (prevProps.currentUser !== this.props.currentUser && !!this.props.currentUser.id) {
      self.props.setSnackbar('');
    }
    if (prevProps.has2FA !== self.props.has2FA && self.props.has2FA) {
      self.setState({});
    }
  }

  componentWillUnmount() {
    this.props.setSnackbar('');
  }

  _handleLogin(formData) {
    if (!formData.hasOwnProperty('email')) {
      return;
    }
    if (this.props.has2FA && !formData.hasOwnProperty('token2fa')) {
      return;
    }
    return this.props.loginUser(formData).catch(err => console.log(err));
  }

  render() {
    const { noExpiry } = this.state;
    const { has2FA, isHosted } = this.props;
    let twoFAAnchor = {};
    if (this.twoFARef) {
      twoFAAnchor = {
        left: this.twoFARef.offsetLeft + this.twoFARef.offsetWidth + 120,
        top: this.twoFARef.parentElement.parentElement.offsetTop + this.twoFARef.offsetHeight / 2
      };
    }
    return (
      <div className="flexbox column" id="login-box">
        <h3>Log in</h3>
        <img src={loginLogo} alt="mender-logo" className="margin-bottom-small" />

        {isHosted && (
          <>
            <div className="flexbox centered margin-bottom">Log in with:</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {OAuth2Providers.map(provider => (
                <Button
                  className="oauth-provider"
                  variant="contained"
                  key={provider.id}
                  href={`/api/management/v1/useradm/oauth2/${provider.id}`}
                  startIcon={provider.icon}
                >
                  {provider.name}
                </Button>
              ))}
            </div>
            <h4 className="dashboard-header margin-top-large" style={{ display: 'flex', justifyContent: 'center' }}>
              <span style={{ padding: 15, top: -24 }}>or your email address</span>
            </h4>
          </>
        )}

        <Form showButtons={true} buttonColor="primary" onSubmit={formdata => this._handleLogin(formdata)} submitLabel="Log in" submitButtonId="login_button">
          <TextInput hint="Your email" label="Your email" id="email" required={true} validations="isLength:1,isEmail" />
          <PasswordInput className="margin-bottom-small" id="password" label="Password" required={true} />
          {isHosted ? (
            <div className="flexbox">
              <Link style={{ marginLeft: '4px' }} to="/password">
                Forgot your password?
              </Link>
            </div>
          ) : (
            <div />
          )}
          {has2FA ? (
            <TextInput
              hint="Two Factor Authentication Code"
              label="Two Factor Authentication Code"
              id="token2fa"
              validations="isLength:6,isNumeric"
              required={true}
              setControlRef={re => (this.twoFARef = re)}
            />
          ) : (
            <div />
          )}
          <FormCheckbox id="noExpiry" label="Stay logged in" checked={noExpiry === 'true'} />
        </Form>

        {isHosted ? (
          <div className="margin-top text-muted">
            <div className="flexbox centered">
              Don&#39;t have an account?{' '}
              <Link style={{ marginLeft: '4px' }} to="/signup">
                Sign up here
              </Link>
            </div>
            {this.twoFARef && (
              <div>
                <div id="onboard-6" className="tooltip info" data-tip data-for="2fa-tip" data-event="click focus" style={twoFAAnchor}>
                  <HelpIcon />
                </div>
                <ReactTooltip id="2fa-tip" globalEventOff="click" place="top" effect="solid" className="react-tooltip info" style={{ maxWidth: 300 }}>
                  Two Factor Authentication is enabled for your account. If you haven&apos;t set up a 3rd party authentication app with a verification code,
                  please contact an administrator.
                </ReactTooltip>
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  }
}

const actionCreators = { loginUser, logoutUser, setSnackbar };

const mapStateToProps = state => {
  return {
    currentUser: state.users.byId[state.users.currentUser] || {},
    has2FA: state.users.globalSettings.hasOwnProperty('2fa') && state.users.globalSettings['2fa'] === 'enabled',
    isHosted: state.app.features.isHosted,
    showHelptips: state.users.showHelptips,
    showOnboardingTips: state.onboarding.showTips,
    onboardingComplete: state.onboarding.complete
  };
};

export default connect(mapStateToProps, actionCreators)(Login);
