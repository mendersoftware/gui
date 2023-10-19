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

import {
  deviceAuthV2,
  deviceConfig,
  deviceConnect,
  inventoryApiUrl,
  inventoryApiUrlV2,
  iotManagerBaseURL,
  reportingApiUrl
} from '../../src/js/actions/deviceActions';
import { headerNames } from '../../src/js/api/general-api';
import * as DeviceConstants from '../../src/js/constants/deviceConstants';
import { defaultCreationDate, defaultMacAddress, defaultState } from '../mockData';

const deviceAuthDevice = {
  id: defaultState.devices.byId.a1.id,
  identity_data: { mac: defaultMacAddress },
  status: 'accepted',
  decommissioning: false,
  created_ts: defaultCreationDate,
  updated_ts: '2019-01-01T09:25:00.000Z',
  auth_sets: [
    {
      id: 'auth1',
      identity_data: { mac: defaultMacAddress },
      pubkey: '-----BEGIN PUBLIC KEY-----\nMIIBojWELzgJ62hcXIhAfqfoNiaB1326XZByZwcnHr5BuSPAgMBAAE=\n-----END PUBLIC KEY-----\n',
      ts: defaultCreationDate,
      status: 'accepted'
    }
  ]
};

export const inventoryDevice = {
  id: defaultState.devices.byId.a1.id,
  attributes: [
    { name: 'network_interfaces', value: ['eth0', 'wlan0'], scope: 'inventory' },
    { name: 'kernel', value: 'Linux version 4.19.75-v7l+', scope: 'inventory' },
    { name: 'artifact_name', value: 'raspotifyInstaller', scope: 'inventory' },
    { name: 'ipv6_wlan0', value: 'fe80::68d9:8453:3e9c:7c80/64', scope: 'inventory' },
    { name: 'mac_eth0', value: defaultMacAddress, scope: 'inventory' },
    { name: 'rootfs_type', value: 'ext4', scope: 'inventory' },
    { name: 'mender_bootloader_integration', value: 'unknown', scope: 'inventory' },
    { name: 'cpu_model', value: 'ARMv7 Processor rev 3 (v7l)', scope: 'inventory' },
    { name: 'hostname', value: 'raspberrypi', scope: 'inventory' },
    { name: 'mender_client_version', value: '2.1.0', scope: 'inventory' },
    { name: 'ipv4_wlan0', value: '192.168.10.141/24', scope: 'inventory' },
    { name: 'device_type', value: 'raspberrypi4', scope: 'inventory' },
    { name: 'mem_total_kB', value: '1986024', scope: 'inventory' },
    { name: 'mac_wlan0', value: 'dc:a6:32:12:ad:c0', scope: 'inventory' },
    { name: 'os', value: 'Raspbian GNU/Linux 10 (buster)', scope: 'inventory' },
    { name: 'created_ts', value: defaultCreationDate, scope: 'system' },
    { name: 'updated_ts', value: defaultState.devices.byId.a1.updated_ts, scope: 'system' },
    { name: 'status', value: 'accepted', scope: 'identity' },
    { name: 'mac', value: defaultMacAddress, scope: 'identity' },
    { name: 'group', value: 'test', scope: 'system' }
  ],
  check_in_time: defaultState.devices.byId.a1.check_in_time,
  updated_ts: defaultState.devices.byId.a1.updated_ts
};

const deviceAttributes = [
  { name: 'status', scope: 'identity', count: 5 },
  { name: 'created_ts', scope: 'system', count: 5 },
  { name: 'updated_ts', scope: 'system', count: 5 },
  { name: 'mac', scope: 'identity', count: 1 },
  { name: 'artifact_name', scope: 'inventory', count: 1 },
  { name: 'cpu_model', scope: 'inventory', count: 1 },
  { name: 'device_type', scope: 'inventory', count: 1 },
  { name: 'hostname', scope: 'inventory', count: 1 },
  { name: 'ipv4_wlan0', scope: 'inventory', count: 1 },
  { name: 'ipv6_wlan0', scope: 'inventory', count: 1 },
  { name: 'kernel', scope: 'inventory', count: 1 },
  { name: 'mac_eth0', scope: 'inventory', count: 1 },
  { name: 'mac_wlan0', scope: 'inventory', count: 1 },
  { name: 'mem_total_kB', scope: 'inventory', count: 1 },
  { name: 'mender_bootloader_integration', scope: 'inventory', count: 1 },
  { name: 'mender_client_version', scope: 'inventory', count: 1 },
  { name: 'network_interfaces', scope: 'inventory', count: 1 },
  { name: 'os', scope: 'inventory', count: 1 },
  { name: 'rootfs_type', scope: 'inventory', count: 1 },
  { name: 'group', scope: 'system', count: 1 }
];

const searchHandler = ({ body: { page, per_page, filters } }, res, ctx) => {
  if ([page, per_page, filters].some(item => !item)) {
    return res(ctx.status(509));
  }
  const filter = filters.find(
    filter => filter.scope === 'identity' && filter.attribute === 'status' && Object.values(DeviceConstants.DEVICE_STATES).includes(filter.value)
  );
  const status = filter?.value || '';
  if (!status || filters.length > 1) {
    if (filters.find(filter => filter.attribute === 'group' && filter.value.includes(Object.keys(defaultState.devices.groups.byId)[0]))) {
      return res(ctx.set(headerNames.total, 2), ctx.json([inventoryDevice]));
    }
    if (filters.find(filter => filter.scope === 'monitor' && ['failed_last_update', 'alerts', 'auth_request'].includes(filter.attribute))) {
      return res(ctx.set(headerNames.total, 4), ctx.json([inventoryDevice]));
    }
    return res(ctx.set(headerNames.total, 0), ctx.json([]));
  }
  let deviceList = Array.from({ length: defaultState.devices.byStatus[status].total }, (_, index) => ({
    ...inventoryDevice,
    attributes: [...inventoryDevice.attributes, { name: 'test-count', value: index, scope: 'system' }]
  }));
  deviceList = deviceList.slice((page - 1) * per_page, page * per_page);
  return res(ctx.set(headerNames.total, defaultState.devices.byStatus[status].total), ctx.json(deviceList));
};

export const deviceHandlers = [
  rest.delete(`${deviceAuthV2}/devices/:deviceId/auth/:authId`, ({ params: { authId, deviceId } }, res, ctx) => {
    if (defaultState.devices.byId[deviceId].auth_sets.find(authSet => authSet.id === authId)) {
      return res(ctx.status(200));
    }
    return res(ctx.status(501));
  }),
  rest.delete(`${deviceAuthV2}/devices/:deviceId`, ({ params: { deviceId } }, res, ctx) => {
    if (defaultState.devices.byId[deviceId]) {
      return res(ctx.status(200));
    }
    return res(ctx.status(502));
  }),
  rest.delete(`${inventoryApiUrl}/groups/:group`, ({ params: { group } }, res, ctx) => {
    if (defaultState.devices.groups.byId[group]) {
      return res(ctx.status(200));
    }
    return res(ctx.status(515));
  }),
  rest.delete(`${inventoryApiUrl}/groups/:group/devices`, ({ params: { group }, body: deviceIds }, res, ctx) => {
    if (defaultState.devices.groups.byId[group] && deviceIds.every(id => !!defaultState.devices.byId[id])) {
      return res(ctx.status(200));
    }
    return res(ctx.status(503));
  }),
  rest.delete(`${inventoryApiUrlV2}/filters/:filterId`, ({ params: { filterId } }, res, ctx) => {
    if (Object.values(defaultState.devices.groups.byId).find(group => group.id === filterId)) {
      return res(ctx.status(200));
    }
    return res(ctx.status(504));
  }),
  rest.get(`${deviceAuthV2}/devices`, (req, res, ctx) => {
    const deviceIds = req.url.searchParams.getAll('id');
    if (deviceIds.every(id => !!defaultState.devices.byId[id])) {
      return res(ctx.json(deviceIds.map(id => ({ ...deviceAuthDevice, id }))));
    }
    return res(ctx.status(505));
  }),
  rest.get(`${deviceAuthV2}/limits/max_devices`, (req, res, ctx) => res(ctx.json({ limit: defaultState.devices.limit }))),
  rest.get(`${inventoryApiUrl}/devices/:deviceId`, ({ params: { deviceId } }, res, ctx) => {
    if (defaultState.devices.byId[deviceId]) {
      return res(ctx.json(inventoryDevice));
    }
    return res(ctx.status(506));
  }),
  rest.put(`${inventoryApiUrl}/devices/:deviceId/tags`, ({ params: { deviceId }, body: tags }, res, ctx) => {
    if (!defaultState.devices.byId[deviceId] && !Array.isArray(tags) && !tags.every(item => item.name && item.value)) {
      return res(ctx.status(506));
    }
    return res(ctx.json(tags));
  }),
  rest.get(`${inventoryApiUrl}/groups`, (req, res, ctx) => {
    const groups = Object.entries(defaultState.devices.groups.byId).reduce((accu, [groupName, group]) => {
      if (!group.id) {
        accu.push(groupName);
      }
      return accu;
    }, []);
    return res(ctx.json(groups));
  }),
  rest.get(`${inventoryApiUrlV2}/filters/attributes`, (req, res, ctx) => res(ctx.json(deviceAttributes))),
  rest.get(`${reportingApiUrl}/devices/attributes`, (req, res, ctx) =>
    res(ctx.json({ attributes: deviceAttributes, count: deviceAttributes.length, limit: 100 }))
  ),
  rest.get(`${reportingApiUrl}/devices/search/attributes`, (req, res, ctx) => res(ctx.json(deviceAttributes))),
  rest.post(`${reportingApiUrl}/devices/aggregate`, (req, res, ctx) =>
    res(
      ctx.json([
        {
          name: '*',
          items: [
            { key: 'test', count: 6 },
            { key: 'original', count: 1 }
          ],
          other_count: 42
        }
      ])
    )
  ),
  rest.get(`${inventoryApiUrlV2}/filters`, (req, res, ctx) =>
    res(
      ctx.json([
        {
          id: 'filter1',
          name: 'testGroupDynamic',
          terms: [
            { scope: 'identity', attribute: 'id', type: '$in', value: ['a1'] },
            { scope: 'identity', attribute: 'mac', type: '$exists', value: false },
            { scope: 'identity', attribute: 'kernel', type: '$exists', value: true }
          ]
        }
      ])
    )
  ),
  rest.patch(`${inventoryApiUrl}/groups/:group/devices`, ({ params: { group }, body: deviceIds }, res, ctx) => {
    if (!!group && deviceIds.every(id => !!defaultState.devices.byId[id])) {
      return res(ctx.status(200));
    }
    return res(ctx.status(508));
  }),
  rest.post(`${deviceAuthV2}/devices`, ({ body: authset }, res, ctx) => {
    if (
      Object.values(defaultState.devices.byId).some(device =>
        device.auth_sets.some(deviceAuthSet => deviceAuthSet.pubkey == authset.pubkey || deviceAuthSet.identity_data == authset.identity_data)
      )
    ) {
      return res(ctx.status(409));
    }
    return res(ctx.status(200));
  }),
  rest.post(`${inventoryApiUrlV2}/filters/search`, searchHandler),
  rest.post(`${reportingApiUrl}/filters/search`, searchHandler),
  rest.post(`${inventoryApiUrlV2}/filters`, ({ body: { name, terms } }, res, ctx) => {
    if (
      [name, terms].some(item => !item) ||
      defaultState.devices.groups[name] ||
      !terms.every(
        term =>
          DeviceConstants.DEVICE_FILTERING_OPTIONS[term.type] && ['identity', 'inventory', 'system'].includes(term.scope) && !!term.value && !!term.attribute
      )
    ) {
      return res(ctx.status(510));
    }
    return res(ctx.set('location', 'find/me/here/createdFilterId'), ctx.json({}));
  }),
  rest.put(`${deviceAuthV2}/devices/:deviceId/auth/:authId/status`, ({ params: { authId, deviceId }, body: { status } }, res, ctx) => {
    if (defaultState.devices.byId[deviceId].auth_sets.find(authSet => authSet.id === authId) && DeviceConstants.DEVICE_STATES[status]) {
      return res(ctx.status(200));
    }
    return res(ctx.status(511));
  }),
  rest.get(`${deviceConfig}/:deviceId`, ({ params: { deviceId } }, res, ctx) => {
    if (deviceId === 'testId') {
      return res(ctx.status(404), ctx.json({ error: { status_code: 404 } }));
    }
    if (defaultState.devices.byId[deviceId]) {
      return res(
        ctx.json({
          configured: { test: true, something: 'else', aNumber: 42 },
          deployment_id: 'config1',
          reported: { test: true, something: 'else', aNumber: 42 },
          updated_ts: defaultState.devices.byId.a1.updated_ts,
          reported_ts: '2019-01-01T09:25:01.000Z'
        })
      );
    }
    return res(ctx.status(512));
  }),
  rest.put(`${deviceConfig}/:deviceId`, ({ params: { deviceId }, body }, res, ctx) => {
    if (JSON.stringify(body).includes('evilValue')) {
      return res(ctx.status(418));
    }
    if (defaultState.devices.byId[deviceId]) {
      return res(ctx.status(201));
    }
    return res(ctx.status(513));
  }),
  rest.post(`${deviceConfig}/:deviceId/deploy`, ({ params: { deviceId } }, res, ctx) => {
    if (defaultState.devices.byId[deviceId]) {
      return res(ctx.status(200), ctx.json({ deployment_id: 'config1' }));
    }
    return res(ctx.status(514));
  }),
  rest.get(`${deviceConnect}/devices/:deviceId`, ({ params: { deviceId } }, res, ctx) => {
    if (deviceId === 'testId') {
      return res(ctx.status(404), ctx.json({ error: { status_code: 404 } }));
    }
    if (defaultState.devices.byId[deviceId]) {
      return res(
        ctx.json({
          status: 'connected',
          updated_ts: defaultState.devices.byId[deviceId].updated_ts
        })
      );
    }
    return res(ctx.status(512));
  }),
  rest.get(`${iotManagerBaseURL}/devices/:deviceId/state`, ({ params: { deviceId } }, res, ctx) => {
    if (defaultState.devices.byId[deviceId]) {
      return res(ctx.status(200), ctx.json({ deployment_id: defaultState.deployments.byId.d1.id }));
    }
    return res(ctx.status(515));
  }),
  rest.put(`${iotManagerBaseURL}/devices/:deviceId/state/:integrationId`, ({ params: { deviceId }, body }, res, ctx) => {
    if (defaultState.devices.byId[deviceId] && body) {
      return res(ctx.status(200), ctx.json({ deployment_id: defaultState.deployments.byId.d1.id }));
    }
    return res(ctx.status(516));
  }),
  rest.put(`${deviceConnect}/devices/:deviceId/upload`, ({ params: { deviceId } }, res, ctx) => {
    if (defaultState.devices.byId[deviceId]) {
      return res(ctx.status(200));
    }
    return res(ctx.status(517));
  }),
  rest.get(`${deviceAuthV2}/reports/devices`, (req, res, ctx) => res(ctx.text('test,report')))
];
