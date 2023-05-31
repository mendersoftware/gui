'use strict';

// Copyright 2015 Northern.tech AS
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
import { apiUrl } from '../api/general-api';
import { ALL_DEVICES } from './deviceConstants';
import { ALL_RELEASES } from './releaseConstants';

export const useradmApiUrlv1 = `${apiUrl.v1}/useradm`;
export const useradmApiUrlv2 = `${apiUrl.v2}/useradm`;
export { useradmApiUrlv1 as useradmApiUrl };

const staticRolesByName = {
  admin: 'RBAC_ROLE_PERMIT_ALL',
  readOnly: 'RBAC_ROLE_OBSERVER',
  ci: 'RBAC_ROLE_CI',
  deploymentsManager: 'RBAC_ROLE_DEPLOYMENTS_MANAGER',
  terminalAccess: 'RBAC_ROLE_REMOTE_TERMINAL'
};

export const PermissionTypes = {
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
  ConfigureDevices: 'ConfigureDevices',
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

export const uiPermissionsById = {
  configure: {
    explanations: { groups: `'Configure' allows the user to use mender-configure features and apply configurations.` },
    permissionLevel: 2,
    permissionSets: { groups: permissionSetIds.ConfigureDevices },
    title: 'Configure',
    value: 'configure',
    verbs: [PermissionTypes.Get, PermissionTypes.Put, PermissionTypes.Post]
  },
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
    unscopedOnly: { releases: true },
    permissionLevel: 1,
    permissionSets: { releases: permissionSetIds.UploadArtifacts },
    title: 'Upload',
    value: 'upload',
    verbs: [PermissionTypes.Post, PermissionTypes.Put, PermissionTypes.Patch]
  }
};

export const defaultPermissionSets = {
  [permissionSetIds.Basic]: { name: permissionSetIds.Basic },
  [permissionSetIds.SuperUser]: { name: permissionSetIds.SuperUser },
  [permissionSetIds.ManageUsers]: {
    name: permissionSetIds.ManageUsers,
    result: {
      userManagement: [uiPermissionsById.manage.value]
    }
  },
  [permissionSetIds.ReadAuditLogs]: {
    name: permissionSetIds.ReadAuditLogs,
    result: {
      auditlog: [uiPermissionsById.read.value]
    }
  },
  [permissionSetIds.ReadReleases]: {
    name: permissionSetIds.ReadReleases,
    result: {
      releases: { [ALL_RELEASES]: [uiPermissionsById.read.value] }
    }
  },
  [permissionSetIds.ReadUsers]: {
    name: permissionSetIds.ReadUsers,
    result: {
      userManagement: [uiPermissionsById.read.value]
    }
  },
  [permissionSetIds.UploadArtifacts]: {
    name: permissionSetIds.UploadArtifacts,
    result: {
      releases: { [ALL_RELEASES]: [uiPermissionsById.upload.value] }
    }
  },
  [permissionSetIds.ManageReleases]: {
    name: permissionSetIds.ManageReleases,
    result: {
      releases: { [ALL_RELEASES]: [uiPermissionsById.manage.value] }
    }
  },
  [permissionSetIds.ConfigureDevices]: {
    name: permissionSetIds.ConfigureDevices,
    result: {
      groups: { [ALL_DEVICES]: [uiPermissionsById.configure.value] }
    }
  },
  [permissionSetIds.ConnectToDevices]: {
    name: permissionSetIds.ConnectToDevices,
    result: {
      groups: { [ALL_DEVICES]: [uiPermissionsById.connect.value] }
    }
  },
  [permissionSetIds.DeployToDevices]: {
    name: permissionSetIds.DeployToDevices,
    result: {
      groups: { [ALL_DEVICES]: [uiPermissionsById.deploy.value] }
    }
  },
  [permissionSetIds.ManageDevices]: {
    name: permissionSetIds.ManageDevices,
    result: {
      groups: { [ALL_DEVICES]: [uiPermissionsById.manage.value] }
    }
  },
  [permissionSetIds.ReadDevices]: {
    name: permissionSetIds.ReadDevices,
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
export const uiPermissionsByArea = {
  auditlog: {
    endpoints: [{ path: /\/(auditlog)/i, types: [PermissionTypes.Get], uiPermissions: [uiPermissionsById.read] }],
    explanation:
      'Granting access to the audit log will allow tracing changes to devices, releases and user accounts, as well as providing information about deployments.',
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
      { path: /\/(devauth|inventory)/i, types: [PermissionTypes.Put, PermissionTypes.Post], uiPermissions: [uiPermissionsById.manage] },
      { path: /\/(deviceconfig)/i, types: [PermissionTypes.Get, PermissionTypes.Put, PermissionTypes.Post], uiPermissions: [uiPermissionsById.configure] },
      { path: /\/(deviceconnect\/devices)/i, types: [PermissionTypes.Get, PermissionTypes.Post], uiPermissions: [uiPermissionsById.connect] }
    ],
    explanation: 'Device group management permissions control the degree to which devices in a group can be accessed and moved to other groups.',
    scope: 'DeviceGroups',
    uiPermissions: [uiPermissionsById.read, uiPermissionsById.manage, uiPermissionsById.deploy, uiPermissionsById.configure, uiPermissionsById.connect],
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
    scope: 'ReleaseTags',
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

export const emptyUiPermissions = Object.freeze({
  auditlog: [],
  deployments: [],
  groups: Object.freeze({}),
  releases: Object.freeze({}),
  userManagement: []
});

export const emptyRole = Object.freeze({
  name: undefined,
  description: '',
  permissions: [],
  uiPermissions: Object.freeze({ ...emptyUiPermissions })
});

const permissionMapper = permission => permission.value;
export const itemUiPermissionsReducer = (accu, { item, uiPermissions }) => (item ? { ...accu, [item]: uiPermissions } : accu);

export const rolesById = Object.freeze({
  [staticRolesByName.admin]: {
    name: 'Admin',
    value: staticRolesByName.admin,
    description: 'Full access',
    permissions: [], // permissions refers to the values returned from the backend
    uiPermissions: {
      ...emptyUiPermissions,
      auditlog: uiPermissionsByArea.auditlog.uiPermissions.map(permissionMapper),
      deployments: uiPermissionsByArea.deployments.uiPermissions.map(permissionMapper),
      groups: { [ALL_DEVICES]: uiPermissionsByArea.groups.uiPermissions.map(permissionMapper) },
      releases: { [ALL_RELEASES]: uiPermissionsByArea.releases.uiPermissions.map(permissionMapper) },
      userManagement: uiPermissionsByArea.userManagement.uiPermissions.map(permissionMapper)
    }
  },
  [staticRolesByName.readOnly]: {
    name: 'Read Access',
    value: staticRolesByName.readOnly,
    description: '',
    permissions: [],
    uiPermissions: {
      ...emptyUiPermissions,
      deployments: [uiPermissionsById.read.value],
      groups: { [ALL_DEVICES]: [uiPermissionsById.read.value] },
      releases: { [ALL_RELEASES]: [uiPermissionsById.read.value] },
      userManagement: [uiPermissionsById.read.value]
    }
  },
  [staticRolesByName.ci]: {
    name: 'Releases Manager',
    value: staticRolesByName.ci,
    description: '',
    permissions: [],
    uiPermissions: {
      ...emptyUiPermissions,
      releases: { [ALL_RELEASES]: uiPermissionsByArea.releases.uiPermissions.map(permissionMapper) }
    }
  },
  [staticRolesByName.deploymentsManager]: {
    name: 'Deployments Manager',
    value: staticRolesByName.deploymentsManager,
    description: '',
    permissions: [],
    uiPermissions: {
      ...emptyUiPermissions,
      deployments: uiPermissionsByArea.deployments.uiPermissions.map(permissionMapper),
      groups: { [ALL_DEVICES]: [uiPermissionsById.deploy.value] },
      releases: { [ALL_RELEASES]: [uiPermissionsById.read.value] }
    }
  },
  [staticRolesByName.terminalAccess]: {
    name: 'Troubleshooting',
    value: staticRolesByName.terminalAccess,
    description: 'Access to the troubleshooting features: Remote Terminal, File Transfer, Port Forwarding',
    permissions: [],
    uiPermissions: {
      ...emptyUiPermissions,
      groups: { [ALL_DEVICES]: [uiPermissionsById.connect.value] }
    }
  }
});

export const RECEIVED_QR_CODE = 'RECEIVED_QR_CODE';

export const SUCCESSFULLY_LOGGED_IN = 'SUCCESSFULLY_LOGGED_IN';
export const USER_LOGOUT = 'USER_LOGOUT';
export const RECEIVED_ACTIVATION_CODE = 'RECEIVED_ACTIVATION_CODE';
export const RECEIVED_USER_LIST = 'RECEIVED_USER_LIST';
export const RECEIVED_USER = 'RECEIVED_USER';
export const CREATED_USER = 'CREATED_USER';
export const REMOVED_USER = 'REMOVED_USER';
export const UPDATED_USER = 'UPDATED_USER';

export const RECEIVED_PERMISSION_SETS = 'RECEIVED_PERMISSION_SETS';
export const RECEIVED_ROLES = 'RECEIVED_ROLES';
export const CREATED_ROLE = 'CREATED_ROLE';
export const UPDATED_ROLE = 'UPDATED_ROLE';
export const REMOVED_ROLE = 'REMOVED_ROLE';

export const SET_CUSTOM_COLUMNS = 'SET_CUSTOM_COLUMNS';
export const SET_GLOBAL_SETTINGS = 'SET_GLOBAL_SETTINGS';
export const SET_USER_SETTINGS = 'SET_USER_SETTINGS';
export const SET_SHOW_HELP = 'SET_SHOW_HELP';
export const SET_SHOW_CONNECT_DEVICE = 'SET_SHOW_CONNECT_DEVICE';

export const OWN_USER_ID = 'me';

export const rolesByName = {
  ...staticRolesByName,
  deploymentCreation: { action: 'CREATE_DEPLOYMENT', object: { type: 'DEVICE_GROUP', value: undefined } },
  groupAccess: { action: 'VIEW_DEVICE', object: { type: 'DEVICE_GROUP', value: undefined } },
  userManagement: { action: 'http', object: { type: 'any', value: `${useradmApiUrlv1}/.*` } }
};
export const twoFAStates = {
  enabled: 'enabled',
  disabled: 'disabled',
  unverified: 'unverified'
};
export const settingsKeys = { initialized: 'settings-initialized' };
