import Cookies from 'universal-cookie';

import { setSnackbar } from '../actions/appActions';
import GeneralApi from '../api/general-api';
import UsersApi from '../api/users-api';
import * as UserConstants from '../constants/userConstants';
import { advanceOnboarding } from '../utils/onboardingmanager';
import { preformatWithRequestID, decodeSessionToken } from '../helpers';

const cookies = new Cookies();
const apiUrl = '/api/management/v1';
const tenantadmUrl = `${apiUrl}/tenantadm`;
const useradmApiUrl = `${apiUrl}/useradm`;

const handleLoginError = (err, has2FA) => dispatch => {
  const errorText = err.error.text ? err.error.text.error : err.error.message;
  const is2FABackend = errorText.includes('2fa');
  if (is2FABackend && !has2FA) {
    return dispatch(saveGlobalSettings({ '2fa': 'enabled' }, true));
  }
  let errMsg = 'There was a problem logging in';
  if (err.res && err.res.body && Object.keys(err.res.body).includes('error')) {
    const twoFAError = is2FABackend || has2FA ? ' and verification code' : '';
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
export const loginUser = userData => (dispatch, getState) =>
  UsersApi.postLogin(`${useradmApiUrl}/auth/login`, userData)
    .then(res => {
      const token = res.text;
      if (!token) {
        return;
      }
      let options = {};
      if (userData.hasOwnProperty('noExpiry')) {
        // set no expiry as cookie to remember checkbox value, even though this is set, maxAge takes precedent if present
        options = { expires: new Date('2500-12-31') };
        cookies.set('noExpiry', userData.noExpiry.toString(), options);
      } else {
        options = { maxAge: 900 };
      }

      // save token as cookie
      // set maxAge if noexpiry checkbox not checked
      cookies.set('JWT', token, options);

      const userId = decodeSessionToken(token);
      return Promise.all([dispatch({ type: UserConstants.SUCCESSFULLY_LOGGED_IN, value: token }), dispatch(getUser(userId))]);
    })
    .catch(err => {
      cookies.remove('JWT');
      const has2FA = getState().users.globalSettings.hasOwnProperty('2fa') && getState().users.globalSettings['2fa'] === 'enabled';
      return Promise.all([Promise.reject(err), dispatch(handleLoginError(err, has2FA))]);
    });

export const logoutUser = () => dispatch => Promise.resolve(dispatch({ type: UserConstants.USER_LOGOUT }));

export const verify2FA = tfaData => dispatch =>
  UsersApi.putVerifyTFA(`${useradmApiUrl}/2faverify`, tfaData)
    .then(() => {
      return Promise.all([dispatch({ type: UserConstants.SUCCESSFULLY_LOGGED_IN, value: cookies.get('JWT') })]);
    })
    .catch(err => {
      return Promise.all([
        Promise.reject(err),
        dispatch(setSnackbar(preformatWithRequestID(err.res, 'failed to verify token, please try again.'), null, 'Copy to clipboard'))
      ]);
    });

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

export const getUser = id => dispatch =>
  UsersApi.get(`${useradmApiUrl}/users/${id}`).then(user => Promise.resolve(dispatch({ type: UserConstants.RECEIVED_USER, user })));

export const createUser = userData => dispatch =>
  UsersApi.post(`${useradmApiUrl}/users`, userData).then(() =>
    Promise.all([dispatch({ type: UserConstants.CREATED_USER, user: userData }), dispatch(getUserList())])
  );

export const removeUser = userId => dispatch =>
  UsersApi.delete(`${useradmApiUrl}/users/${userId}`).then(() =>
    Promise.all([dispatch({ type: UserConstants.REMOVED_USER, userId }), dispatch(getUserList())])
  );

export const editUser = (userId, userData) => dispatch =>
  UsersApi.put(`${useradmApiUrl}/users/${userId}`, userData).then(() => dispatch({ type: UserConstants.UPDATED_USER, userId, user: userData }));

export const setCurrentUser = user => dispatch => dispatch({ type: UserConstants.SET_CURRENT_USER, user });

export const getRoles = () => (dispatch, getState) =>
  UsersApi.get(`${useradmApiUrl}/roles`).then(res => {
    const rolesState = getState().users.rolesById;
    const rolesById = res.reduce((accu, role) => {
      const groups = role.permissions.reduce((accu, permission) => {
        if (permission.action === 'any' && permission.object.type === 'DEVICE_GROUP') {
          accu.push(permission.object.value);
        }
        return accu;
      }, []);
      accu[role.name] = {
        ...UserConstants.emptyRole,
        ...rolesState[role.name],
        groups,
        description: rolesState[role.name] && rolesState[role.name].description ? rolesState[role.name].description : role.description,
        editable: rolesState[role.name] && typeof rolesState[role.name].editable !== 'undefined' ? rolesState[role.name].editable : true,
        title: rolesState[role.name] && rolesState[role.name].title ? rolesState[role.name].title : role.name,
        permissions: role.permissions
      };
      return accu;
    }, {});
    return dispatch({ type: UserConstants.RECEIVED_ROLES, rolesById });
  });

export const createRole = roleData => dispatch => {
  let permissions = roleData.groups.map(group => ({ action: 'CREATE_DEPLOYMENT', object: { type: 'DEVICE_GROUP', value: group } }));
  if (roleData.allowUserManagement) {
    permissions.push({
      action: 'http',
      object: {
        type: 'any',
        value: `${useradmApiUrl}/.*`
      }
    });
  }
  const role = {
    name: roleData.name,
    description: roleData.description,
    permissions
  };
  return UsersApi.post(`${useradmApiUrl}/roles`, role).then(() =>
    Promise.all([dispatch({ type: UserConstants.CREATED_ROLE, role: { ...UserConstants.emptyRole, ...role }, roleId: role.name }), dispatch(getRoles())])
  );
};

export const removeRole = roleId => dispatch =>
  UsersApi.delete(`${useradmApiUrl}/roles/${roleId}`)
    .then(() => Promise.all([dispatch({ type: UserConstants.REMOVED_ROLE, roleId }), dispatch(getRoles())]))
    .catch(err => Promise.all([Promise.reject(err), dispatch(setSnackbar(preformatWithRequestID(err.res, err.res.body.error), null, 'Copy to clipboard'))]));

/* 
  Tenant management + Hosted Mender
*/
export const getUserOrganization = () => dispatch =>
  GeneralApi.get(`${tenantadmUrl}/user/tenant`).then(res => Promise.resolve(dispatch({ type: UserConstants.SET_ORGANIZATION, organization: res.body })));

/* 
  Global settings 
*/
export const getGlobalSettings = () => dispatch =>
  UsersApi.get(`${useradmApiUrl}/settings`).then(res => dispatch({ type: UserConstants.SET_GLOBAL_SETTINGS, settings: res }));

export const saveGlobalSettings = (settings, beOptimistic = false) => (dispatch, getState) => {
  const updatedSettings = { ...getState().users.globalSettings, ...settings };
  let tasks = [dispatch({ type: UserConstants.SET_GLOBAL_SETTINGS, settings: updatedSettings })];
  return UsersApi.post(`${useradmApiUrl}/settings`, updatedSettings)
    .then(() => {
      if (updatedSettings.hasOwnProperty('2fa') && updatedSettings['2fa'] === 'enabled') {
        const state = getState();
        tasks.push(dispatch(get2FAQRCode(state.users.byId[state.users.currentUser].email)));
      }
      return Promise.all(tasks);
    })
    .catch(() => {
      if (beOptimistic) {
        return Promise.all([tasks]);
      }
      return Promise.reject();
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
    var userCookie = cookies.get(user.id) || {};
    var updatedValue = !userCookie.help;
    userCookie.help = updatedValue;
    userCookie = JSON.stringify(userCookie);
    cookies.set(user.id, userCookie);
    return dispatch(setShowHelptips(updatedValue));
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

export const setOnboardingState = state => dispatch =>
  Promise.all([
    dispatch(setOnboardingComplete(state.complete)),
    dispatch(setOnboardingDeviceType(state.deviceType)),
    dispatch(setOnboardingApproach(state.approach)),
    dispatch(setOnboardingArtifactIncluded(state.artifactIncluded)),
    dispatch(setShowOnboardingHelp(state.showTips)),
    dispatch(setOnboardingProgress(state.progress)),
    dispatch(setShowCreateArtifactDialog(state.showArtifactCreation))
  ]);
