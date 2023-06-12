// Copyright 2020 Northern.tech AS
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
import { rest } from 'msw';

import { defaultPermissionSets, useradmApiUrl, useradmApiUrlv2 } from '../../src/js/constants/userConstants';
import { accessTokens, defaultPassword, defaultState, userId as defaultUserId, permissionSets, token } from '../mockData';

export const roles = [
  {
    name: 'dyn',
    description: '',
    permissions: [
      { action: 'CREATE_DEPLOYMENT', object: { type: 'DEVICE_GROUP', value: 'dyn' } },
      { action: 'VIEW_DEVICE', object: { type: 'DEVICE_GROUP', value: 'dyn' } }
    ]
  },
  { name: 'asdasd', description: '123', permissions: [{ action: 'http', object: { type: 'any', value: '/api/management/v1/useradm/.*' } }] },
  {
    name: '141sasd',
    description: '1313adg',
    permission_sets_with_scope: [
      { ...defaultPermissionSets.ReadDevices, scope: { type: 'DeviceGroups', value: ['bestgroup'] } },
      { ...defaultPermissionSets.ConnectToDevices, scope: { type: 'DeviceGroups', value: ['bestgroup'] } },
      { ...defaultPermissionSets.ManageUsers }
    ]
  },
  {
    name: 'kljlkk',
    description: 'lkl',
    permission_sets_with_scope: [{ ...defaultPermissionSets.ConnectToDevices, scope: { type: 'DeviceGroups', value: ['bestgroup'] } }]
  },
  {
    name: 'yyyyy',
    description: 'asd',
    permission_sets_with_scope: [
      { ...defaultPermissionSets.ManageDevices, scope: { type: 'DeviceGroups', value: ['dockerclient'] } },
      { ...defaultPermissionSets.ManageReleases }
    ]
  },
  {
    name: 'RBAC_ROLE_DEPLOYMENTS_MANAGER',
    description: 'Intended for users responsible for managing deployments, this role can create and abort deployments',
    permission_sets_with_scope: [{ ...defaultPermissionSets.DeployToDevices }]
  },
  {
    name: 'RBAC_ROLE_REMOTE_TERMINAL',
    description: `Intended for tech support accounts, this role can access the devices' Remote Terminal.`,
    permission_sets_with_scope: [{ ...defaultPermissionSets.ConnectToDevices }]
  },
  { name: 'RBAC_ROLE_PERMIT_ALL', description: '', permission_sets_with_scope: [{ ...defaultPermissionSets.SuperUser }] },
  {
    name: 'RBAC_ROLE_OBSERVER',
    description:
      'Intended for team leaders or limited tech support accounts, this role can see all Devices, Artifacts and Deployment reports but not make any changes.',
    permission_sets_with_scope: [{ ...defaultPermissionSets.ReadReleases }, { ...defaultPermissionSets.ReadDevices }]
  },
  {
    name: 'RBAC_ROLE_CI',
    description:
      'Intended for automation accounts building software (e.g. CI/CD systems), this role can only manage Artifacts, including upload new Artifacts and delete Artifacts. It does not have access to Devices or Deployments.',
    permission_sets_with_scope: [
      { ...defaultPermissionSets.ReadReleases },
      { ...defaultPermissionSets.ManageReleases },
      { ...defaultPermissionSets.UploadArtifacts }
    ]
  }
];

export const userHandlers = [
  rest.post(`${useradmApiUrl}/auth/login`, ({ headers }, res, ctx) => {
    const authHeader = headers.get('authorization');
    const authInfo = atob(authHeader?.split(' ')[1]);
    const [user, password] = authInfo.split(':');
    if (password !== defaultPassword) {
      return res(ctx.status(401));
    } else if (user.includes('limited')) {
      return res(ctx.status(200), ctx.json('limitedToken'));
    }
    return res(ctx.status(200), ctx.json(token));
  }),
  rest.get(`https://hosted.mender.io${useradmApiUrl}/auth/magic/:id`, ({ params: { id } }, res, ctx) => {
    if (id) {
      return res(ctx.text('test'), ctx.cookie('JWT', 'test'));
    }
    return res(ctx.status(400));
  }),
  rest.post(`${useradmApiUrl}/auth/logout`, (req, res, ctx) => res(ctx.status(200))),
  rest.post(`${useradmApiUrl}/auth/password-reset/:status`, ({ params: { status }, body: { email, secret_hash, password } }, res, ctx) => {
    if (!['start', 'complete'].includes(status) && ![email, secret_hash, password].some(item => item)) {
      return res(ctx.status(560));
    }
    if (status === 'start' && email) {
      return res(ctx.status(200));
    }
    if (status === 'complete' && secret_hash && password) {
      return res(ctx.status(200));
    }
    return res(ctx.status(561));
  }),
  rest.put(`${useradmApiUrl}/2faverify`, ({ body: { token2fa } }, res, ctx) => {
    if (!token2fa) {
      return res(ctx.status(562));
    }
    return res(ctx.status(200));
  }),
  rest.get(`${useradmApiUrl}/users`, (req, res, ctx) => res(ctx.status(200), ctx.json(Object.values(defaultState.users.byId)))),
  rest.get(`${useradmApiUrl}/users/me`, ({ headers }, res, ctx) => {
    const authHeader = headers.get('authorization');
    if (authHeader?.includes('limited')) {
      return res(ctx.status(403), ctx.json({ error: 'forbidden by role-based access control' }));
    }
    return res(ctx.status(200), ctx.json(defaultState.users.byId[defaultUserId]));
  }),
  rest.get(`${useradmApiUrl}/users/:userId`, ({ params: { userId } }, res, ctx) => {
    if (userId === 'me' || defaultState.users.byId[userId]) {
      const user = userId === 'me' ? defaultUserId : userId;
      return res(ctx.status(200), ctx.json(defaultState.users.byId[user]));
    }
    return res(ctx.status(563));
  }),
  rest.post(`${useradmApiUrl}/users`, ({ body: { email, password } }, res, ctx) => {
    if ([email, password].every(value => value)) {
      return res(ctx.status(200), ctx.json(defaultState.users.byId.a1));
    }
    return res(ctx.status(564));
  }),
  rest.put(`${useradmApiUrl}/users/:userId`, ({ params: { userId }, body: { email, password } }, res, ctx) => {
    if (defaultState.users.byId[userId] && [email, password].some(value => value)) {
      return res(ctx.status(200));
    }
    return res(ctx.status(565));
  }),
  rest.delete(`${useradmApiUrl}/users/:userId`, ({ params: { userId } }, res, ctx) => {
    if (defaultState.users.byId[userId]) {
      return res(ctx.status(200));
    }
    return res(ctx.status(566));
  }),
  rest.get(`${useradmApiUrl}/roles`, (req, res, ctx) => res(ctx.json(roles))),
  rest.post(`${useradmApiUrl}/roles`, ({ body: { name, permissions } }, res, ctx) => {
    if (
      [name, permissions].every(value => value) &&
      permissions.every(permission => permission.action && permission.object && permission.object.type && permission.object.value)
    ) {
      return res(ctx.status(200));
    }
    return res(ctx.status(567));
  }),
  rest.put(`${useradmApiUrl}/roles/:roleId`, ({ params: { roleId }, body: { description, name, permissions } }, res, ctx) => {
    if (defaultState.users.rolesById[roleId] && [description, name, permissions].some(value => value)) {
      return res(ctx.status(200));
    }
    return res(ctx.status(568));
  }),
  rest.delete(`${useradmApiUrl}/roles/:roleId`, ({ params: { roleId } }, res, ctx) => {
    if (defaultState.users.rolesById[roleId]) {
      return res(ctx.status(200));
    }
    return res(ctx.status(569));
  }),
  rest.get(`${useradmApiUrlv2}/roles`, (req, res, ctx) => res(ctx.json(roles))),
  rest.post(`${useradmApiUrlv2}/roles`, ({ body: { name, permission_sets_with_scope } }, res, ctx) => {
    if (
      !!name &&
      permission_sets_with_scope.every(permission => permission.name && permissionSets.find(permissionSet => permissionSet.name === permission.name))
    ) {
      return res(ctx.status(200));
    }
    return res(ctx.status(572));
  }),
  rest.put(`${useradmApiUrlv2}/roles/:roleId`, ({ params: { roleId }, body: { description, name, permission_sets_with_scope } }, res, ctx) => {
    if (defaultState.users.rolesById[roleId] && [description, name, permission_sets_with_scope].some(value => value)) {
      return res(ctx.status(200));
    }
    return res(ctx.status(573));
  }),
  rest.delete(`${useradmApiUrlv2}/roles/:roleId`, ({ params: { roleId } }, res, ctx) => {
    if (defaultState.users.rolesById[roleId]) {
      return res(ctx.status(200));
    }
    return res(ctx.status(574));
  }),
  rest.get(`${useradmApiUrl}/settings`, (req, res, ctx) => res(ctx.json(defaultState.users.globalSettings))),
  rest.post(`${useradmApiUrl}/settings`, (req, res, ctx) => res(ctx.status(200))),
  rest.get(`${useradmApiUrl}/settings/me`, (req, res, ctx) => res(ctx.json(defaultState.users.userSettings))),
  rest.post(`${useradmApiUrl}/settings/me`, (req, res, ctx) => res(ctx.status(200))),
  rest.get(`${useradmApiUrl}/settings/tokens`, (req, res, ctx) => res(ctx.json(accessTokens))),
  rest.post(`${useradmApiUrl}/settings/tokens`, (req, res, ctx) => res(ctx.status(200), ctx.json('aNewToken'))),
  rest.delete(`${useradmApiUrl}/settings/tokens/:tokenId`, ({ params: { tokenId } }, res, ctx) => {
    if (tokenId === 'some-id-1') {
      return res(ctx.status(200));
    }
    return res(ctx.status(577));
  }),
  rest.get(`${useradmApiUrl}/2faqr`, (req, res, ctx) => res(ctx.json({ qr: btoa('test') }))),
  rest.post(`${useradmApiUrl}/users/:userId/2fa/enable`, ({ params: { userId } }, res, ctx) => {
    if (defaultState.users.byId[userId] || userId === 'me') {
      return res(ctx.status(200));
    }
    return res(ctx.status(570));
  }),
  rest.post(`${useradmApiUrl}/users/:userId/2fa/disable`, ({ params: { userId } }, res, ctx) => {
    if (defaultState.users.byId[userId] || userId === 'me') {
      return res(ctx.status(200));
    }
    return res(ctx.status(571));
  }),
  rest.post(`${useradmApiUrl}/auth/verify-email/start`, (req, res, ctx) => res(ctx.status(200))),
  rest.post(`${useradmApiUrl}/auth/verify-email/complete`, ({ body: { secret_hash } }, res, ctx) => {
    if (secret_hash === 'superSecret') {
      return res(ctx.status(200));
    }
    return res(ctx.status(576));
  }),
  rest.get(`${useradmApiUrlv2}/permission_sets`, (req, res, ctx) => res(ctx.json(permissionSets)))
];
