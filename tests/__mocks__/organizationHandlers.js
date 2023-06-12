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

import { iotManagerBaseURL } from '../../src/js/actions/deviceActions';
import { auditLogsApiUrl, samlIdpApiUrlv1, tenantadmApiUrlv1, tenantadmApiUrlv2 } from '../../src/js/actions/organizationActions';
import { headerNames } from '../../src/js/api/general-api';
import { PLANS } from '../../src/js/constants/appConstants';
import { EXTERNAL_PROVIDER } from '../../src/js/constants/deviceConstants';
import { defaultState, webhookEvents } from '../mockData';

const releasesSample = {
  lts: ['3.3'],
  releases: {
    '3.2': {
      '3.2.1': {
        release_date: '2022-02-02',
        release: '3.2.1',
        repos: [
          { name: 'integration', version: '1.2.3' },
          { name: 'mender', version: '3.2.1' },
          { name: 'mender-artifact', version: '1.3.7' },
          { name: 'service', version: '3.0.0' },
          { name: 'other-service', version: '1.1.0' }
        ]
      },
      '3.2.0': {
        release_date: '2022-01-24',
        release: '3.2.0',
        repos: [
          { name: 'service', version: '3.0.0' },
          { name: 'another-service', version: '4.1.0' }
        ]
      }
    },
    '2.7': {
      '2.7.2': {
        release_date: '2021-11-04',
        release: '2.7.2',
        repos: [
          { name: 'service', version: '1.1.0' },
          { name: 'more-service', version: '1.0.2' }
        ]
      }
    },
    '1.0': {
      supported_until: '2018-02',
      '1.0.1': {
        release_date: '2017-04-03',
        release: '1.0.1',
        repos: [{ name: 'service', version: '1.0.1' }]
      },
      '1.0.0': {
        release_date: '2017-02-16',
        release: '1.0.0',
        repos: [{ name: 'mono-service', version: '1.0.0' }]
      }
    }
  },
  saas: [
    { tag: 'saas-v2022.03.10', date: '2022-03-09' },
    { tag: 'saas-v2020.09.25', date: '2020-09-24' },
    { tag: 'saas-v2020.07.09', date: '2020-07-09' }
  ]
};

const tagsSample = [{ name: 'saas-v2023.05.02', more: 'here' }];

const signupHandler = ({ body: signup }, res, ctx) => {
  if (['email', 'organization', 'plan', 'tos'].every(item => !!signup[item])) {
    return res(ctx.text('test'), ctx.cookie('JWT', 'test'));
  }
  return res(ctx.status(400));
};

export const organizationHandlers = [
  rest.get('/tags.json', (req, res, ctx) => res(ctx.json(tagsSample))),
  rest.get('/versions.json', (req, res, ctx) => res(ctx.json(releasesSample))),
  rest.get(`${tenantadmApiUrlv1}/user/tenant`, (req, res, ctx) => res(ctx.json(defaultState.organization.organization))),
  rest.post(`${tenantadmApiUrlv2}/tenants/:tenantId/cancel`, (req, res, ctx) => res(ctx.status(200))),
  rest.post(`${tenantadmApiUrlv2}/tenants/trial`, signupHandler),
  rest.post(`https://hosted.mender.io${tenantadmApiUrlv2}/tenants/trial`, signupHandler),
  rest.get(`${tenantadmApiUrlv2}/billing`, (req, res, ctx) => res(ctx.json({ card: { last4: '7890', exp_month: 1, exp_year: 2024, brand: 'testCorp' } }))),
  rest.post(`${tenantadmApiUrlv2}/billing/card`, (req, res, ctx) => res(ctx.json({ intent_id: defaultState.organization.intentId, secret: 'testSecret' }))),
  rest.post(`${tenantadmApiUrlv2}/billing/card/:intentId/confirm`, ({ params: { intentId } }, res, ctx) => {
    if (intentId == defaultState.organization.intentId) {
      return res(ctx.status(200));
    }
    return res(ctx.status(540));
  }),
  rest.post(`${tenantadmApiUrlv2}/tenants/:tenantId/upgrade/:status`, ({ params: { status, tenantId }, body: { plan } }, res, ctx) => {
    if (tenantId != defaultState.organization.organization.id || !['cancel', 'complete', 'start'].includes(status)) {
      return res(ctx.status(541));
    }
    if (status === 'start') {
      return res(ctx.json({ secret: 'testSecret' }));
    }
    if (plan && !Object.keys(PLANS).includes(plan)) {
      return res(ctx.status(542));
    }
    return res(ctx.status(200));
  }),
  rest.post(`${tenantadmApiUrlv2}/tenants/:tenantId/plan`, ({ params: { tenantId }, body }, res, ctx) => {
    const expectedKeys = ['current_plan', 'requested_plan', 'current_addons', 'requested_addons', 'user_message'];
    if (tenantId != defaultState.organization.organization.id || !Object.keys(body).every(key => expectedKeys.includes(key))) {
      return res(ctx.status(544));
    }
    if (body.requested_plan && !Object.values(PLANS).some(item => item.name === body.requested_plan)) {
      return res(ctx.status(545));
    }
    return res(ctx.status(200));
  }),
  rest.post(`${tenantadmApiUrlv2}/contact/support`, ({ body: { subject, body } }, res, ctx) => {
    if (!(subject && body)) {
      return res(ctx.status(543));
    }
    return res(ctx.status(200));
  }),
  rest.get(`${auditLogsApiUrl}/logs`, ({ url: { searchParams } }, res, ctx) => {
    const perPage = Number(searchParams.get('per_page'));
    if (perPage === 500) {
      return res(
        ctx.json([
          { meta: defaultState.organization.auditlog.events[2].meta, time: defaultState.organization.auditlog.events[1].time, action: 'close_terminal' }
        ])
      );
    }
    return res(ctx.set(headerNames.total, defaultState.organization.auditlog.events.length), ctx.json(defaultState.organization.auditlog.events));
  }),
  rest.get(`${auditLogsApiUrl}/logs/export`, (req, res, ctx) => {
    return res(
      ctx.text(`action,actor.id,actor.type,actor.email,actor.identity_data,object.id,object.type,object.user.email,object.deployment.name,object.deployment.artifact_name,change
    update,5c56c2ed-2a9a-5de9-bb86-cf38b3d4a5e1,user,test@example.coim,,067f23a9-76a5-5585-b119-32402a120978,user,test@example.com,,,"Update user 067f23a9-76a5-5585-b119-32402a120978 (test@example.com).
    Diff:
    --- Original
    +++ Current
    @@ -9 +9,2 @@
    -    ""RBAC_ROLE_OBSERVER""
    +    ""RBAC_ROLE_OBSERVER"",
    +    ""RBAC_ROLE_PERMIT_ALL""
    "
    `)
    );
  }),
  rest.get(`${iotManagerBaseURL}/integrations`, (req, res, ctx) => {
    return res(
      ctx.json([
        { connection_string: 'something_else', id: 1, provider: EXTERNAL_PROVIDER['iot-hub'].provider },
        { id: 2, provider: 'aws', something: 'new' }
      ])
    );
  }),
  rest.post(`${iotManagerBaseURL}/integrations`, (req, res, ctx) => {
    return res(ctx.json([{ connection_string: 'something_else', provider: EXTERNAL_PROVIDER['iot-hub'].provider }]));
  }),
  rest.put(`${iotManagerBaseURL}/integrations/:integrationId`, ({ params: { integrationId } }, res, ctx) => {
    if (!integrationId) {
      return res(ctx.status(547));
    }
    return res(ctx.status(200));
  }),
  rest.put(`${iotManagerBaseURL}/integrations/:integrationId/credentials`, ({ params: { integrationId } }, res, ctx) => {
    if (!integrationId) {
      return res(ctx.status(548));
    }
    return res(ctx.status(200));
  }),
  rest.delete(`${iotManagerBaseURL}/integrations/:integrationId`, ({ params: { integrationId } }, res, ctx) => {
    if (!integrationId) {
      return res(ctx.status(549));
    }
    return res(ctx.status(200));
  }),
  rest.get(`${iotManagerBaseURL}/events`, ({ url: { searchParams } }, res, ctx) => {
    const page = Number(searchParams.get('page'));
    const perPage = Number(searchParams.get('per_page'));
    return res(ctx.json(webhookEvents.slice(page - 1, page * perPage)));
  }),
  rest.get(samlIdpApiUrlv1, (req, res, ctx) => {
    return res(
      ctx.json([
        { id: '1', issuer: 'https://samltest.id/saml/idp', valid_until: '2038-08-24T21:14:09Z' },
        { id: '2', issuer: 'https://samltest2.id/saml/idp', valid_until: '2030-10-24T21:14:09Z' }
      ])
    );
  }),
  rest.post(samlIdpApiUrlv1, (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.get(`${samlIdpApiUrlv1}/:configId`, ({ params: { configId } }, res, ctx) => {
    if (!configId) {
      return res(ctx.status(550));
    }
    return res(ctx.json({ email: 'user@acme.com', password: 'mypass1234', login: { google: 'bob@gmail.com' } }));
  }),
  rest.put(`${samlIdpApiUrlv1}/:configId`, ({ params: { configId } }, res, ctx) => {
    if (!configId) {
      return res(ctx.status(551));
    }
    return res(ctx.status(200));
  }),
  rest.delete(`${samlIdpApiUrlv1}/:configId`, ({ params: { configId } }, res, ctx) => {
    if (!configId) {
      return res(ctx.status(552));
    }
    return res(ctx.status(200));
  })
];
