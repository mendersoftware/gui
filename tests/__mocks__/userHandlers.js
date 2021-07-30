import { rest } from 'msw';

import { defaultState, token, userId as defaultUserId } from '../mockData';
import { useradmApiUrl } from '../../src/js/constants/userConstants';

export const roles = [
  { name: 'RBAC_ROLE_PERMIT_ALL', description: 'Full access', permissions: [{ action: 'any', object: { type: 'any', value: 'any' } }] },
  { name: 'RBAC_ROLE_CI', description: '', permissions: [] },
  { name: 'test', description: 'test description', permissions: [{ action: 'CREATE_DEPLOYMENT', object: { type: 'DEVICE_GROUP', value: 'testgroup' } }] },
  {
    name: 'RBAC_ROLE_OBSERVER',
    description:
      'Intended for team leaders or limited tech support accounts, this role can see all Devices, Artifacts and Deployment reports but not make any changes.',
    permissions: [
      { action: 'http', object: { type: 'GET', value: '^/api/management/(v[1-9]|0.1.0)/(devauth|inventory|deployments|useradm|tenantadm)/' } },
      { action: 'http', object: { type: 'POST', value: '^/api/management/v2/inventory/filters/search' } }
    ]
  }
];

export const userHandlers = [
  rest.post(`${useradmApiUrl}/auth/login`, (req, res, ctx) => res(ctx.status(200), ctx.json(token))),
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
  rest.get(`${useradmApiUrl}/users/me`, (req, res, ctx) => {
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
  rest.get(`${useradmApiUrl}/settings`, (req, res, ctx) => res(ctx.json(defaultState.users.globalSettings))),
  rest.post(`${useradmApiUrl}/settings`, (req, res, ctx) => res(ctx.status(200))),
  rest.get(`${useradmApiUrl}/2faqr`, (req, res, ctx) => res(ctx.json({ qr: btoa('test') }))),
  rest.post(`${useradmApiUrl}/users/:userId/2fa/enable`, ({ params: { userId } }, res, ctx) => {
    if (defaultState.users.byId[userId] || 'me') {
      return res(ctx.status(200));
    }
    return res(ctx.status(570));
  }),
  rest.post(`${useradmApiUrl}/users/:userId/2fa/disable`, ({ params: { userId } }, res, ctx) => {
    if (defaultState.users.byId[userId] || 'me') {
      return res(ctx.status(200));
    }
    return res(ctx.status(571));
  })
];
