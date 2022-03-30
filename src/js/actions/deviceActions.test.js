import React from 'react';
import { Link } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { defaultState } from '../../../tests/mockData';
import AppConstants from '../constants/appConstants';
import DeploymentConstants from '../constants/deploymentConstants';
import DeviceConstants from '../constants/deviceConstants';
import {
  addDevicesToGroup,
  addDynamicGroup,
  addStaticGroup,
  applyDeviceConfig,
  decommissionDevice,
  deleteAuthset,
  getAllDeviceCounts,
  getAllDevicesByStatus,
  getAllDynamicGroupDevices,
  getAllGroupDevices,
  getDeviceAttributes,
  getDeviceAuth,
  getDeviceById,
  getDeviceConfig,
  getDeviceCount,
  getDeviceInfo,
  getDeviceLimit,
  getDevicesByStatus,
  getDevicesWithAuth,
  getDeviceTwin,
  getDynamicGroups,
  getGroupDevices,
  getGroups,
  getSessionDetails,
  preauthDevice,
  removeDevicesFromGroup,
  removeDynamicGroup,
  removeStaticGroup,
  selectDevice,
  selectGroup,
  setDeviceConfig,
  setDeviceFilters,
  setDeviceListState,
  setDeviceTags,
  setDeviceTwin,
  updateDeviceAuth,
  updateDevicesAuth,
  updateDynamicGroup
} from './deviceActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const groupUpdateSuccessMessage = 'The group was updated successfully';
const getGroupSuccessNotification = groupName => (
  <>
    {groupUpdateSuccessMessage} - <Link to={`/devices?group=${groupName}`}>click here</Link> to see it.
  </>
);

/* eslint-disable sonarjs/no-identical-functions */
describe('selecting things', () => {
  it('should allow device list selections', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(setDeviceListState({ deviceIds: ['a1'] }));
    const expectedActions = [{ type: DeviceConstants.SET_DEVICE_LIST_STATE, state: { deviceIds: ['a1'] } }];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow single device selections', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(selectDevice('a1', DeviceConstants.DEVICE_STATES.accepted));
    const expectedActions = [
      { type: DeviceConstants.RECEIVE_DEVICE, device: {} },
      {
        type: DeviceConstants.RECEIVE_DEVICES,
        devicesById: {
          a1: {
            id: 'a1',
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
          }
        }
      },
      { type: DeviceConstants.SELECT_DEVICE, deviceId: 'a1' }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    const receivedAttributes = storeActions.find(item => item.type === DeviceConstants.RECEIVE_DEVICE).device.attributes;
    expect(receivedAttributes).toBeTruthy();
    expect(Object.entries(receivedAttributes).length).toBeTruthy();
    Object.entries(receivedAttributes).forEach(([key, value]) => {
      expect(key).toBeTruthy();
      expect(value).toBeTruthy();
    });
  });
  it('should allow static group selection', async () => {
    const store = mockStore({ ...defaultState });
    const groupName = 'testGroup';
    await store.dispatch(selectGroup(groupName));
    // eslint-disable-next-line no-unused-vars
    const { attributes, updated_ts, ...expectedDevice } = defaultState.devices.byId.a1;
    const expectedActions = [
      { type: DeviceConstants.SELECT_GROUP, group: groupName },
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: { [defaultState.devices.byId.a1.id]: { ...expectedDevice, attributes } } },
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: { [defaultState.devices.byId.a1.id]: { ...expectedDevice } } },
      {
        type: DeviceConstants.RECEIVE_GROUP_DEVICES,
        group: { filters: [], deviceIds: [defaultState.devices.byId.a1.id, defaultState.devices.byId.b1.id], total: 2 },
        groupName
      }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow dynamic group selection', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(selectGroup('testGroupDynamic'));
    const expectedActions = [
      { type: DeviceConstants.SET_DEVICE_FILTERS, filters: [{ scope: 'system', key: 'group', operator: '$eq', value: 'things' }] },
      { type: DeviceConstants.SELECT_GROUP, group: 'testGroupDynamic' }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow dynamic group selection with extra filters', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(
      selectGroup('testGroupDynamic', [
        ...defaultState.devices.groups.byId.testGroupDynamic.filters,
        { scope: 'system', key: 'group2', operator: '$eq', value: 'things2' }
      ])
    );
    const expectedActions = [
      {
        type: DeviceConstants.SET_DEVICE_FILTERS,
        filters: [
          { scope: 'system', key: 'group', operator: '$eq', value: 'things' },
          { scope: 'system', key: 'group2', operator: '$eq', value: 'things2' }
        ]
      },
      { type: DeviceConstants.SELECT_GROUP, group: 'testGroupDynamic' }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow setting filters independently', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(setDeviceFilters([{ scope: 'system', key: 'group2', operator: '$eq', value: 'things2' }]));
    const expectedActions = [{ type: DeviceConstants.SET_DEVICE_FILTERS, filters: [{ scope: 'system', key: 'group2', operator: '$eq', value: 'things2' }] }];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
});

describe('overall device information retrieval', () => {
  it('should allow count retrieval', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      ...Object.values(DeviceConstants.DEVICE_STATES).map(status => ({
        type: DeviceConstants[`SET_${status.toUpperCase()}_DEVICES_COUNT`],
        count: defaultState.devices.byStatus[status].total,
        status
      }))
    ];
    await Promise.all(Object.values(DeviceConstants.DEVICE_STATES).map(status => store.dispatch(getDeviceCount(status)))).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should allow count retrieval for all state counts', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      ...[DeviceConstants.DEVICE_STATES.accepted, DeviceConstants.DEVICE_STATES.pending].map(status => ({
        type: DeviceConstants[`SET_${status.toUpperCase()}_DEVICES_COUNT`],
        count: defaultState.devices.byStatus[status].total,
        status
      }))
    ];
    await store.dispatch(getAllDeviceCounts());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });

  it('should allow limit retrieval', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [{ type: DeviceConstants.SET_DEVICE_LIMIT, limit: defaultState.devices.limit }];
    await store.dispatch(getDeviceLimit());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow attribute retrieval and group results', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [{ type: DeviceConstants.SET_FILTER_ATTRIBUTES, attributes: {} }];
    await store.dispatch(getDeviceAttributes());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    const receivedAttributes = storeActions.find(item => item.type === DeviceConstants.SET_FILTER_ATTRIBUTES).attributes;
    expect(Object.keys(receivedAttributes)).toHaveLength(3);
    Object.entries(receivedAttributes).forEach(([key, value]) => {
      expect(key).toBeTruthy();
      expect(value).toBeTruthy();
    });
  });
});

describe('device auth handling', () => {
  const deviceUpdateSuccessMessage = 'Device authorization status was updated successfully';
  it('should allow device auth information retrieval', async () => {
    const store = mockStore({ ...defaultState });
    // eslint-disable-next-line no-unused-vars
    const { attributes, ...expectedDevice } = defaultState.devices.byId.a1;
    const expectedActions = [{ type: DeviceConstants.RECEIVE_DEVICES, devicesById: { [expectedDevice.id]: expectedDevice } }];
    await store.dispatch(getDeviceAuth(defaultState.devices.byId.a1.id));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should return device auth device as a promise result', async () => {
    const store = mockStore({ ...defaultState });
    const device = await store.dispatch(getDeviceAuth(defaultState.devices.byId.a1.id));
    expect(device).toBeDefined();
  });
  it('should allow single device auth updates', async () => {
    const store = mockStore({ ...defaultState });
    // eslint-disable-next-line no-unused-vars
    const { attributes, ...expectedDevice } = defaultState.devices.byId.a1;
    const expectedActions = [
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: deviceUpdateSuccessMessage } },
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: { [expectedDevice.id]: expectedDevice } },
      {
        type: DeviceConstants.SET_ACCEPTED_DEVICES,
        deviceIds: defaultState.devices.byStatus.accepted.deviceIds.filter(id => id !== defaultState.devices.byId.a1.id),
        status: DeviceConstants.DEVICE_STATES.accepted,
        total: defaultState.devices.byStatus.accepted.deviceIds.filter(id => id !== defaultState.devices.byId.a1.id).length
      }
    ];
    await store.dispatch(
      updateDeviceAuth(defaultState.devices.byId.a1.id, defaultState.devices.byId.a1.auth_sets[0].id, DeviceConstants.DEVICE_STATES.pending)
    );
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow multiple device auth updates', async () => {
    const store = mockStore({ ...defaultState });
    // eslint-disable-next-line no-unused-vars
    const { attributes, ...expectedDevice } = defaultState.devices.byId.a1;
    const expectedActions = [
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: deviceUpdateSuccessMessage } },
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: { [expectedDevice.id]: expectedDevice } },
      {
        type: DeviceConstants.SET_ACCEPTED_DEVICES,
        deviceIds: [defaultState.devices.byId.b1.id],
        status: DeviceConstants.DEVICE_STATES.accepted,
        total: defaultState.devices.byStatus.accepted.deviceIds.filter(id => id !== defaultState.devices.byId.a1.id).length
      },
      {
        type: AppConstants.SET_SNACKBAR,
        snackbar: {
          message:
            '1 device was updated successfully. 1 device has more than one pending authset. Expand this device to individually adjust its authorization status. '
        }
      }
    ];
    await store.dispatch(updateDevicesAuth([defaultState.devices.byId.a1.id, defaultState.devices.byId.c1.id], DeviceConstants.DEVICE_STATES.pending));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow preauthorizing devices', async () => {
    const store = mockStore({ ...defaultState });
    // eslint-disable-next-line no-unused-vars
    const expectedActions = [{ type: AppConstants.SET_SNACKBAR, snackbar: { message: 'Device was successfully added to the preauthorization list' } }];
    await store.dispatch(
      preauthDevice({
        ...defaultState.devices.byId.a1.auth_sets[0],
        identity_data: { ...defaultState.devices.byId.a1.auth_sets[0].identity_data, mac: '12:34:56' },
        pubkey: 'test'
      })
    );
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should notify about duplicate device preauthorization attempts', async () => {
    const store = mockStore({ ...defaultState });
    await store
      .dispatch(preauthDevice(defaultState.devices.byId.a1.auth_sets[0]))
      .catch(message => expect(message).toContain('identity data set already exists'));
  });
  it('should allow single device auth set deletion', async () => {
    const store = mockStore({ ...defaultState });
    // eslint-disable-next-line no-unused-vars
    const { attributes, ...expectedDevice } = defaultState.devices.byId.a1;
    const expectedActions = [
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: deviceUpdateSuccessMessage } },
      {
        type: DeviceConstants.SET_ACCEPTED_DEVICES,
        deviceIds: defaultState.devices.byStatus.accepted.deviceIds.filter(id => id !== defaultState.devices.byId.a1.id),
        status: DeviceConstants.DEVICE_STATES.accepted,
        total: defaultState.devices.byStatus.accepted.deviceIds.filter(id => id !== defaultState.devices.byId.a1.id).length
      }
    ];
    await store.dispatch(deleteAuthset(defaultState.devices.byId.a1.id, defaultState.devices.byId.a1.auth_sets[0].id));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow single device decomissioning', async () => {
    const store = mockStore({ ...defaultState });
    // eslint-disable-next-line no-unused-vars
    const { attributes, ...expectedDevice } = defaultState.devices.byId.a1;
    const expectedActions = [
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'Device was decommissioned successfully' } },
      {
        type: DeviceConstants.SET_ACCEPTED_DEVICES,
        deviceIds: defaultState.devices.byStatus.accepted.deviceIds.filter(id => id !== defaultState.devices.byId.a1.id),
        status: DeviceConstants.DEVICE_STATES.accepted,
        total: defaultState.devices.byStatus.accepted.deviceIds.filter(id => id !== defaultState.devices.byId.a1.id).length
      }
    ];
    await store.dispatch(decommissionDevice(defaultState.devices.byId.a1.id));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
});

describe('static grouping related actions', () => {
  it('should allow retrieving static groups', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      { type: DeviceConstants.RECEIVE_GROUPS, groups: { testGroup: defaultState.devices.groups.byId.testGroup } },
      {
        type: DeviceConstants.ADD_DYNAMIC_GROUP,
        groupName: DeviceConstants.UNGROUPED_GROUP.id,
        group: { deviceIds: [], total: 0, filters: [{ key: 'group', operator: '$nin', scope: 'system', value: ['testGroup'] }] }
      }
    ];
    await store.dispatch(getGroups());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow creating static groups', async () => {
    const store = mockStore({ ...defaultState });
    const groupName = 'createdTestGroup';
    const expectedActions = [
      { type: DeviceConstants.ADD_TO_GROUP, group: groupName, deviceIds: [defaultState.devices.byId.a1.id] },
      { type: DeviceConstants.ADD_STATIC_GROUP, group: { deviceIds: [], total: 0, filters: [] }, groupName },
      { type: DeviceConstants.SELECT_DEVICE, deviceId: undefined },
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: getGroupSuccessNotification(groupName) } },
      { type: DeviceConstants.RECEIVE_GROUPS, groups: { testGroup: defaultState.devices.groups.byId.testGroup } },
      {
        type: DeviceConstants.ADD_DYNAMIC_GROUP,
        groupName: DeviceConstants.UNGROUPED_GROUP.id,
        group: { deviceIds: [], total: 0, filters: [{ key: 'group', operator: '$nin', scope: 'system', value: ['testGroup'] }] }
      }
    ];
    await store.dispatch(addStaticGroup(groupName, [defaultState.devices.byId.a1.id]));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow extending static groups', async () => {
    const store = mockStore({ ...defaultState });
    const groupName = 'createdTestGroup';
    const expectedActions = [{ type: DeviceConstants.ADD_TO_GROUP, group: groupName, deviceIds: [defaultState.devices.byId.b1.id] }];
    await store.dispatch(addDevicesToGroup(groupName, [defaultState.devices.byId.b1.id]));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow shrinking static groups', async () => {
    const store = mockStore({ ...defaultState });
    const groupName = 'testGroup';
    const expectedActions = [
      { type: DeviceConstants.REMOVE_FROM_GROUP, group: groupName, deviceIds: [defaultState.devices.byId.b1.id] },
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'The device was removed from the group' } }
    ];
    await store.dispatch(removeDevicesFromGroup(groupName, [defaultState.devices.byId.b1.id]));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow removing static groups', async () => {
    const store = mockStore({ ...defaultState });
    const groupName = 'testGroup';
    const expectedActions = [
      { type: DeviceConstants.REMOVE_STATIC_GROUP, groups: {} },
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'Group was removed successfully' } },
      { type: DeviceConstants.RECEIVE_GROUPS, groups: { testGroup: defaultState.devices.groups.byId.testGroup } },
      {
        type: DeviceConstants.ADD_DYNAMIC_GROUP,
        groupName: DeviceConstants.UNGROUPED_GROUP.id,
        group: { deviceIds: [], total: 0, filters: [{ key: 'group', operator: '$nin', scope: 'system', value: ['testGroup'] }] }
      }
    ];
    await store.dispatch(removeStaticGroup(groupName));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    const remainingGroups = storeActions.find(item => item.type === DeviceConstants.REMOVE_STATIC_GROUP).groups;
    expect(Object.keys(remainingGroups).length).toBeLessThan(Object.keys(defaultState.devices.groups.byId).length);
    expect(Object.keys(remainingGroups).some(key => key === groupName)).toBeFalsy();
  });
  it('should allow device retrieval for static groups', async () => {
    const store = mockStore({ ...defaultState });
    const groupName = 'testGroup';
    // eslint-disable-next-line no-unused-vars
    const { attributes, updated_ts, ...expectedDevice } = defaultState.devices.byId.a1;
    const expectedActions = [
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: { [defaultState.devices.byId.a1.id]: { ...expectedDevice, attributes } } },
      {
        type: DeviceConstants.SET_ACCEPTED_DEVICES,
        deviceIds: [defaultState.devices.byId.a1.id],
        status: DeviceConstants.DEVICE_STATES.accepted,
        total: null
      },
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: { [expectedDevice.id]: { ...expectedDevice, updated_ts } } },
      {
        type: DeviceConstants.RECEIVE_GROUP_DEVICES,
        group: { filters: [], deviceIds: defaultState.devices.groups.byId[groupName].deviceIds, total: defaultState.devices.groups.byId[groupName].total },
        groupName
      }
    ];
    await store.dispatch(getGroupDevices(groupName));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    const devicesById = storeActions.find(item => item.type === DeviceConstants.RECEIVE_DEVICES).devicesById;
    expect(devicesById[defaultState.devices.byId.a1.id]).toBeTruthy();
    expect(new Date(devicesById[defaultState.devices.byId.a1.id].updated_ts).getTime()).toBeGreaterThanOrEqual(new Date(updated_ts).getTime());
  });
  it('should allow complete device retrieval for static groups', async () => {
    const store = mockStore({ ...defaultState });
    const groupName = 'testGroup';
    // eslint-disable-next-line no-unused-vars
    const { updated_ts, ...expectedDevice } = defaultState.devices.byId.a1;
    const expectedActions = [
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: { [defaultState.devices.byId.a1.id]: expectedDevice } },
      { type: DeviceConstants.RECEIVE_GROUP_DEVICES, group: { filters: [], deviceIds: [defaultState.devices.byId.a1.id], total: 1 }, groupName }
    ];
    await store.dispatch(getAllGroupDevices(groupName));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
});

describe('dynamic grouping related actions', () => {
  it('should allow retrieving dynamic groups', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      {
        type: DeviceConstants.RECEIVE_DYNAMIC_GROUPS,
        groups: {
          testGroupDynamic: {
            deviceIds: [],
            filters: [{ key: 'id', operator: '$in', scope: 'identity', value: ['a1'] }],
            id: 'filter1',
            total: 0
          }
        }
      }
    ];
    await store.dispatch(getDynamicGroups());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });

  it('should allow creating dynamic groups', async () => {
    const store = mockStore({ ...defaultState });
    const groupName = 'createdTestGroup';
    const expectedActions = [
      {
        type: DeviceConstants.ADD_DYNAMIC_GROUP,
        groupName,
        group: { deviceIds: [], total: 0, filters: [{ key: 'group', operator: '$nin', scope: 'system', value: ['testGroup'] }] }
      },
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: getGroupSuccessNotification(groupName) } }
    ];
    await store.dispatch(addDynamicGroup(groupName, [{ key: 'group', operator: '$nin', scope: 'system', value: ['testGroup'] }]));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow complete device retrieval for dynamic groups', async () => {
    const store = mockStore({ ...defaultState });
    const groupName = 'testGroupDynamic';
    // eslint-disable-next-line no-unused-vars
    const { updated_ts, ...expectedDevice } = defaultState.devices.byId.a1;
    const expectedActions = [
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: {} },
      { type: DeviceConstants.RECEIVE_GROUP_DEVICES, group: defaultState.devices.groups.byId.testGroupDynamic, groupName }
    ];
    await store.dispatch(getAllDynamicGroupDevices(groupName));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow dynamic group updates', async () => {
    const groupName = 'testGroupDynamic';
    const store = mockStore({
      ...defaultState,
      devices: {
        ...defaultState.devices,
        groups: {
          ...defaultState.devices.groups,
          selectedGroup: groupName
        }
      }
    });
    const expectedActions = [
      { type: DeviceConstants.ADD_DYNAMIC_GROUP, groupName, group: { deviceIds: [], total: 0, filters: [] } },
      { type: DeviceConstants.SET_DEVICE_FILTERS, filters: defaultState.devices.groups.byId.testGroupDynamic.filters },
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: groupUpdateSuccessMessage } }
    ];
    await store.dispatch(updateDynamicGroup(groupName, []));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow removing dynamic groups', async () => {
    const store = mockStore({ ...defaultState });
    const groupName = 'testGroupDynamic';
    const { testGroup } = defaultState.devices.groups.byId;
    const expectedActions = [
      { type: DeviceConstants.REMOVE_DYNAMIC_GROUP, groups: { testGroup } },
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'Group was removed successfully' } }
    ];
    await store.dispatch(removeDynamicGroup(groupName));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    const remainingGroups = storeActions.find(item => item.type === DeviceConstants.REMOVE_DYNAMIC_GROUP).groups;
    expect(Object.keys(remainingGroups).length).toBeLessThan(Object.keys(defaultState.devices.groups.byId).length);
    expect(Object.keys(remainingGroups).some(key => key === groupName)).toBeFalsy();
  });
});

describe('device retrieval ', () => {
  it('should allow single device retrieval from inventory', async () => {
    const store = mockStore({ ...defaultState });
    const { attributes, id } = defaultState.devices.byId.a1;
    const expectedActions = [{ type: DeviceConstants.RECEIVE_DEVICE, device: { attributes, id } }];
    await store.dispatch(getDeviceById(defaultState.devices.byId.a1.id));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow single device retrieval from detailed sources', async () => {
    const store = mockStore({ ...defaultState });
    const { attributes, updated_ts, id, ...expectedDevice } = defaultState.devices.byId.a1;
    const expectedActions = [
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: { [id]: { ...expectedDevice, id } } },
      { type: DeviceConstants.RECEIVE_DEVICE, device: { attributes, id } },
      { type: DeviceConstants.RECEIVE_DEVICE, device: expectedDevice },
      { type: DeviceConstants.RECEIVE_DEVICE_CONNECT, device: { connect_status: 'connected', connect_updated_ts: updated_ts, id } }
    ];
    await store.dispatch(getDeviceInfo(defaultState.devices.byId.a1.id));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow retrieving multiple devices by status', async () => {
    const store = mockStore({ ...defaultState });
    // eslint-disable-next-line no-unused-vars
    const { attributes, updated_ts, ...expectedDevice } = defaultState.devices.byId.a1;
    const expectedActions = [
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: { [defaultState.devices.byId.a1.id]: expectedDevice } },
      {
        type: DeviceConstants.SET_ACCEPTED_DEVICES,
        deviceIds: Array.from({ length: defaultState.devices.byStatus.accepted.total }, () => defaultState.devices.byId.a1.id),
        status: DeviceConstants.DEVICE_STATES.accepted,
        total: defaultState.devices.byStatus.accepted.total
      },
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: { [expectedDevice.id]: expectedDevice } }
    ];
    await store.dispatch(getDevicesByStatus(DeviceConstants.DEVICE_STATES.accepted));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow retrieving multiple devices by status and select if requested', async () => {
    const store = mockStore({ ...defaultState });
    // eslint-disable-next-line no-unused-vars
    const { attributes, updated_ts, ...expectedDevice } = defaultState.devices.byId.a1;
    const expectedActions = [
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: { [defaultState.devices.byId.a1.id]: expectedDevice } },
      {
        type: DeviceConstants.SET_ACCEPTED_DEVICES,
        deviceIds: [defaultState.devices.byId.a1.id],
        status: DeviceConstants.DEVICE_STATES.accepted,
        total: defaultState.devices.byStatus.accepted.total
      },
      { type: DeviceConstants.SET_DEVICE_LIST_STATE, state: { deviceIds: [defaultState.devices.byId.a1.id] } },
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: { [defaultState.devices.byId.a1.id]: expectedDevice } }
    ];
    await store.dispatch(getDevicesByStatus(DeviceConstants.DEVICE_STATES.accepted, { perPage: 1, shouldSelectDevices: true }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow retrieving all devices per status', async () => {
    const store = mockStore({ ...defaultState });
    // eslint-disable-next-line no-unused-vars
    const { updated_ts, ...expectedDevice } = defaultState.devices.byId.a1;
    const expectedActions = [
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: { [defaultState.devices.byId.a1.id]: expectedDevice } },
      {
        type: DeviceConstants.SET_ACCEPTED_DEVICES,
        deviceIds: Array.from({ length: defaultState.devices.byStatus.accepted.total }, () => defaultState.devices.byId.a1.id),
        status: DeviceConstants.DEVICE_STATES.accepted,
        total: defaultState.devices.byStatus.accepted.total
      },
      { type: DeviceConstants.SET_INACTIVE_DEVICES, activeDeviceTotal: 2, inactiveDeviceTotal: 0 }
    ];
    await store.dispatch(getAllDevicesByStatus(DeviceConstants.DEVICE_STATES.accepted));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow retrieving devices per status and their auth data', async () => {
    const store = mockStore({ ...defaultState });
    const {
      a1: { attributes: attributes1, ...expectedDevice1 }, // eslint-disable-line no-unused-vars
      b1: { attributes: attributes2, auth_sets, ...expectedDevice2 } // eslint-disable-line no-unused-vars
    } = defaultState.devices.byId;
    const expectedActions = [
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: { [expectedDevice1.id]: expectedDevice1, [expectedDevice2.id]: expectedDevice2 } }
    ];
    await store.dispatch(getDevicesWithAuth([defaultState.devices.byId.a1, defaultState.devices.byId.b1]));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
});

const deviceConfig = {
  configured: { uiPasswordRequired: true, foo: 'bar', timezone: 'GMT+2' },
  reported: { uiPasswordRequired: true, foo: 'bar', timezone: 'GMT+2' },
  updated_ts: defaultState.devices.byId.a1.updated_ts,
  reported_ts: '2019-01-01T09:25:01.000Z'
};

describe('device config ', () => {
  it('should allow single device config retrieval', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [{ type: DeviceConstants.RECEIVE_DEVICE_CONFIG, device: { config: deviceConfig, id: defaultState.devices.byId.a1.id } }];
    await store.dispatch(getDeviceConfig(defaultState.devices.byId.a1.id));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should not have a problem with unknown devices on config retrieval', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [];
    await store.dispatch(getDeviceConfig('testId'));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });

  it('should allow single device config update', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [{ type: DeviceConstants.RECEIVE_DEVICE_CONFIG, device: { config: deviceConfig, id: defaultState.devices.byId.a1.id } }];
    await store.dispatch(setDeviceConfig(defaultState.devices.byId.a1.id), { something: 'asdl' });
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow single device config deployment', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      { type: DeploymentConstants.RECEIVE_DEPLOYMENT, deployment: { id: defaultState.deployments.byId.d1.id } },
      {
        type: DeploymentConstants.RECEIVE_DEPLOYMENTS,
        deployments: {
          [defaultState.deployments.byId.d1.id]: {
            id: defaultState.deployments.byId.d1.id,
            stats: {
              'already-installed': 0,
              decommissioned: 0,
              downloading: 0,
              failure: 0,
              installing: 1,
              noartifact: 0,
              pending: 0,
              rebooting: 0,
              success: 0
            }
          }
        }
      }
    ];
    await store.dispatch(applyDeviceConfig(defaultState.devices.byId.a1.id), { something: 'asdl' });
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });

  it('should allow setting device tags', async () => {
    const store = mockStore({ ...defaultState });
    const { attributes, id } = defaultState.devices.byId.a1;
    const expectedActions = [
      { type: DeviceConstants.RECEIVE_DEVICE, device: { attributes, id } },
      { type: DeviceConstants.RECEIVE_DEVICE, device: { attributes, id, tags: { something: 'asdl' } } }
    ];
    await store.dispatch(setDeviceTags(defaultState.devices.byId.a1.id, { something: 'asdl' }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
});

describe('troubleshooting related actions', () => {
  it('should allow session info retrieval', async () => {
    const store = mockStore({ ...defaultState });
    const endDate = '2019-01-01T12:10:22.669Z';
    const sessionId = 'abd313a8-ee88-48ab-9c99-fbcd80048e6e';
    const result = await store.dispatch(getSessionDetails(sessionId, defaultState.devices.byId.a1.id, defaultState.users.currentUser, undefined, endDate));

    expect(result).toMatchObject({ start: new Date(endDate), end: new Date(endDate) });
  });
});

describe('device twin related actions', () => {
  it('should allow retrieving twin data from azure', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [{ type: DeviceConstants.RECEIVE_DEVICE, device: defaultState.devices.byId.a1 }];
    await store.dispatch(getDeviceTwin(defaultState.devices.byId.a1.id, DeviceConstants.EXTERNAL_PROVIDER['iot-hub'].provider));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow configuring twin data on azure', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [{ type: DeviceConstants.RECEIVE_DEVICE, device: defaultState.devices.byId.a1 }];
    await store.dispatch(setDeviceTwin(defaultState.devices.byId.a1.id, DeviceConstants.EXTERNAL_PROVIDER['iot-hub'].provider, { something: 'asdl' }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
});
