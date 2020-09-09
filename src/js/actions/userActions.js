import Cookies from 'universal-cookie';

import { setSnackbar } from './appActions';
import GeneralApi from '../api/general-api';
import UsersApi from '../api/users-api';
import * as UserConstants from '../constants/userConstants';
import { advanceOnboarding } from '../utils/onboardingmanager';
import { getToken } from '../auth';
import { preformatWithRequestID, decodeSessionToken } from '../helpers';

const cookies = new Cookies();
const { emptyRole, rolesByName, tenantadmUrl, useradmApiUrl } = UserConstants;

const handleLoginError = (err, has2FA) => dispatch => {
  const errorText = err.response.data?.error || err.message;
  const is2FABackend = errorText.includes('2fa');
  if (is2FABackend && !has2FA) {
    return dispatch(saveGlobalSettings({ '2fa': 'enabled' }, true));
  }
  const twoFAError = is2FABackend || has2FA ? ' and verification code' : '';
  const errorMessage = `There was a problem logging in. Please check your email${
    twoFAError ? ',' : ' and'
  } password${twoFAError}. If you still have problems, contact an administrator.`;
  return dispatch(setSnackbar(preformatWithRequestID(err.response, errorMessage), null, 'Copy to clipboard'));
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

export const passwordResetStart = email => () => GeneralApi.post(`${useradmApiUrl}/auth/password-reset/start`, { email: email });

export const passwordResetComplete = (secretHash, newPassword) => () =>
  GeneralApi.post(`${useradmApiUrl}/auth/password-reset/complete`, { secret_hash: secretHash, password: newPassword });

export const verify2FA = tfaData => dispatch =>
  UsersApi.putVerifyTFA(`${useradmApiUrl}/2faverify`, tfaData)
    .then(() => {
      return Promise.all([dispatch({ type: UserConstants.SUCCESSFULLY_LOGGED_IN, value: getToken() })]);
    })
    .catch(err => {
      return Promise.all([
        Promise.reject(err),
        dispatch(
          setSnackbar(
            preformatWithRequestID(err.response, 'An error occured validating the verification code: failed to verify token, please try again.'),
            null,
            'Copy to clipboard'
          )
        )
      ]);
    });

export const getUserList = () => dispatch =>
  GeneralApi.get(`${useradmApiUrl}/users`)
    .then(res => {
      const users = res.data.reduce((accu, item) => {
        accu[item.id] = item;
        return accu;
      }, {});
      return dispatch({ type: UserConstants.RECEIVED_USER_LIST, users });
    })
    .catch(err => {
      var errormsg = err.response?.data?.error.message || err.error || 'Please check your connection';
      dispatch(setSnackbar(preformatWithRequestID(err.response, `Users couldn't be loaded. ${errormsg}`)));
    });

export const getUser = id => dispatch =>
  GeneralApi.get(`${useradmApiUrl}/users/${id}`).then(({ data: user }) => Promise.resolve(dispatch({ type: UserConstants.RECEIVED_USER, user })));

export const createUser = userData => dispatch =>
  GeneralApi.post(`${useradmApiUrl}/users`, userData).then(() =>
    Promise.all([dispatch({ type: UserConstants.CREATED_USER, user: userData }), dispatch(getUserList())])
  );

export const removeUser = userId => dispatch =>
  GeneralApi.delete(`${useradmApiUrl}/users/${userId}`).then(() =>
    Promise.all([dispatch({ type: UserConstants.REMOVED_USER, userId }), dispatch(getUserList())])
  );

export const editUser = (userId, userData) => dispatch =>
  GeneralApi.put(`${useradmApiUrl}/users/${userId}`, userData).then(() => dispatch({ type: UserConstants.UPDATED_USER, userId, user: userData }));

export const setCurrentUser = user => dispatch => dispatch({ type: UserConstants.SET_CURRENT_USER, user });

export const getRoles = () => (dispatch, getState) =>
  GeneralApi.get(`${useradmApiUrl}/roles`).then(({ data: roles }) => {
    const rolesState = getState().users.rolesById;
    const rolesById = roles.reduce((accu, role) => {
      const { allowUserManagement, groups } = role.permissions.reduce(
        (accu, permission) => {
          if (permission.action === rolesByName.deploymentCreation.action && permission.object.type === rolesByName.deploymentCreation.object.type) {
            accu.groups.push(permission.object.value);
          }
          if (
            role.name === rolesByName.admin ||
            (permission.action == rolesByName.userManagement.action &&
              permission.object.type == rolesByName.userManagement.object.type &&
              permission.object.value == rolesByName.userManagement.object.value)
          ) {
            accu.allowUserManagement = true;
          }
          return accu;
        },
        { allowUserManagement: false, groups: [] }
      );
      accu[role.name] = {
        ...emptyRole,
        ...rolesState[role.name],
        groups,
        description: rolesState[role.name] && rolesState[role.name].description ? rolesState[role.name].description : role.description,
        editable: rolesState[role.name] && typeof rolesState[role.name].editable !== 'undefined' ? rolesState[role.name].editable : true,
        title: rolesState[role.name] && rolesState[role.name].title ? rolesState[role.name].title : role.name,
        permissions: role.permissions,
        allowUserManagement: allowUserManagement
      };
      return accu;
    }, {});
    return dispatch({ type: UserConstants.RECEIVED_ROLES, rolesById });
  });

const transformRoleDataToRole = roleData => {
  let permissions = roleData.groups.reduce(
    (accu, group) => [
      ...accu,
      { ...rolesByName.deploymentCreation, object: { ...rolesByName.deploymentCreation.object, value: group } },
      { ...rolesByName.groupAccess, object: { ...rolesByName.groupAccess.object, value: group } }
    ],
    []
  );
  if (roleData.allowUserManagement) {
    permissions.push(rolesByName.userManagement);
  }
  return {
    name: roleData.name,
    description: roleData.description,
    permissions
  };
};

export const createRole = roleData => dispatch => {
  const role = transformRoleDataToRole(roleData);
  return GeneralApi.post(`${useradmApiUrl}/roles`, role).then(() =>
    Promise.all([dispatch({ type: UserConstants.CREATED_ROLE, role: { ...emptyRole, ...role }, roleId: role.name }), dispatch(getRoles())])
  );
};

export const editRole = roleData => dispatch => {
  const role = transformRoleDataToRole(roleData);
  const roleId = role.name;
  return GeneralApi.put(`${useradmApiUrl}/roles/${roleId}`, role).then(() =>
    Promise.all([dispatch({ type: UserConstants.UPDATED_ROLE, role: { ...emptyRole, ...role }, roleId: roleId }), dispatch(getRoles())])
  );
};

export const removeRole = roleId => dispatch =>
  GeneralApi.delete(`${useradmApiUrl}/roles/${roleId}`)
    .then(() => Promise.all([dispatch({ type: UserConstants.REMOVED_ROLE, roleId }), dispatch(getRoles())]))
    .catch(err =>
      Promise.all([Promise.reject(err), dispatch(setSnackbar(preformatWithRequestID(err.response, err.response.data.error), null, 'Copy to clipboard'))])
    );

/*
  Tenant management + Hosted Mender
*/
export const getUserOrganization = () => dispatch =>
  GeneralApi.get(`${tenantadmUrl}/user/tenant`).then(res => Promise.resolve(dispatch({ type: UserConstants.SET_ORGANIZATION, organization: res.data })));

/*
  Global settings
*/
export const getGlobalSettings = () => dispatch =>
  GeneralApi.get(`${useradmApiUrl}/settings`).then(({ data: settings }) => dispatch({ type: UserConstants.SET_GLOBAL_SETTINGS, settings }));

export const saveGlobalSettings = (settings, beOptimistic = false) => (dispatch, getState) => {
  const updatedSettings = { ...getState().users.globalSettings, ...settings };
  let tasks = [dispatch({ type: UserConstants.SET_GLOBAL_SETTINGS, settings: updatedSettings })];
  return GeneralApi.post(`${useradmApiUrl}/settings`, updatedSettings)
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

export const saveUserSettings = settings => (dispatch, getState) => {
  const currentUserId = (getState().users.byId[getState().users.currentUser] || {}).id;
  const updatedSettings = {
    [currentUserId]: {
      ...getState().users.globalSettings[currentUserId],
      ...settings
    }
  };
  return dispatch(saveGlobalSettings(updatedSettings));
};

export const get2FAQRCode = () => dispatch =>
  GeneralApi.get(`${useradmApiUrl}/2faqr`).then(res => dispatch({ type: UserConstants.RECEIVED_QR_CODE, value: res.data.qr }));

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
