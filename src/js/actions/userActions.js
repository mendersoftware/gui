import Cookies from 'universal-cookie';

import { commonErrorHandler, setSnackbar } from './appActions';
import GeneralApi from '../api/general-api';
import UsersApi from '../api/users-api';
import OnboardingConstants from '../constants/onboardingConstants';
import UserConstants from '../constants/userConstants';
import { getUserSettings } from '../selectors';
import { getToken, logout } from '../auth';
import { extractErrorMessage, preformatWithRequestID, decodeSessionToken } from '../helpers';

const cookies = new Cookies();
const { emptyRole, rolesByName, useradmApiUrl } = UserConstants;

const handleLoginError = (err, has2FA) => dispatch => {
  const errorText = extractErrorMessage(err);
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
        options = { expires: new Date('2500-12-31'), sameSite: 'strict', path: '/' };
        cookies.set('noExpiry', userData.noExpiry.toString(), options);
      } else {
        options = { maxAge: 900, sameSite: 'strict', path: '/' };
      }

      // save token as cookie
      // set maxAge if noexpiry checkbox not checked
      cookies.set('JWT', token, options);

      const userId = decodeSessionToken(token);
      window.sessionStorage.removeItem('pendings-redirect');
      window.location.replace('#/');
      return Promise.all([dispatch({ type: UserConstants.SUCCESSFULLY_LOGGED_IN, value: token }), dispatch(getUser(userId))]);
    })
    .catch(err => {
      cookies.remove('JWT', { path: '/' });
      const has2FA = getState().users.globalSettings.hasOwnProperty('2fa') && getState().users.globalSettings['2fa'] === 'enabled';
      return Promise.all([Promise.reject(err), dispatch(handleLoginError(err, has2FA))]);
    });

export const logoutUser = reason => (dispatch, getState) => {
  if (getState().releases.uploadProgress) {
    return Promise.reject();
  }
  return GeneralApi.post(`${useradmApiUrl}/auth/logout`).finally(() => {
    let tasks = [dispatch({ type: UserConstants.USER_LOGOUT })];
    if (reason) {
      tasks.push(dispatch(setSnackbar(reason)));
    }
    logout();
    return Promise.all(tasks);
  });
};

export const passwordResetStart = email => dispatch =>
  GeneralApi.post(`${useradmApiUrl}/auth/password-reset/start`, { email: email }).catch(err =>
    commonErrorHandler(err, `The password reset request cannot be processed:`, dispatch)
  );

export const passwordResetComplete = (secretHash, newPassword) => dispatch =>
  GeneralApi.post(`${useradmApiUrl}/auth/password-reset/complete`, { secret_hash: secretHash, password: newPassword }).catch(err => {
    let status = ((err || {}).res || {}).status,
      errorMsg;
    if (status == 400) {
      errorMsg = 'the link you are using expired or the request is not valid, please try again.';
    } else {
      errorMsg = (err || {}).error;
    }
    dispatch(setSnackbar('The password reset request cannot be processed: ' + errorMsg));
    return Promise.reject(err);
  });

export const verify2FA = tfaData => dispatch =>
  UsersApi.putVerifyTFA(`${useradmApiUrl}/2faverify`, tfaData)
    .then(() => {
      return Promise.all([dispatch({ type: UserConstants.SUCCESSFULLY_LOGGED_IN, value: getToken() })]);
    })
    .catch(err => commonErrorHandler(err, 'An error occured validating the verification code: failed to verify token, please try again.', dispatch));

export const getUserList = () => dispatch =>
  GeneralApi.get(`${useradmApiUrl}/users`)
    .then(res => {
      const users = res.data.reduce((accu, item) => {
        accu[item.id] = item;
        return accu;
      }, {});
      return dispatch({ type: UserConstants.RECEIVED_USER_LIST, users });
    })
    .catch(err => commonErrorHandler(err, `Users couldn't be loaded.`, dispatch, 'Please check your connection'));

export const getUser = id => dispatch =>
  GeneralApi.get(`${useradmApiUrl}/users/${id}`).then(({ data: user }) => Promise.all([dispatch({ type: UserConstants.RECEIVED_USER, user }), user]));

const actions = {
  create: {
    successMessage: 'The user was created successfully.',
    errorMessage: 'creating'
  },
  edit: {
    successMessage: 'The user has been updated.',
    errorMessage: 'editing'
  },
  remove: {
    successMessage: 'The user was removed from the system.',
    errorMessage: 'removing'
  }
};

const userActionErrorHandler = (err, type, dispatch) => commonErrorHandler(err, `There was an error ${actions[type].errorMessage} the user.`, dispatch);

export const createUser = userData => dispatch =>
  GeneralApi.post(`${useradmApiUrl}/users`, userData)
    .then(() =>
      Promise.all([
        dispatch({ type: UserConstants.CREATED_USER, user: userData }),
        dispatch(getUserList()),
        dispatch(setSnackbar(actions.create.successMessage))
      ])
    )
    .catch(err => userActionErrorHandler(err, 'create', dispatch));

export const removeUser = userId => dispatch =>
  GeneralApi.delete(`${useradmApiUrl}/users/${userId}`)
    .then(() =>
      Promise.all([dispatch({ type: UserConstants.REMOVED_USER, userId }), dispatch(getUserList()), dispatch(setSnackbar(actions.remove.successMessage))])
    )
    .catch(err => userActionErrorHandler(err, 'remove', dispatch));

export const editUser = (userId, userData) => dispatch =>
  GeneralApi.put(`${useradmApiUrl}/users/${userId}`, userData)
    .then(() => Promise.all([dispatch({ type: UserConstants.UPDATED_USER, userId, user: userData }), dispatch(setSnackbar(actions.edit.successMessage))]))
    .catch(err => userActionErrorHandler(err, 'edit', dispatch));

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
    .catch(err => commonErrorHandler(err, `There was an error removing the role:`, dispatch));

/*
  Global settings
*/
export const getGlobalSettings = () => dispatch =>
  GeneralApi.get(`${useradmApiUrl}/settings`).then(({ data: settings }) => {
    window.sessionStorage.setItem('settings-initialized', true);
    return Promise.resolve(dispatch({ type: UserConstants.SET_GLOBAL_SETTINGS, settings }));
  });

export const saveGlobalSettings = (settings, beOptimistic = false, notify = false) => (dispatch, getState) => {
  if (!window.sessionStorage.getItem('settings-initialized')) {
    return;
  }
  const updatedSettings = { ...getState().users.globalSettings, ...settings };
  let tasks = [dispatch({ type: UserConstants.SET_GLOBAL_SETTINGS, settings: updatedSettings })];
  return GeneralApi.post(`${useradmApiUrl}/settings`, updatedSettings)
    .then(() => {
      if (updatedSettings.hasOwnProperty('2fa') && updatedSettings['2fa'] === 'enabled') {
        tasks.push(dispatch(get2FAQRCode()));
      }
      if (notify) {
        tasks.push(dispatch(setSnackbar('Settings saved successfully')));
      }
      return Promise.all(tasks);
    })
    .catch(err => {
      if (beOptimistic) {
        return Promise.all([tasks]);
      }
      console.log(err);
      if (notify) {
        return commonErrorHandler(err, `The settings couldn't be saved.`, dispatch);
      }
      return Promise.reject();
    });
};

export const saveUserSettings = settings => (dispatch, getState) => {
  if (!getState().users.currentUser) {
    return Promise.resolve();
  }
  const userSettings = getUserSettings(getState());
  const updatedSettings = {
    [getState().users.currentUser]: {
      ...userSettings,
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
  Promise.all([dispatch({ type: UserConstants.SET_SHOW_HELP, show }), dispatch({ type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show })]);

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

export const setShowConnectingDialog = show => dispatch => dispatch({ type: UserConstants.SET_SHOW_CONNECT_DEVICE, show });
