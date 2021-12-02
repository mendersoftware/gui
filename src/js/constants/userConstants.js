'use strict';

const { apiUrl } = require('../api/general-api');
const { ALL_DEVICES } = require('./deviceConstants');

const useradmApiUrlv1 = `${apiUrl.v1}/useradm`;
const useradmApiUrlv2 = `${apiUrl.v2}/useradm`;

const staticRolesByName = {
  admin: 'RBAC_ROLE_PERMIT_ALL',
  readOnly: 'RBAC_ROLE_OBSERVER',
  ci: 'RBAC_ROLE_CI',
  deploymentsManager: 'RBAC_ROLE_DEPLOYMENTS_MANAGER',
  terminalAccess: 'RBAC_ROLE_REMOTE_TERMINAL'
};

const PermissionTypes = {
  Any: 'any',
  Get: 'GET',
  Post: 'POST',
  Put: 'PUT',
  Delete: 'DELETE',
  Patch: 'PATCH',
  DeviceGroup: 'DEVICE_GROUP',
  DeviceId: 'DEVICE_ID'
};

const permissionSetIds = {
  Basic: 'Basic',
  ConnectToDevices: 'ConnectToDevices',
  DeployToDevices: 'DeployToDevices',
  ManageDevices: 'ManageDevices',
  ManageReleases: 'ManageReleases',
  ManageUsers: 'ManageUsers',
  ReadAuditLogs: 'ReadAuditLogs',
  ReadDevices: 'ReadDevices',
  ReadReleases: 'ReadReleases',
  ReadUsers: 'ReadUsers',
  SuperUser: 'SuperUser',
  UploadArtifacts: 'UploadArtifacts'
};

const uiPermissionsById = {
  connect: {
    explanations: { groups: `'Connect' allows the user to use mender-connect features and Troubleshoot add-ons.` },
    permissionLevel: 2,
    permissionSets: { groups: permissionSetIds.ConnectToDevices },
    title: 'Connect',
    value: 'connect',
    verbs: [PermissionTypes.Get, PermissionTypes.Put]
  },
  deploy: {
    explanations: { groups: `'Deploy' allows the user to deploy software or configuration updates to devices.` },
    permissionLevel: 2,
    permissionSets: { groups: permissionSetIds.DeployToDevices },
    title: 'Deploy',
    value: 'deploy',
    verbs: [PermissionTypes.Post]
  },
  manage: {
    explanations: {
      groups: `'Manage' allows the user to edit device name, notes, and manage authentication status. For 'All devices' it also allows the user to edit and create device groups.`,
      releases: `'Manage' allows the user to upload new artifacts, edit release descriptions and remove artifacts.`
    },
    permissionLevel: 2,
    permissionSets: {
      groups: permissionSetIds.ManageDevices,
      releases: permissionSetIds.ManageReleases,
      userManagement: permissionSetIds.ManageUsers
    },
    title: 'Manage',
    value: 'manage',
    verbs: [PermissionTypes.Post, PermissionTypes.Put, PermissionTypes.Patch]
  },
  read: {
    explanations: { groups: `'Read' allows the user to view devices.` },
    permissionLevel: 1,
    permissionSets: {
      auditlog: permissionSetIds.ReadAuditLogs,
      groups: permissionSetIds.ReadDevices,
      releases: permissionSetIds.ReadReleases,
      userManagement: permissionSetIds.ReadUsers
    },
    title: 'Read',
    value: 'read',
    verbs: [PermissionTypes.Get, PermissionTypes.Post]
  },
  upload: {
    explanations: { groups: `'Upload' allows the user to upload new Artifacts.` },
    permissionLevel: 1,
    permissionSets: { releases: permissionSetIds.UploadArtifacts },
    title: 'Upload',
    value: 'upload',
    verbs: [PermissionTypes.Post, PermissionTypes.Put, PermissionTypes.Patch]
  }
};

const defaultPermissionSets = {
  [permissionSetIds.Basic]: { value: permissionSetIds.Basic },
  [permissionSetIds.SuperUser]: { value: permissionSetIds.SuperUser },
  [permissionSetIds.ManageUsers]: {
    value: permissionSetIds.ManageUsers,
    result: {
      userManagement: [uiPermissionsById.manage.value]
    }
  },
  [permissionSetIds.ReadAuditLogs]: {
    value: permissionSetIds.ReadAuditLogs,
    result: {
      auditlog: [uiPermissionsById.read.value]
    }
  },
  [permissionSetIds.ReadReleases]: {
    value: permissionSetIds.ReadReleases,
    result: {
      releases: [uiPermissionsById.read.value]
    }
  },
  [permissionSetIds.ReadUsers]: {
    value: permissionSetIds.ReadUsers,
    result: {
      userManagement: [uiPermissionsById.read.value]
    }
  },
  [permissionSetIds.UploadArtifacts]: {
    value: permissionSetIds.UploadArtifacts,
    result: {
      releases: [uiPermissionsById.upload.value]
    }
  },
  [permissionSetIds.ManageReleases]: {
    value: permissionSetIds.ManageReleases,
    result: {
      releases: [uiPermissionsById.manage.value]
    }
  },
  [permissionSetIds.ConnectToDevices]: {
    value: permissionSetIds.ConnectToDevices,
    result: {
      groups: { [ALL_DEVICES]: [uiPermissionsById.connect.value] }
    }
  },
  [permissionSetIds.DeployToDevices]: {
    value: permissionSetIds.DeployToDevices,
    result: {
      groups: { [ALL_DEVICES]: [uiPermissionsById.deploy.value] }
    }
  },
  [permissionSetIds.ManageDevices]: {
    value: permissionSetIds.ManageDevices,
    result: {
      groups: { [ALL_DEVICES]: [uiPermissionsById.manage.value] }
    }
  },
  [permissionSetIds.ReadDevices]: {
    value: permissionSetIds.ReadDevices,
    result: {
      groups: { [ALL_DEVICES]: [uiPermissionsById.read.value] }
    }
  }
};
/**
 * _uiPermissions_ represent the possible permissions/ rights that can be given for the area
 * _endpoints_ represent the possible endpoints this definition might be affecting in the UI and what
 *              functionality might be affected
 *
 */
const uiPermissionsByArea = {
  auditlog: {
    endpoints: [{ path: /\/(auditlog)/i, types: [PermissionTypes.Get], uiPermissions: [uiPermissionsById.read] }],
    explanation:
      'Granting access to the audit log will allow tracing changes to devices, releases and user accounts, as well provide information about deployments.',
    uiPermissions: [uiPermissionsById.read],
    title: 'System audit log'
  },
  deployments: {
    endpoints: [
      { path: /\/(deployments\/deployments)/i, types: [PermissionTypes.Post, PermissionTypes.Put], uiPermissions: [uiPermissionsById.deploy] },
      { path: /\/(deployments\/deployments)/i, types: [PermissionTypes.Get], uiPermissions: [uiPermissionsById.read] }
    ],
    explanation: 'Providing deploy permissions will allow deployments to be created using the releases and devices a user has access to.',
    uiPermissions: [uiPermissionsById.read, uiPermissionsById.deploy],
    title: 'Deployments'
  },
  groups: {
    endpoints: [
      {
        path: /\/(devauth|inventory|deviceconfig|devicemonitor|deviceconnect\/devices)/i,
        types: [PermissionTypes.Get],
        uiPermissions: [uiPermissionsById.read]
      },
      { path: /\/(devauth|inventory|deviceconfig)/i, types: [PermissionTypes.Put, PermissionTypes.Post], uiPermissions: [uiPermissionsById.manage] },
      { path: /\/(deviceconfig)/i, types: [PermissionTypes.Post], uiPermissions: [uiPermissionsById.deploy] },
      { path: /\/(deviceconnect\/devices)/i, types: [PermissionTypes.Get, PermissionTypes.Post], uiPermissions: [uiPermissionsById.connect] }
    ],
    explanation: 'Device group management permissions control the degree to which devices in a group can be accessed and moved to other groups.',
    scope: 'DeviceGroups',
    uiPermissions: [uiPermissionsById.read, uiPermissionsById.manage, uiPermissionsById.deploy, uiPermissionsById.connect],
    title: 'Group Management'
  },
  releases: {
    endpoints: [
      { path: /\/(deployments\/artifacts|deployments\/deployments\/releases)/i, types: [PermissionTypes.Get], uiPermissions: [uiPermissionsById.read] },
      {
        path: /\/(deployments\/artifacts|deployments\/deployments\/releases)/i,
        types: [PermissionTypes.Post, PermissionTypes.Put],
        uiPermissions: [uiPermissionsById.read, uiPermissionsById.upload]
      },
      {
        path: /\/(deployments\/artifacts|deployments\/deployments\/releases)/i,
        types: [PermissionTypes.Delete],
        uiPermissions: [uiPermissionsById.read, uiPermissionsById.manage]
      }
    ],
    explanation: 'Release permissions can be granted to allow artifact & release modifications, as well as the creation of new releases.',
    uiPermissions: [uiPermissionsById.read, uiPermissionsById.manage, uiPermissionsById.upload],
    title: 'Releases'
  },
  userManagement: {
    endpoints: [
      { path: /\/(useradm)/i, types: [PermissionTypes.Get], uiPermissions: [uiPermissionsById.read] },
      { path: /\/(useradm)/i, types: [PermissionTypes.Post], uiPermissions: [uiPermissionsById.manage] }
    ],
    explanation:
      'User management permissions should be granted carefully, as these allow privilege increases for any users managed by a user with user management permissions',
    uiPermissions: [uiPermissionsById.read, uiPermissionsById.manage],
    title: 'User Management'
  }
};

const emptyUiPermissions = Object.freeze({
  auditlog: [],
  deployments: [],
  groups: Object.freeze({}),
  releases: [],
  userManagement: []
});

const emptyRole = Object.freeze({
  title: undefined,
  description: '',
  permissions: [],
  uiPermissions: Object.freeze({ ...emptyUiPermissions })
});

const permissionMapper = permission => permission.value;

const rolesById = Object.freeze({
  [staticRolesByName.admin]: {
    title: 'Admin',
    value: staticRolesByName.admin,
    description: 'Full access',
    permissions: [], // permissions refers to the values returned from the backend
    uiPermissions: {
      ...emptyUiPermissions,
      auditlog: uiPermissionsByArea.auditlog.uiPermissions.map(permissionMapper),
      deployments: uiPermissionsByArea.deployments.uiPermissions.map(permissionMapper),
      groups: { [ALL_DEVICES]: uiPermissionsByArea.groups.uiPermissions.map(permissionMapper) },
      releases: uiPermissionsByArea.releases.uiPermissions.map(permissionMapper),
      userManagement: uiPermissionsByArea.userManagement.uiPermissions.map(permissionMapper)
    }
  },
  [staticRolesByName.readOnly]: {
    title: 'Read Access',
    value: staticRolesByName.readOnly,
    description: '',
    permissions: [],
    uiPermissions: {
      ...emptyUiPermissions,
      deployments: [uiPermissionsById.read.value],
      groups: { [ALL_DEVICES]: [uiPermissionsById.read.value] },
      releases: [uiPermissionsById.read.value]
    }
  },
  [staticRolesByName.ci]: {
    title: 'Releases Manager',
    value: staticRolesByName.ci,
    description: '',
    permissions: [],
    uiPermissions: {
      ...emptyUiPermissions,
      releases: uiPermissionsByArea.releases.uiPermissions.map(permissionMapper)
    }
  },
  [staticRolesByName.deploymentsManager]: {
    title: 'Deployments Manager',
    value: staticRolesByName.deploymentsManager,
    description: '',
    permissions: [],
    uiPermissions: {
      ...emptyUiPermissions,
      deployments: uiPermissionsByArea.deployments.uiPermissions.map(permissionMapper),
      groups: { [ALL_DEVICES]: [uiPermissionsById.deploy.value] }
    }
  },
  [staticRolesByName.terminalAccess]: {
    title: 'Troubleshooting',
    value: staticRolesByName.terminalAccess,
    description: 'Access to the troubleshooting features: Remote Terminal, File Transfer, Port Forwarding',
    permissions: [],
    uiPermissions: {
      ...emptyUiPermissions,
      groups: { [ALL_DEVICES]: [uiPermissionsById.connect.value] }
    }
  }
});

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

  RECEIVED_PERMISSION_SETS: 'RECEIVED_PERMISSION_SETS',
  RECEIVED_ROLES: 'RECEIVED_ROLES',
  CREATED_ROLE: 'CREATED_ROLE',
  UPDATED_ROLE: 'UPDATED_ROLE',
  REMOVED_ROLE: 'REMOVED_ROLE',

  SET_CUSTOM_COLUMNS: 'SET_CUSTOM_COLUMNS',
  SET_GLOBAL_SETTINGS: 'SET_GLOBAL_SETTINGS',
  SET_SHOW_HELP: 'SET_SHOW_HELP',
  SET_SHOW_CONNECT_DEVICE: 'SET_SHOW_CONNECT_DEVICE',

  OWN_USER_ID: 'me',

  defaultPermissionSets,
  emptyUiPermissions,
  emptyRole,
  PermissionTypes,
  rolesById,
  rolesByName: {
    ...staticRolesByName,
    deploymentCreation: { action: 'CREATE_DEPLOYMENT', object: { type: 'DEVICE_GROUP', value: undefined } },
    groupAccess: { action: 'VIEW_DEVICE', object: { type: 'DEVICE_GROUP', value: undefined } },
    userManagement: { action: 'http', object: { type: 'any', value: `${useradmApiUrlv1}/.*` } }
  },
  twoFAStates: {
    enabled: 'enabled',
    disabled: 'disabled',
    unverified: 'unverified'
  },
  settingsKeys: {
    initialized: 'settings-initialized'
  },
  uiPermissionsByArea,
  uiPermissionsById,
  useradmApiUrl: useradmApiUrlv1,
  useradmApiUrlv2
};
