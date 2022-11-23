import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Cookies from 'universal-cookie';

import { accessTokens, defaultPassword, defaultState, receivedPermissionSets, receivedRoles, token, userId } from '../../../tests/mockData';
import {
  createRole,
  createUser,
  disableUser2fa,
  editRole,
  editUser,
  enableUser2fa,
  generateToken,
  get2FAQRCode,
  getRoles,
  getTokens,
  getUser,
  getUserList,
  loginUser,
  logoutUser,
  passwordResetComplete,
  passwordResetStart,
  removeRole,
  removeUser,
  revokeToken,
  saveGlobalSettings,
  saveUserSettings,
  setAccountActivationCode,
  setHideAnnouncement,
  setShowConnectingDialog,
  toggleHelptips,
  updateUserColumnSettings,
  verify2FA,
  verifyEmailComplete,
  verifyEmailStart
} from './userActions';
import * as OnboardingConstants from '../constants/onboardingConstants';
import { SET_SNACKBAR, SET_ANNOUNCEMENT, SET_OFFLINE_THRESHOLD } from '../constants/appConstants';
import {
  CREATED_ROLE,
  CREATED_USER,
  emptyRole,
  RECEIVED_ACTIVATION_CODE,
  RECEIVED_PERMISSION_SETS,
  RECEIVED_QR_CODE,
  RECEIVED_ROLES,
  RECEIVED_USER_LIST,
  RECEIVED_USER,
  REMOVED_ROLE,
  REMOVED_USER,
  SET_CUSTOM_COLUMNS,
  SET_GLOBAL_SETTINGS,
  SET_SHOW_CONNECT_DEVICE,
  SET_SHOW_HELP,
  SET_USER_SETTINGS,
  SUCCESSFULLY_LOGGED_IN,
  uiPermissionsById,
  UPDATED_ROLE,
  UPDATED_USER,
  USER_LOGOUT
} from '../constants/userConstants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const defaultRole = { ...emptyRole, name: 'test', description: 'test description' };
const settings = { test: true };

/* eslint-disable sonarjs/no-identical-functions */
describe('user actions', () => {
  it('should forward connecting dialog visibility', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      {
        type: SET_SHOW_CONNECT_DEVICE,
        show: true
      }
    ];
    await store.dispatch(setShowConnectingDialog(true));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should toggle helptips visibility based on cookie value', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: SET_SHOW_HELP, show: true },
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: true }
    ];
    const store = mockStore({ ...defaultState });
    store.dispatch(toggleHelptips());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should toggle helptips visibility based on cookie value - pt 2', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: SET_SHOW_HELP, show: false },
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: false }
    ];
    const store = mockStore({
      ...defaultState,
      users: {
        ...defaultState.users,
        userSettings: { ...defaultState.users.userSettings, showHelptips: true }
      }
    });
    store.dispatch(toggleHelptips());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow retrieving 2fa qr codes', async () => {
    jest.clearAllMocks();
    const expectedActions = [{ type: RECEIVED_QR_CODE, value: btoa('test') }];
    const store = mockStore({ ...defaultState });
    await store.dispatch(get2FAQRCode(true));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should verify 2fa codes during 2fa setup', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: RECEIVED_USER, user: defaultState.users.byId[userId] },
      { type: SET_CUSTOM_COLUMNS, value: [] }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(verify2FA({ token2fa: '123456' }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow enabling 2fa during 2fa setup', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: RECEIVED_USER, user: defaultState.users.byId.a1 },
      { type: SET_CUSTOM_COLUMNS, value: [] }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(enableUser2fa(defaultState.users.byId.a1.id));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow disabling 2fa during 2fa setup', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: RECEIVED_USER, user: defaultState.users.byId.a1 },
      { type: SET_CUSTOM_COLUMNS, value: [] }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(disableUser2fa(defaultState.users.byId.a1.id));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow beginning email verification', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: RECEIVED_USER, user: defaultState.users.byId[userId] },
      { type: SET_CUSTOM_COLUMNS, value: [] }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(verifyEmailStart());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow processing email verification codes', async () => {
    jest.clearAllMocks();
    const expectedActions = [{ type: RECEIVED_ACTIVATION_CODE, code: 'code' }];
    const store = mockStore({ ...defaultState });
    await store.dispatch(setAccountActivationCode('code'));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow completing email verification', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: RECEIVED_USER, user: defaultState.users.byId[userId] },
      { type: SET_CUSTOM_COLUMNS, value: [] }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(verifyEmailComplete('superSecret'));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    const result = store.dispatch(verifyEmailComplete('ohNo'));
    expect(result).rejects.toBeTruthy();
  });
  it('should allow logging in', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: SUCCESSFULLY_LOGGED_IN, value: token },
      { type: RECEIVED_USER, user: defaultState.users.byId[userId] },
      { type: SET_CUSTOM_COLUMNS, value: [] }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(loginUser({ email: 'test@example.com', password: defaultPassword }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow logging out', async () => {
    jest.clearAllMocks();
    const expectedActions = [{ type: USER_LOGOUT }];
    const store = mockStore({ ...defaultState });
    await store.dispatch(logoutUser());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should not allow logging out with an active upload', async () => {
    jest.clearAllMocks();
    const store = mockStore({ ...defaultState, releases: { ...defaultState.releases, uploadProgress: 42 } });
    await store.dispatch(logoutUser()).catch(() => expect(true).toEqual(true));
  });
  it('should notify on log out if a reason is given', async () => {
    jest.clearAllMocks();
    const expectedActions = [{ type: USER_LOGOUT }, { type: SET_SNACKBAR, snackbar: { message: 'timeout' } }];
    const store = mockStore({ ...defaultState });
    await store.dispatch(logoutUser('timeout'));
    const storeActions = store.getActions();
    // expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow single user retrieval', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: RECEIVED_USER, user: defaultState.users.byId.a1 },
      { type: SET_CUSTOM_COLUMNS, value: [] }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(getUser('a1'));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow user list retrieval', async () => {
    jest.clearAllMocks();
    const expectedActions = [{ type: RECEIVED_USER_LIST, users: defaultState.users.byId }];
    const store = mockStore({ ...defaultState });
    await store.dispatch(getUserList());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow single user creation', async () => {
    jest.clearAllMocks();
    const createdUser = { email: 'a@b.com', password: defaultPassword };
    const expectedActions = [
      { type: CREATED_USER, user: createdUser },
      { type: SET_SNACKBAR, snackbar: { message: 'The user was created successfully.' } },
      { type: RECEIVED_USER_LIST, users: defaultState.users.byId }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(createUser(createdUser));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow single user edits', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: UPDATED_USER, userId: 'a1', user: { password: defaultPassword } },
      { type: SET_SNACKBAR, snackbar: { message: 'The user has been updated.' } }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(editUser('a1', { email: defaultState.users.byId.a1.email, password: defaultPassword }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should not allow current user edits without proper password', async () => {
    jest.clearAllMocks();
    const store = mockStore({ ...defaultState });
    const result = store.dispatch(editUser('a1', { email: 'a@evil.com', password: 'mySecretPasswordNot' }));
    expect(result).rejects.toBeTruthy();
  });
  it('should allow single user removal', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: REMOVED_USER, userId: 'a1' },
      { type: SET_SNACKBAR, snackbar: { message: 'The user was removed from the system.' } },
      { type: RECEIVED_USER_LIST, users: defaultState.users.byId }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(removeUser('a1'));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow role list retrieval', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: RECEIVED_PERMISSION_SETS, value: receivedPermissionSets },
      { type: RECEIVED_ROLES, value: receivedRoles }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(getRoles());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow role creation', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      { type: CREATED_ROLE, role: defaultRole, roleId: defaultRole.name },
      { type: RECEIVED_PERMISSION_SETS, value: receivedPermissionSets },
      { type: RECEIVED_ROLES, value: receivedRoles }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(createRole({ ...defaultRole, uiPermissions: { groups: [{ group: 'testGroup', uiPermissions: [uiPermissionsById.manage.value] }] } }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow role edits', async () => {
    jest.clearAllMocks();
    const expectedActions = [
      {
        type: UPDATED_ROLE,
        roleId: defaultRole.name,
        role: {
          ...defaultRole,
          uiPermissions: {
            ...defaultRole.uiPermissions,
            groups: { ...defaultRole.uiPermissions.groups, testGroup: [uiPermissionsById.manage.value] }
          }
        }
      },
      { type: RECEIVED_PERMISSION_SETS, value: receivedPermissionSets },
      { type: RECEIVED_ROLES, value: receivedRoles }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(
      editRole({ name: defaultRole.name, uiPermissions: { groups: [{ group: 'testGroup', uiPermissions: [uiPermissionsById.manage.value] }] } })
    );
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow role removal', async () => {
    jest.clearAllMocks();
    // eslint-disable-next-line no-unused-vars
    const { test, ...remainder } = defaultState.users.rolesById;
    const expectedActions = [
      { type: REMOVED_ROLE, value: remainder },
      { type: RECEIVED_PERMISSION_SETS, value: receivedPermissionSets },
      { type: RECEIVED_ROLES, value: receivedRoles }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(removeRole('test'));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow password reset - pt. 1', async () => {
    const store = mockStore({ ...defaultState });
    store.dispatch(passwordResetStart(defaultState.users.byId.a1.email)).then(() => expect(true).toEqual(true));
  });
  it('should allow password reset - pt. 2', async () => {
    const store = mockStore({ ...defaultState });
    store.dispatch(passwordResetComplete('secretHash', 'newPassword')).then(() => expect(true).toEqual(true));
  });
  it('should allow storing global settings without deletion', async () => {
    jest.clearAllMocks();
    // eslint-disable-next-line no-unused-vars
    const { id_attribute, ...retrievedSettings } = defaultState.users.globalSettings;
    const expectedActions = [
      { type: SET_GLOBAL_SETTINGS, settings: { ...retrievedSettings } },
      { type: SET_OFFLINE_THRESHOLD, value: '2019-01-12T13:00:00.900Z' },
      { type: SET_GLOBAL_SETTINGS, settings: { ...defaultState.users.globalSettings, ...settings } }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(saveGlobalSettings(settings));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow storing global settings without deletion and with notification', async () => {
    jest.clearAllMocks();
    // eslint-disable-next-line no-unused-vars
    const { id_attribute, ...retrievedSettings } = defaultState.users.globalSettings;
    const expectedActions = [
      { type: SET_GLOBAL_SETTINGS, settings: { ...retrievedSettings } },
      { type: SET_OFFLINE_THRESHOLD, value: '2019-01-12T13:00:00.900Z' },
      { type: SET_GLOBAL_SETTINGS, settings: { ...defaultState.users.globalSettings, ...settings } },
      { type: SET_SNACKBAR, snackbar: { message: 'Settings saved successfully' } }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(saveGlobalSettings(settings, false, true));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow storing user scoped settings', async () => {
    jest.clearAllMocks();
    // eslint-disable-next-line no-unused-vars
    const { ...settings } = defaultState.users.userSettings;
    const expectedActions = [
      { type: SET_USER_SETTINGS, settings },
      {
        type: SET_USER_SETTINGS,
        settings: { ...settings, extra: 'this' }
      }
    ];
    const store = mockStore({ ...defaultState });
    await store.dispatch(saveUserSettings({ extra: 'this' }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should store the visibility of the announcement shown in the header in a cookie on dismissal', async () => {
    jest.clearAllMocks();
    const cookies = new Cookies();
    const expectedActions = [{ type: SET_ANNOUNCEMENT, announcement: undefined }];
    const store = mockStore({ ...defaultState, app: { ...defaultState.app, hostedAnnouncement: 'something' } });
    await store.dispatch(setHideAnnouncement(true));
    const storeActions = store.getActions();
    expect(cookies.get).toHaveBeenCalledTimes(1);
    expect(cookies.set).toHaveBeenCalledTimes(1);
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should store the sizes of columns in local storage', async () => {
    jest.clearAllMocks();
    const expectedActions = [{ type: SET_CUSTOM_COLUMNS, value: [{ asd: 'asd' }] }];
    const store = mockStore({ ...defaultState, users: { ...defaultState.users, customColumns: [{ asd: 'asd' }] } });
    await store.dispatch(updateUserColumnSettings([{ asd: 'asd' }]));
    const storeActions = store.getActions();
    expect(localStorage.getItem).not.toHaveBeenCalled();
    expect(localStorage.setItem).toHaveBeenCalled();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));

    jest.clearAllMocks();
    await store.dispatch(updateUserColumnSettings());
    expect(localStorage.getItem).toHaveBeenCalledTimes(1);
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('should allow token list retrieval', async () => {
    jest.clearAllMocks();
    const expectedActions = [{ type: UPDATED_USER, userId: 'a1', user: { tokens: accessTokens } }];
    const store = mockStore({ ...defaultState });
    await store.dispatch(getTokens());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow token generation', async () => {
    jest.clearAllMocks();
    const expectedActions = [{ type: UPDATED_USER, userId: 'a1', user: { tokens: accessTokens } }];
    const store = mockStore({ ...defaultState });
    const result = await store.dispatch(generateToken({ name: 'name' }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expect(result[result.length - 1]).toEqual(token);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow token removal', async () => {
    jest.clearAllMocks();
    // eslint-disable-next-line no-unused-vars
    const expectedActions = [{ type: UPDATED_USER, userId: 'a1', user: { tokens: accessTokens } }];
    const store = mockStore({ ...defaultState });
    await store.dispatch(revokeToken({ id: 'some-id-1' }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
});
