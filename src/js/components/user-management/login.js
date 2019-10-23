import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import cookie from 'react-cookie';
import ReactTooltip from 'react-tooltip';

import HelpIcon from '@material-ui/icons/Help';

import { clearAllRetryTimers } from '../../utils/retrytimer';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';

import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import FormCheckbox from '../common/forms/formcheckbox';
import { WelcomeSnackTip } from '../helptips/onboardingtips';
import { getOnboardingStepCompleted } from '../../utils/onboardingmanager';

import { decodeSessionToken, preformatWithRequestID } from '../../helpers';

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
    AppActions.setSnackbar('');
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
  _handleLoginError(err) {
    const self = this;
    const settings = AppStore.getGlobalSettings();
    const is2FABackend = err.error.text.error && err.error.text.error.includes('2fa');
    if (is2FABackend && !settings.hasOwnProperty('2fa')) {
      AppActions.saveGlobalSettings(Object.assign(settings, { '2fa': 'enabled' }));
      return self.setState({ has2FA: true });
    }
    let errMsg = 'There was a problem logging in';
    if (err.res && err.res.body && Object.keys(err.res.body).includes('error')) {
      const twoFAError = is2FABackend || (settings.hasOwnProperty('2fa') && settings['2fa'] === 'enabled') ? ' and verification code' : '';
      const errorMessage = `There was a problem logging in. Please check your email${
        twoFAError ? ',' : ' and'
      } password${twoFAError}. If you still have problems, contact an administrator.`;
      // if error message, check for "unauthorized"
      errMsg = err.res.body['error'] === 'unauthorized' ? errorMessage : `${errMsg}: ${err.res.body['error']}`;
    } else {
      errMsg = `${errMsg}\n${err.error.text && err.error.text.message ? err.error.text.message : ''}`;
    }
    AppActions.setSnackbar(preformatWithRequestID(err.res, errMsg), null, 'Copy to clipboard');
  }

  onCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    AppActions.setSnackbar('');
  };

  _handleLogin(formData) {
    var self = this;

    if (!formData.hasOwnProperty('email')) {
      return;
    }
    if (self.state.isEnterprise && AppStore.get2FARequired() && !formData.hasOwnProperty('token2fa')) {
      return;
    }
    return AppActions.loginUser(formData)
      .catch(err => self._handleLoginError(err))
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

        var userId = decodeSessionToken(token);
        return AppActions.getUser(userId)
          .then(AppActions.setCurrentUser)
          .then(() => {
            // logged in, so redirect
            self.setState({ redirectToReferrer: true });
            setTimeout(() => {
              if (
                AppStore.showHelptips() &&
                AppStore.getShowOnboardingTips() &&
                !AppStore.getOnboardingComplete() &&
                !getOnboardingStepCompleted('devices-pending-accepting-onboarding')
              ) {
                AppActions.setSnackbar('open', 10000, '', <WelcomeSnackTip progress={1} />, () => {}, self.onCloseSnackbar);
              }
            }, 1000);
            AppActions.setSnackbar('');
          });
      })
      .catch(self._handleLoginError);
  }

  render() {
    const { isHosted, noExpiry, redirectToReferrer, has2FA } = this.state;
    let { from } = { from: { pathname: '/' } };
    if (this.props.location.state && this.props.location.state.from.pathname !== '/ui/') {
      from = this.props.location.state.from;
    }
    if (redirectToReferrer) {
      return <Redirect to={from} />;
    }

    let twoFAAnchor = {};
    if (this.twoFARef) {
      twoFAAnchor = {
        left: this.twoFARef.offsetLeft + this.twoFARef.offsetWidth + 120,
        top: this.twoFARef.parentElement.parentElement.offsetTop + this.twoFARef.offsetHeight / 2
      };
    }
    return (
      <div className="full-screen">
        <div id="login-box">
          <h3>Log in</h3>
          <img src="assets/img/loginlogo.png" alt="mender-logo" className="margin-bottom-small" />

          <Form showButtons={true} buttonColor="primary" onSubmit={formdata => this._handleLogin(formdata)} submitLabel="Log in" submitButtonId="login_button">
            <TextInput hint="Your email" label="Your email" id="email" required={true} validations="isLength:1,isEmail" />
            <PasswordInput className="margin-bottom-small" id="password" label="Password" required={true} />
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

          <div className="clear" />
          {isHosted ? (
            <div className="flexbox margin-top" style={{ color: 'rgba(0, 0, 0, 0.3)', justifyContent: 'center' }}>
              <span>
                Don&#39;t have an account?{' '}
                <a style={{ marginLeft: '4px' }} href="https://mender.io/signup" target="_blank">
                  Sign up here
                </a>
              </span>
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
      </div>
    );
  }
}
