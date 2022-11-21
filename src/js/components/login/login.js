import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';

import { Button, Checkbox, FormControlLabel } from '@mui/material';
import { Help as HelpIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

import LoginLogo from '../../../assets/img/loginlogo.svg';
import { setSnackbar } from '../../actions/appActions';
import { loginUser, logoutUser } from '../../actions/userActions';
import { getToken } from '../../auth';
import { TIMEOUTS } from '../../constants/appConstants';
import { useradmApiUrl } from '../../constants/userConstants';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import { getCurrentUser } from '../../selectors';

import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import { MenderTooltipClickable } from '../common/mendertooltip';

import { OAuth2Providers } from './oauth2providers';
import LinedHeader from '../common/lined-header';

const cookies = new Cookies();

const useStyles = makeStyles()(theme => ({
  form: { maxWidth: 400 },
  link: { marginLeft: theme.spacing(-0.5) },
  tfaNote: { maxWidth: 300 }
}));

const entryText = {
  signup: { linkText: 'Sign up here', question: `Don't have an account?`, target: '/signup' },
  login: { linkText: 'Log in', question: `Already have an account?`, target: '/login' }
};

const cookieOptions = { sameSite: 'strict', secure: true, path: '/', expires: new Date('2500-12-31') };

export const EntryLink = ({ target = 'signup' }) => (
  <div className="margin-top flexbox centered">
    <div className="muted">{entryText[target].question}</div>
    <Link style={{ marginLeft: 4 }} to={entryText[target].target}>
      {entryText[target].linkText}
    </Link>
  </div>
);

export const OAuthHeader = ({ buttonProps, type }) => (
  <>
    <div className="flexbox centered margin-bottom">{type} with:</div>
    <div className="flexbox centered">
      {OAuth2Providers.map(provider => {
        const props = buttonProps ? buttonProps : { href: `${useradmApiUrl}/oauth2/${provider.id}` };
        return (
          <Button className="oauth-provider" variant="contained" key={provider.id} startIcon={provider.icon} {...props}>
            {provider.name}
          </Button>
        );
      })}
    </div>
    <LinedHeader className="margin-top-large flexbox centered" heading="or your email address" innerStyle={{ padding: 15, top: -24 }} />
  </>
);

export const Login = ({ currentUser, isHosted, loginUser, logoutUser, setSnackbar }) => {
  const [noExpiry, setNoExpiry] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [has2FA, setHas2FA] = useState(false);
  const twoFARef = useRef();

  useEffect(() => {
    clearAllRetryTimers(setSnackbar);
    if (getToken()) {
      logoutUser();
    }
    const loginError = cookies.get('error');
    if (loginError) {
      setSnackbar(loginError, TIMEOUTS.refreshDefault);
      cookies.remove('error');
    }
    cookies.remove('noExpiry', { path: '/' });
    return () => {
      setSnackbar('');
    };
  }, []);

  useEffect(() => {
    if (currentUser.id) {
      setSnackbar('');
    }
  }, [currentUser]);

  useEffect(() => {
    // set no expiry as cookie to remember checkbox value, even though this is set, maxAge takes precedent if present
    cookies.set('noExpiry', noExpiry, cookieOptions);
  }, [noExpiry]);

  const onLoginClick = loginData =>
    loginUser({ stayLoggedIn: noExpiry, ...loginData }).catch(err => {
      // don't reset the state once it was set - thus not setting `has2FA` solely based on the existence of 2fa in the error
      if (err?.error?.includes('2fa')) {
        setHas2FA(true);
      }
    });

  const onSetRef = ref => {
    twoFARef.current = ref;
    setRefresh(!refresh);
  };

  const onOAuthClick = ({ target: { textContent } }) => {
    const providerId = OAuth2Providers.find(provider => provider.name === textContent).id;
    const oauthTimeout = new Date();
    oauthTimeout.setDate(oauthTimeout.getDate() + 7);
    window.localStorage.setItem('oauth', `${oauthTimeout.getTime()}`);
    window.location.replace(`${useradmApiUrl}/oauth2/${providerId}`);
  };

  const onNoExpiryClick = ({ target: { checked } }) => setNoExpiry(checked);

  let twoFAAnchor = {};
  if (twoFARef.current) {
    twoFAAnchor = {
      right: -120,
      top: twoFARef.current.parentElement.parentElement.offsetTop + twoFARef.current.parentElement.parentElement.offsetHeight / 2
    };
  }

  const { classes } = useStyles();
  return (
    <div className="flexbox column padding-bottom margin-bottom" id="login-box">
      <h3>Log in</h3>
      <LoginLogo alt="mender-logo" className="margin-bottom-small" />
      {isHosted && <OAuthHeader type="Log in" buttonProps={{ onClick: onOAuthClick }} />}
      <Form className={classes.form} showButtons={true} buttonColor="primary" onSubmit={onLoginClick} submitLabel="Log in" submitButtonId="login_button">
        <TextInput hint="Your email" label="Your email" id="email" required={true} validations="isLength:1,isEmail" />
        <PasswordInput className="margin-bottom-small" id="password" label="Password" required={true} />
        {isHosted ? (
          <div className="flexbox">
            <Link className={classes.link} to="/password">
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
            setControlRef={onSetRef}
          />
        ) : (
          <div />
        )}
        <FormControlLabel control={<Checkbox color="primary" checked={noExpiry} onChange={onNoExpiryClick} />} label="Stay logged in" />
      </Form>
      {isHosted && (
        <>
          {twoFARef.current && (
            <MenderTooltipClickable
              disableHoverListener={false}
              placement="right"
              className="absolute"
              style={twoFAAnchor}
              title={
                <div className={classes.tfaNote}>
                  Two Factor Authentication is enabled for your account. If you haven&apos;t set up a 3rd party authentication app with a verification code,
                  please contact an administrator.
                </div>
              }
            >
              <HelpIcon />
            </MenderTooltipClickable>
          )}
          <EntryLink target="signup" />
        </>
      )}
    </div>
  );
};

const actionCreators = { loginUser, logoutUser, setSnackbar };

const mapStateToProps = state => {
  return {
    currentUser: getCurrentUser(state),
    isHosted: state.app.features.isHosted
  };
};

export default connect(mapStateToProps, actionCreators)(Login);
