// Copyright 2016 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { ChevronRight, Help as HelpIcon } from '@mui/icons-material';
import { Button, Checkbox, FormControlLabel } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import Cookies from 'universal-cookie';

import LoginLogo from '../../../assets/img/loginlogo.svg';
import VeryMuch from '../../../assets/img/verymuch.svg';
import { setSnackbar } from '../../actions/appActions';
import { loginUser, logoutUser } from '../../actions/userActions';
import { getToken } from '../../auth';
import { TIMEOUTS, locations } from '../../constants/appConstants';
import { useradmApiUrl } from '../../constants/userConstants';
import { getCurrentUser } from '../../selectors';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import Form from '../common/forms/form';
import PasswordInput from '../common/forms/passwordinput';
import TextInput from '../common/forms/textinput';
import LinedHeader from '../common/lined-header';
import { MenderTooltipClickable } from '../common/mendertooltip';
import { OAuth2Providers } from './oauth2providers';

const cookies = new Cookies();

export const locationMap = {
  eu: { ...locations.eu, fallback: locations.us },
  us: { ...locations.us, fallback: locations.eu }
};

const useStyles = makeStyles()(theme => {
  const skew = 3;
  const backgroundRadius = 100;
  return {
    entryLink: {
      color: theme.palette.background.paper,
      a: { color: theme.palette.text.entryLink }
    },
    form: { maxWidth: 400 },
    reset: {
      transform: `skew(0, ${skew}deg)`,
      'svg': { maxWidth: 200 },
      '#login-logo path': { fill: theme.palette.background.paper },
      '#login-box': {
        background: theme.palette.background.paper,
        minWidth: 'calc(100% + 20px)',
        maxWidth: 'initial',
        paddingBottom: 25,
        paddingRight: 60,
        paddingLeft: 50,
        borderRadius: 10
      }
    },
    background: {
      background: theme.palette.background.darkBlue,
      padding: '40px 65px',
      borderTopLeftRadius: backgroundRadius,
      borderBottomRightRadius: backgroundRadius,
      marginBottom: 60,
      marginTop: 30,
      transform: `skew(0, -${skew}deg)`,
      zIndex: 1
    },
    link: { marginLeft: theme.spacing(-0.5) },
    ntBranding: { bottom: `calc(${theme.mixins.toolbar.minHeight}px + 3vh)`, right: 0, zIndex: 0 },
    tfaNote: { maxWidth: 300 }
  };
});

const entryText = {
  signup: { linkText: 'Sign up here', question: `Don't have an account?`, target: '/signup' },
  login: { linkText: 'Log in', question: `Already have an account?`, target: '/login' }
};

export const EntryLink = ({ className = '', target = 'signup' }) => (
  <div className={`margin-top margin-bottom flexbox centered ${className}`}>
    <div className="muted margin-right">{entryText[target].question}</div>
    <Link className="flexbox center-aligned" to={entryText[target].target}>
      {entryText[target].linkText} <ChevronRight fontSize="small" />
    </Link>
  </div>
);

export const LocationWarning = () => {
  const location = Object.entries(locations).reduce(
    (accu, [key, value]) => ([`staging.${value.location}`, value.location].includes(window.location.hostname) ? key : accu),
    locations.us.key
  );
  const { icon: Icon, title, fallback } = locationMap[location];
  return (
    <div className="flexbox centered margin-top-large">
      <Icon />
      <div className="margin-left-small">
        You are logging into the <b style={{ marginLeft: 4 }}>{title} server</b>.
      </div>
      <a className="flexbox center-aligned margin-left-small" href={`https://${fallback.location}/ui/`}>
        Change to {fallback.title} <ChevronRight fontSize="small" />
      </a>
    </div>
  );
};

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
    return () => {
      setSnackbar('');
    };
  }, []);

  useEffect(() => {
    if (currentUser.id) {
      setSnackbar('');
    }
  }, [currentUser]);

  const onLoginClick = useCallback(
    loginData => {
      // set no expiry in localstorage to remember checkbox value and avoid any influence of expiration time that might occur with cookies
      loginUser(loginData, noExpiry).catch(err => {
        // don't reset the state once it was set - thus not setting `has2FA` solely based on the existence of 2fa in the error
        if (err?.error?.includes('2fa')) {
          setHas2FA(true);
        }
      });
    },
    [noExpiry]
  );

  const onSetRef = useCallback(
    ref => {
      twoFARef.current = ref;
      setRefresh(!refresh);
    },
    [refresh]
  );

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
    <>
      {isHosted ? <LocationWarning /> : <div />}
      <div className={`content ${classes.background}`}>
        <div className={`flexbox column centered ${classes.reset}`}>
          <LoginLogo alt="mender-logo" id="login-logo" className="margin-bottom" />
          <div className="flexbox column" id="login-box">
            <h1 className="flexbox centered">Welcome back!</h1>
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
            {isHosted && twoFARef.current && (
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
          </div>
          {isHosted ? <EntryLink className={classes.entryLink} target="signup" /> : <div className="padding" />}
        </div>
      </div>
      <VeryMuch className={`absolute ${classes.ntBranding}`} />
    </>
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
