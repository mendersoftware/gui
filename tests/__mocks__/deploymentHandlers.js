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

import { deploymentsApiUrl, deploymentsApiUrlV2 } from '../../src/js/actions/deploymentActions';
import { headerNames } from '../../src/js/api/general-api';
import { limitDefault } from '../../src/js/constants/deploymentConstants';
import { defaultState } from '../mockData';

const createdDeployment = {
  ...defaultState.deployments.byId.d1,
  id: 'created-123'
};

const defaultDeploymentConfig = {
  delta: {
    enabled: true,
    binary_delta: {
      xdelta_args: {
        disable_checksum: false,
        disable_external_decompression: false,
        compression_level: 6,
        source_window_size: 0,
        input_window_size: 0,
        compression_duplicates_window: 0,
        instruction_buffer_size: 0
      },
      timeout: 0
    },
    binary_delta_limits: {
      xdelta_args_limits: {
        source_window_size: limitDefault,
        input_window_size: limitDefault,
        compression_duplicates_window: limitDefault,
        instruction_buffer_size: limitDefault
      },
      timeout: { min: 60, max: 3600, default: 60 },
      jobs_in_parallel: limitDefault,
      queue_length: limitDefault
    }
  }
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
      const { device_types_compatible, ...remainder } = release;
      return Object.keys(remainder).length ? res(ctx.status(200), ctx.json([remainder])) : res(ctx.status(520));
    }
    const releases = Object.values(defaultState.releases.byId).map(stateRelease => {
      // eslint-disable-next-line no-unused-vars
      const { device_types_compatible, ...remainder } = stateRelease;
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
  rest.post(`${deploymentsApiUrl}/deployments/statistics/list`, ({ body: { deployment_ids = [] } }, res, ctx) => {
    if (deployment_ids.includes(createdDeployment.id)) {
      return res(ctx.json([]));
    } else if (deployment_ids.every(id => defaultState.deployments.byId[id])) {
      const stats = deployment_ids.map(id => ({ id, stats: defaultState.deployments.byId[id].statistics.status }));
      return res(ctx.json(stats));
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
  }),
  rest.get(`${deploymentsApiUrl}/config`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(defaultDeploymentConfig));
  }),
  rest.put(`${deploymentsApiUrl}/config/binary_delta`, (req, res, ctx) => res(ctx.status(200))),
  rest.get(`${deploymentsApiUrl}/deployments/devices/:deviceId`, ({ params: { deviceId } }, res, ctx) => {
    if (deviceId === defaultState.devices.byId.a1.id) {
      return res(
        ctx.set(headerNames.total, 34),
        ctx.json([
          {
            id: createdDeployment.id + 'something',
            deployment: { ...createdDeployment, id: defaultState.deployments.byId.d1.id, status: 'inprogress' },
            device: {
              created: '2019-01-01T12:35:00.000Z',
              finished: '2019-01-01T12:40:00.000Z',
              status: 'noartifact',
              id: 'something',
              image: { ...defaultState.releases.byId.r1 }
            },
            log: true,
            attempts: 1,
            delta_job_id: ''
          }
        ])
      );
    }
    return res(ctx.status(529));
  }),
  rest.delete(`${deploymentsApiUrl}/deployments/devices/:deviceId/history`, (req, res, ctx) => res(ctx.status(204)))
];
