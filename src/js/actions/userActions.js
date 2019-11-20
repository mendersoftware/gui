import cookie from 'react-cookie';

import { getHostedLinks, setSnackbar } from '../actions/appActions';
import GeneralApi from '../api/general-api';
import UsersApi from '../api/users-api';
import * as UserConstants from '../constants/userConstants';
import { advanceOnboarding } from '../utils/onboardingmanager';
import { preformatWithRequestID, decodeSessionToken } from '../helpers';

const apiUrl = '/api/management/v1';
const tenantadmUrl = `${apiUrl}/tenantadm`;
const useradmApiUrl = `${apiUrl}/useradm`;

const handleLoginError = err => dispatch => {
  const self = this;
  const is2FABackend = err.error.text.error && err.error.text.error.includes('2fa');
  if (is2FABackend && !self.props.has2FA) {
    return dispatch(saveGlobalSettings({ '2fa': 'enabled' }));
  }
  let errMsg = 'There was a problem logging in';
  if (err.res && err.res.body && Object.keys(err.res.body).includes('error')) {
    const twoFAError = is2FABackend || self.props.has2FA ? ' and verification code' : '';
    const errorMessage = `There was a problem logging in. Please check your email${
      twoFAError ? ',' : ' and'
    } password${twoFAError}. If you still have problems, contact an administrator.`;
    // if error message, check for "unauthorized"
    errMsg = err.res.body['error'] === 'unauthorized' ? errorMessage : `${errMsg}: ${err.res.body['error']}`;
  } else {
    errMsg = `${errMsg}\n${err.error.text && err.error.text.message ? err.error.text.message : ''}`;
  }
  return dispatch(setSnackbar(preformatWithRequestID(err.res, errMsg), null, 'Copy to clipboard'));
};

/* 
  User management 
*/
export const loginUser = userData => dispatch =>
  UsersApi.postLogin(`${useradmApiUrl}/auth/login`, userData)
    .catch(err => dispatch(handleLoginError(err)))
    .then(res => {
      const token = res.text;
      if (!token) {
        return;
      }
      var options = {};
      if (!userData.noExpiry) {
        options = { maxAge: 900 };
      }

      // set no expiry as cookie to remember checkbox value
      cookie.save('noExpiry', userData.noExpiry.toString());

      // save token as cookie
      // set maxAge if noexpiry checkbox not checked
      cookie.save('JWT', token, options);

      var userId = decodeSessionToken(token);
      return Promise.all([dispatch({ type: UserConstants.SUCCESSFULLY_LOGGED_IN, value: token }), getUser(userId)(dispatch)]);
    })
    .catch(err => dispatch(handleLoginError(err)));

export const getUserList = () => dispatch =>
  UsersApi.get(`${useradmApiUrl}/users`)
    .then(res => {
      const users = res.reduce((accu, item) => {
        accu[item.id] = item;
        return accu;
      }, {});
      return dispatch({ type: UserConstants.RECEIVED_USER_LIST, users });
    })
    .catch(err => {
      var errormsg = err.error || 'Please check your connection';
      dispatch(setSnackbar(preformatWithRequestID(err.res, `Users couldn't be loaded. ${errormsg}`)));
    });

export const getUser = id => dispatch => UsersApi.get(`${useradmApiUrl}/users/${id}`).then(user => dispatch({ type: UserConstants.RECEIVED_USER, user }));

export const createUser = userData => dispatch =>
  UsersApi.post(`${useradmApiUrl}/users`, userData).then(() =>
    Promise.all([dispatch({ type: UserConstants.CREATED_USER, user: userData }), getUserList()(dispatch)])
  );

export const removeUser = userId => dispatch =>
  UsersApi.delete(`${useradmApiUrl}/users/${userId}`).then(() =>
    Promise.all([dispatch({ type: UserConstants.REMOVED_USER, userId }), getUserList()(dispatch)])
  );

export const editUser = (userId, userData) => dispatch =>
  UsersApi.put(`${useradmApiUrl}/users/${userId}`, userData).then(() => dispatch({ type: UserConstants.UPDATED_USER, userId, user: userData }));

export const setCurrentUser = user => dispatch => dispatch({ type: UserConstants.SET_CURRENT_USER, user });

/* 
  Tenant management + Hosted Mender
*/
export const getUserOrganization = () => dispatch =>
  GeneralApi.get(`${tenantadmUrl}/user/tenant`).then(res =>
    Promise.all([dispatch({ type: UserConstants.SET_ORGANIZATION, organization: res.body }), dispatch(getHostedLinks(res.body.id))])
  );

/* 
  Global settings 
*/
export const getGlobalSettings = () => dispatch =>
  UsersApi.get(`${useradmApiUrl}/settings`).then(res => dispatch({ type: UserConstants.SET_GLOBAL_SETTINGS, settings: res }));

export const saveGlobalSettings = settings => (dispatch, getState) => {
  const updatedSettings = { ...getState().users.globalSettings, ...settings };
  return UsersApi.post(`${useradmApiUrl}/settings`, updatedSettings).then(() => {
    let tasks = [dispatch({ type: UserConstants.SET_GLOBAL_SETTINGS, updatedSettings })];
    if (updatedSettings.hasOwnProperty('2fa') && updatedSettings['2fa'] === 'enabled') {
      const state = getState();
      tasks.push(get2FAQRCode(state.users.byId[state.users.currentUser].email)(dispatch));
    }
    return Promise.all(tasks);
  });
};

export const get2FAQRCode = () => dispatch =>
  UsersApi.get(`${useradmApiUrl}/2faqr`).then(res => dispatch({ type: UserConstants.RECEIVED_QR_CODE, value: res.qr }));

/*
  Onboarding
*/
export const setShowHelptips = show => dispatch =>
  Promise.all([dispatch({ type: UserConstants.SET_SHOW_HELP, show }), dispatch({ type: UserConstants.SET_SHOW_ONBOARDING_HELP, show })]);

export const toggleHelptips = () => (dispatch, getState) => {
  const state = getState();
  const user = state.users.byId[state.users.currentUser] || {};
  if (user.id) {
    // if current user id available from store
    var userCookie = cookie.load(user.id) || {};
    var updatedValue = !userCookie.help;
    userCookie.help = updatedValue;
    userCookie = JSON.stringify(userCookie);
    cookie.save(user.id, userCookie);
    setShowHelptips(updatedValue)(dispatch);
  }
};

export const setShowOnboardingHelp = show => dispatch => dispatch({ type: UserConstants.SET_SHOW_ONBOARDING_HELP, show });

export const setOnboardingProgress = value => dispatch => dispatch({ type: UserConstants.SET_ONBOARDING_PROGRESS, value });

export const setOnboardingDeviceType = value => dispatch => dispatch({ type: UserConstants.SET_ONBOARDING_DEVICE_TYPE, value });

export const setOnboardingApproach = value => dispatch => dispatch({ type: UserConstants.SET_ONBOARDING_APPROACH, value });

export const setOnboardingArtifactIncluded = value => dispatch => dispatch({ type: UserConstants.SET_ONBOARDING_ARTIFACT_INCLUDED, value });

export const setShowDismissOnboardingTipsDialog = show => dispatch => dispatch({ type: UserConstants.SET_SHOW_ONBOARDING_HELP_DIALOG, show });

export const setOnboardingComplete = val => dispatch => {
  if (val) {
    advanceOnboarding('onboarding-finished');
  }
  return Promise.all([
    dispatch({ type: UserConstants.SET_ONBOARDING_COMPLETE, complete: val }),
    dispatch({ type: UserConstants.SET_SHOW_ONBOARDING_HELP, show: !val })
  ]);
};

export const setShowConnectingDialog = show => dispatch => dispatch({ type: UserConstants.SET_SHOW_CONNECT_DEVICE, show });

export const setShowCreateArtifactDialog = show => dispatch => dispatch({ type: UserConstants.SET_SHOW_CREATE_ARTIFACT, show });

export const setConnectingDialogProgressed = val => dispatch => {
  if (val) {
    advanceOnboarding('devices-accepted-onboarding');
  }
  return dispatch({ type: UserConstants.SET_CONNECT_DEVICE_PROGRESSED, progressed: val });
};
