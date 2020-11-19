import { rest } from 'msw';

import { defaultState } from '../mockData';
import { auditLogsApiUrl, tenantadmApiUrlv1, tenantadmApiUrlv2 } from '../../src/js/actions/organizationActions';
import { PLANS } from '../../src/js/constants/appConstants';
import { headerNames } from '../../src/js/api/general-api';

export const organizationHandlers = [
  rest.get(`${tenantadmApiUrlv1}/user/tenant`, (req, res, ctx) => res(ctx.json(defaultState.organization.organization))),
  rest.post(`${tenantadmApiUrlv2}/tenants/:tenantId/cancel`, (req, res, ctx) => res(ctx.status(200))),
  rest.post(`${tenantadmApiUrlv2}/tenants/trial`, ({ body: signup }, res, ctx) => {
    if (['email', 'organization', 'plan', 'tos', 'marketing', 'g-recaptcha-response'].every(item => !!signup[item])) {
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
    return res(ctx.status(500));
  }),
  rest.post(`${tenantadmApiUrlv2}/tenants/:tenantId/upgrade/:status`, ({ params: { status, tenantId }, body: { plan } }, res, ctx) => {
    if (tenantId != defaultState.organization.organization.id || !['cancel', 'complete', 'start'].includes(status)) {
      return res(ctx.status(500));
    }
    if (status === 'start') {
      return res(ctx.json({ secret: 'testSecret' }));
    }
    if (plan && !Object.keys(PLANS).includes(plan)) {
      console.log('meh');
      return res(ctx.status(500));
    }
    return res(ctx.status(200));
  }),
  rest.get(`${auditLogsApiUrl}/logs`, (req, res, ctx) => {
    return res(ctx.set(headerNames.total, defaultState.organization.events.length), ctx.json(defaultState.organization.events));
  })
];
