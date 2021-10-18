import { rest } from 'msw';

import { defaultState } from '../mockData';
import { deviceAuthV2, deviceConfig, inventoryApiUrl, inventoryApiUrlV2 } from '../../src/js/actions/deviceActions';
import { headerNames } from '../../src/js/api/general-api';
import DeviceConstants from '../../src/js/constants/deviceConstants';

const deviceAuthDevice = {
  id: defaultState.devices.byId.a1.id,
  identity_data: { mac: 'dc:a6:32:12:ad:bf' },
  status: 'accepted',
  decommissioning: false,
  created_ts: '2019-01-01T06:25:00.000Z',
  updated_ts: '2019-01-01T09:25:00.000Z',
  auth_sets: [
    {
      id: 'auth1',
      identity_data: { mac: 'dc:a6:32:12:ad:bf' },
      pubkey: '-----BEGIN PUBLIC KEY-----\nMIIBojWELzgJ62hcXIhAfqfoNiaB1326XZByZwcnHr5BuSPAgMBAAE=\n-----END PUBLIC KEY-----\n',
      ts: '2019-01-01T06:25:00.000Z',
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
    { name: 'mac_eth0', value: 'dc:a6:32:12:ad:bf', scope: 'inventory' },
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
    { name: 'created_ts', value: '2019-01-01T06:25:00.000Z', scope: 'system' },
    { name: 'updated_ts', value: '2019-01-01T10:25:00.000Z', scope: 'system' },
    { name: 'status', value: 'accepted', scope: 'identity' },
    { name: 'mac', value: 'dc:a6:32:12:ad:bf', scope: 'identity' },
    { name: 'group', value: 'test', scope: 'system' }
  ],
  updated_ts: '2019-01-01T10:25:00.000Z'
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
  rest.get(`${inventoryApiUrlV2}/filters`, (req, res, ctx) =>
    res(
      ctx.json([
        {
          id: 'filter1',
          name: 'testGroupDynamic',
          terms: [{ scope: 'identity', attribute: 'id', type: '$in', value: ['a1'] }]
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
  rest.post(`${inventoryApiUrlV2}/filters/search`, ({ body: { page, per_page, filters } }, res, ctx) => {
    if ([page, per_page, filters].some(item => !item)) {
      return res(ctx.status(509));
    }
    const filter = filters.find(
      filter => filter.scope === 'identity' && filter.attribute === 'status' && Object.values(DeviceConstants.DEVICE_STATES).includes(filter.value)
    );
    const status = filter?.value || '';
    if (!status || filters.length > 1) {
      if (filters.find(filter => filter.attribute === 'group' && filter.value === Object.keys(defaultState.devices.groups.byId)[0])) {
        return res(ctx.set(headerNames.total, 2), ctx.json([inventoryDevice]));
      }
      return res(ctx.set(headerNames.total, 0), ctx.json([]));
    }
    let deviceList = Array.from({ length: defaultState.devices.byStatus[status].total }, (_, index) => ({
      ...inventoryDevice,
      attributes: [...inventoryDevice.attributes, { name: 'test-count', value: index, scope: 'system' }]
    }));
    deviceList = deviceList.slice((page - 1) * per_page, page * per_page);
    return res(ctx.set(headerNames.total, defaultState.devices.byStatus[status].total), ctx.json(deviceList));
  }),
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
          configured: { uiPasswordRequired: true, foo: 'bar', timezone: 'GMT+2' },
          reported: { uiPasswordRequired: true, foo: 'bar', timezone: 'GMT+2' },
          updated_ts: '2019-01-01T09:25:00.000Z',
          reported_ts: '2019-01-01T09:25:01.000Z'
        })
      );
    }
    return res(ctx.status(512));
  }),
  rest.put(`${deviceConfig}/:deviceId`, ({ params: { deviceId } }, res, ctx) => {
    if (defaultState.devices.byId[deviceId]) {
      return res(ctx.status(201));
    }
    return res(ctx.status(513));
  }),
  rest.post(`${deviceConfig}/:deviceId/deploy`, ({ params: { deviceId } }, res, ctx) => {
    if (defaultState.devices.byId[deviceId]) {
      return res(ctx.status(200), ctx.json({ deployment_id: defaultState.deployments.byId.d1.id }));
    }
    return res(ctx.status(514));
  })
];
