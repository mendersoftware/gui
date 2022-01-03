import { rest } from 'msw';

import { defaultState } from '../mockData';
import { PLANS } from '../../src/js/constants/appConstants';
import { iotManagerBaseURL } from '../../src/js/actions/deviceActions';
import { auditLogsApiUrl, tenantadmApiUrlv1, tenantadmApiUrlv2 } from '../../src/js/actions/organizationActions';
import { headerNames } from '../../src/js/api/general-api';
import { EXTERNAL_PROVIDER } from '../../src/js/constants/deviceConstants';

export const organizationHandlers = [
  rest.get(`${tenantadmApiUrlv1}/user/tenant`, (req, res, ctx) => res(ctx.json(defaultState.organization.organization))),
  rest.post(`${tenantadmApiUrlv2}/tenants/:tenantId/cancel`, (req, res, ctx) => res(ctx.status(200))),
  rest.post(`${tenantadmApiUrlv2}/tenants/trial`, ({ body: signup }, res, ctx) => {
    if (['email', 'organization', 'plan', 'tos'].every(item => !!signup[item])) {
      return res(ctx.text('test'));
    }
    return res(ctx.status(400));
  }),
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
  rest.get(`${auditLogsApiUrl}/logs`, (req, res, ctx) => {
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
  })
];
