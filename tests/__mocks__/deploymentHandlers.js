import { rest } from 'msw';

import { defaultState } from '../mockData';
import { deploymentsApiUrl, deploymentsApiUrlV2 } from '../../src/js/actions/deploymentActions';
import { headerNames } from '../../src/js/api/general-api';

const createdDeployment = {
  ...defaultState.deployments.byId.d1,
  id: 'created-123'
};

export const deploymentHandlers = [
  rest.get(`${deploymentsApiUrl}/deployments`, (req, res, ctx) => {
    return res(ctx.set(headerNames.total, Object.keys(defaultState.deployments.byId).length), ctx.json(Object.values(defaultState.deployments.byId).reverse()));
  }),
  rest.get(`${deploymentsApiUrl}/deployments/releases`, (req, res, ctx) => {
    const releaseName = req.url.searchParams.get('name');
    const release = defaultState.releases.byId[releaseName] || {};
    if (releaseName) {
      // eslint-disable-next-line no-unused-vars
      const { descriptions, device_types_compatible, ...remainder } = release;
      return Object.keys(remainder).length ? res(ctx.status(200), ctx.json([remainder])) : res(ctx.status(520));
    }
    const releases = Object.values(defaultState.releases.byId).map(stateRelease => {
      // eslint-disable-next-line no-unused-vars
      const { descriptions, device_types_compatible, ...remainder } = stateRelease;
      return remainder;
    });
    return res(ctx.json(releases));
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
    return res(ctx.status(521));
  }),
  rest.get(`${deploymentsApiUrl}/deployments/:deploymentId/statistics`, ({ params: { deploymentId } }, res, ctx) => {
    if (deploymentId === createdDeployment.id) {
      return res(ctx.json({}));
    } else if (defaultState.deployments.byId[deploymentId]) {
      return res(ctx.json(defaultState.deployments.byId[deploymentId].stats));
    }
    return res(ctx.status(522));
  }),
  rest.get(`${deploymentsApiUrl}/deployments/:deploymentId/devices/:deviceId/log`, ({ params: { deploymentId, deviceId } }, res, ctx) => {
    if (defaultState.deployments.byId[deploymentId] && defaultState.deployments.byId[deploymentId].devices[deviceId]) {
      return res(ctx.text('test'));
    }
    return res(ctx.status(523));
  }),
  rest.post(`${deploymentsApiUrl}/deployments`, (req, res, ctx) => {
    if (!Object.keys(req.body).length) {
      return res(ctx.status(524), ctx.json({}));
    }
    return res(ctx.set('location', `find/me/here/${createdDeployment.id}`), ctx.json({}));
  }),
  rest.post(`${deploymentsApiUrlV2}/deployments`, ({ body: { filter_id, devices = [] } }, res, ctx) => {
    if (!filter_id || !!devices.length) {
      return res(ctx.status(525), ctx.json({}));
    }
    return res(ctx.set('location', `find/me/here/${createdDeployment.id}`), ctx.json({}));
  }),
  rest.post(`${deploymentsApiUrl}/deployments/group/:deploymentGroup`, ({ params: { deploymentGroup }, body: { filter_id, devices = [] } }, res, ctx) => {
    if (filter_id || !!devices.length || deploymentGroup !== Object.keys(defaultState.devices.groups.byId)[0]) {
      return res(ctx.status(526), ctx.json({}));
    }
    return res(ctx.set('location', `find/me/here/${createdDeployment.id}`), ctx.json({}));
  }),
  rest.patch(`${deploymentsApiUrl}/deployments/:deploymentId`, ({ params: { deploymentId }, body: { update_control_map } }, res, ctx) => {
    if (deploymentId === createdDeployment.id && Object.keys(update_control_map).length) {
      return res(ctx.status(204));
    }
    return res(ctx.status(581));
  }),
  rest.put(`${deploymentsApiUrl}/deployments/:deploymentId/status`, ({ params: { deploymentId }, body: { status } }, res, ctx) =>
    res(
      ctx.status(
        status === 'aborted' &&
          [...defaultState.deployments.byStatus.pending.deploymentIds, ...defaultState.deployments.byStatus.inprogress.deploymentIds].includes(deploymentId)
          ? 200
          : 528
      ),
      ctx.json({})
    )
  ),
  rest.get(`${deploymentsApiUrl}/deployments/:deploymentId/devices/list`, ({ params: { deploymentId } }, res, ctx) => {
    if (deploymentId === createdDeployment.id) {
      return res(ctx.set(headerNames.total, Object.keys(createdDeployment.devices).length), ctx.json(Object.values(createdDeployment.devices)));
    } else if (defaultState.deployments.byId[deploymentId]) {
      return res(
        ctx.set(headerNames.total, Object.keys(defaultState.deployments.byId[deploymentId].devices).length),
        ctx.json(Object.values(defaultState.deployments.byId[deploymentId].devices))
      );
    }
    return res(ctx.status(529));
  })
];
