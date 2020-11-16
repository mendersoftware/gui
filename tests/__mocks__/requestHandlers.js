import { rest } from 'msw';

import { defaultState } from '../mockData';
import { deploymentsApiUrl, deploymentsApiUrlV2 } from '../../src/js/actions/deploymentActions';
import { headerNames } from '../../src/js/api/general-api';

const createdDeployment = {
  ...defaultState.deployments.byId.d1,
  id: 'created-123'
};

// http://localhost/api/management/v2/inventory/filters/search
export const deploymentHandlers = [
  rest.get(`${deploymentsApiUrl}/deployments`, (req, res, ctx) => {
    return res(ctx.set(headerNames.total, Object.keys(defaultState.deployments.byId).length), ctx.json(Object.values(defaultState.deployments.byId).reverse()));
  }),
  rest.get(`${deploymentsApiUrl}/deployments/:deploymentId`, ({ params: { deploymentId } }, res, ctx) => {
    if (deploymentId === createdDeployment.id) {
      return res(ctx.json(createdDeployment));
    }
    return res(ctx.json(deploymentId));
  }),
  rest.get(`${deploymentsApiUrl}/deployments/:deploymentId/devices`, ({ params: { deploymentId } }, res, ctx) => {
    if (deploymentId === createdDeployment.id) {
      return res(ctx.json(Object.values(createdDeployment.devices)));
    } else if (defaultState.deployments.byId[deploymentId]) {
      return res(ctx.json(Object.values(defaultState.deployments.byId[deploymentId].devices)));
    }
    return res(ctx.status(500));
  }),
  rest.get(`${deploymentsApiUrl}/deployments/:deploymentId/statistics`, ({ params: { deploymentId } }, res, ctx) => {
    if (deploymentId === createdDeployment.id) {
      return res(ctx.json({}));
    } else if (defaultState.deployments.byId[deploymentId]) {
      return res(ctx.json(defaultState.deployments.byId[deploymentId].stats));
    }
    return res(ctx.status(500));
  }),
  rest.get(`${deploymentsApiUrl}/deployments/:deploymentId/devices/:deviceId/log`, ({ params: { deploymentId, deviceId } }, res, ctx) => {
    if (defaultState.deployments.byId[deploymentId] && defaultState.deployments.byId[deploymentId].devices[deviceId]) {
      return res(ctx.text('test'));
    }
    return res(ctx.status(500));
  }),
  rest.post(`${deploymentsApiUrl}/deployments`, (req, res, ctx) => {
    if (!Object.keys(req.body).length) {
      return res(ctx.status(500), ctx.json({}));
    }
    return res(ctx.set('location', `find/me/here/${createdDeployment.id}`), ctx.json({}));
  }),
  rest.post(`${deploymentsApiUrlV2}/deployments`, ({ body: { filter_id, devices = [] } }, res, ctx) => {
    if (!filter_id || !!devices.length) {
      return res(ctx.status(500), ctx.json({}));
    }
    return res(ctx.set('location', `find/me/here/${createdDeployment.id}`), ctx.json({}));
  }),
  rest.post(`${deploymentsApiUrl}/deployments/group/:deploymentGroup`, ({ params: { deploymentGroup }, body: { filter_id, devices = [] } }, res, ctx) => {
    if (filter_id || !!devices.length || deploymentGroup !== Object.keys(defaultState.devices.groups.byId)[0]) {
      return res(ctx.status(500), ctx.json({}));
    }
    return res(ctx.set('location', `find/me/here/${createdDeployment.id}`), ctx.json({}));
  }),
  rest.put(`${deploymentsApiUrl}/deployments/:deploymentId/status`, ({ params: { deploymentId }, body: { status } }, res, ctx) =>
    res(ctx.status(status === 'aborted' && deploymentId === defaultState.deployments.byId.d1.id ? 200 : 500), ctx.json({}))
  )
];
