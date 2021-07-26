const apiUrl = '/api/management/v1';
const useradmApiUrl = `${apiUrl}/useradm`;

const staticRolesByName = {
  admin: 'RBAC_ROLE_PERMIT_ALL',
  readOnly: 'RBAC_ROLE_OBSERVER',
  ci: 'RBAC_ROLE_CI',
  deploymentsManager: 'RBAC_ROLE_DEPLOYMENTS_MANAGER',
  terminalAccess: 'RBAC_ROLE_REMOTE_TERMINAL'
};

module.exports = {
  RECEIVED_QR_CODE: 'RECEIVED_QR_CODE',

  SUCCESSFULLY_LOGGED_IN: 'SUCCESSFULLY_LOGGED_IN',
  USER_LOGOUT: 'USER_LOGOUT',
  RECEIVED_ACTIVATION_CODE: 'RECEIVED_ACTIVATION_CODE',
  RECEIVED_USER_LIST: 'RECEIVED_USER_LIST',
  RECEIVED_USER: 'RECEIVED_USER',
  CREATED_USER: 'CREATED_USER',
  REMOVED_USER: 'REMOVED_USER',
  UPDATED_USER: 'UPDATED_USER',

  RECEIVED_ROLES: 'RECEIVED_ROLES',
  CREATED_ROLE: 'CREATED_ROLE',
  UPDATED_ROLE: 'UPDATED_ROLE',
  REMOVED_ROLE: 'REMOVED_ROLE',

  SET_GLOBAL_SETTINGS: 'SET_GLOBAL_SETTINGS',
  SET_SHOW_HELP: 'SET_SHOW_HELP',
  SET_SHOW_CONNECT_DEVICE: 'SET_SHOW_CONNECT_DEVICE',

  OWN_USER_ID: 'me',
  emptyRole: { title: undefined, allowUserManagement: false, groups: [], description: '', editable: undefined, permissions: [] },
  rolesById: {
    [staticRolesByName.admin]: { title: 'Admin', allowUserManagement: true, groups: [], description: 'Full access', editable: false, permissions: [] },
    [staticRolesByName.readOnly]: { title: 'Read Access', allowUserManagement: false, groups: [], description: '', editable: false, permissions: [] },
    [staticRolesByName.ci]: { title: 'Releases Manager', allowUserManagement: false, groups: [], description: '', editable: false, permissions: [] },
    [staticRolesByName.deploymentsManager]: {
      title: 'Deployments Manager',
      allowUserManagement: false,
      groups: [],
      description: '',
      editable: false,
      permissions: []
    },
    [staticRolesByName.terminalAccess]: {
      title: 'Troubleshooting',
      allowUserManagement: false,
      groups: [],
      description: 'Access to the troubleshooting features: Remote Terminal, File Transfer, Port Forwarding',
      editable: false,
      permissions: []
    }
  },
  rolesByName: {
    ...staticRolesByName,
    userManagement: { action: 'http', object: { type: 'any', value: `${useradmApiUrl}/.*` } },
    deploymentCreation: { action: 'CREATE_DEPLOYMENT', object: { type: 'DEVICE_GROUP', value: undefined } },
    groupAccess: { action: 'VIEW_DEVICE', object: { type: 'DEVICE_GROUP', value: undefined } }
  },
  twoFAStates: {
    enabled: 'enabled',
    disabled: 'disabled',
    unverified: 'unverified'
  },
  useradmApiUrl
};
