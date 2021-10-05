import reducer, { initialState } from './deviceReducer';
import DeviceConstants from '../constants/deviceConstants';
import { defaultState } from '../../../tests/mockData';

describe('device reducer', () => {
  it('should return the initial state', async () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle RECEIVE_GROUPS', async () => {
    expect(reducer(undefined, { type: DeviceConstants.RECEIVE_GROUPS, groups: defaultState.devices.groups.byId }).groups.byId).toEqual(
      defaultState.devices.groups.byId
    );
    expect(reducer(initialState, { type: DeviceConstants.RECEIVE_GROUPS, groups: defaultState.devices.groups.byId }).groups.byId).toEqual(
      defaultState.devices.groups.byId
    );
    expect(
      reducer(initialState, { type: DeviceConstants.RECEIVE_GROUPS, groups: { testExtra: { deviceIds: [], total: 0, filters: [] } } }).groups.byId.testExtra
    ).toEqual({ deviceIds: [], total: 0, filters: [] });
  });
  it('should handle RECEIVE_GROUP_DEVICES', async () => {
    expect(
      reducer(undefined, {
        type: DeviceConstants.RECEIVE_GROUP_DEVICES,
        groupName: 'testGroupDynamic',
        group: defaultState.devices.groups.byId.testGroupDynamic
      }).groups.byId.testGroupDynamic
    ).toEqual(defaultState.devices.groups.byId.testGroupDynamic);
    expect(
      reducer(initialState, {
        type: DeviceConstants.RECEIVE_GROUP_DEVICES,
        groupName: 'testGroupDynamic',
        group: defaultState.devices.groups.byId.testGroupDynamic
      }).groups.byId.testGroupDynamic
    ).toEqual(defaultState.devices.groups.byId.testGroupDynamic);
  });
  it('should handle RECEIVE_DYNAMIC_GROUPS', async () => {
    expect(reducer(undefined, { type: DeviceConstants.RECEIVE_DYNAMIC_GROUPS, groups: defaultState.devices.groups.byId }).groups.byId).toEqual(
      defaultState.devices.groups.byId
    );
    expect(reducer(initialState, { type: DeviceConstants.RECEIVE_DYNAMIC_GROUPS, groups: defaultState.devices.groups.byId }).groups.byId).toEqual(
      defaultState.devices.groups.byId
    );
    expect(
      reducer(initialState, { type: DeviceConstants.RECEIVE_DYNAMIC_GROUPS, groups: { testExtra: { deviceIds: [], total: 0, filters: [] } } }).groups.byId
        .testExtra
    ).toEqual({ deviceIds: [], total: 0, filters: [] });
  });
  it('should handle ADD_TO_GROUP', async () => {
    let state = reducer(undefined, { type: DeviceConstants.RECEIVE_GROUPS, groups: defaultState.devices.groups.byId });
    expect(reducer(state, { type: DeviceConstants.ADD_TO_GROUP, group: 'testExtra', deviceIds: ['d1'] }).groups.byId.testExtra.deviceIds).toHaveLength(1);
    expect(
      reducer(initialState, { type: DeviceConstants.ADD_TO_GROUP, group: 'testGroup', deviceIds: ['123', '1243'] }).groups.byId.testGroup.deviceIds
    ).toHaveLength(2);
  });
  it('should handle REMOVE_FROM_GROUP', async () => {
    let state = reducer(undefined, { type: DeviceConstants.RECEIVE_GROUPS, groups: defaultState.devices.groups.byId });
    state = reducer(state, { type: DeviceConstants.SELECT_GROUP, group: 'testGroup' });
    expect(
      reducer(state, { type: DeviceConstants.REMOVE_FROM_GROUP, group: 'testGroup', deviceIds: [defaultState.devices.groups.byId.testGroup.deviceIds[0]] })
        .groups.byId.testGroup.deviceIds
    ).toHaveLength(defaultState.devices.groups.byId.testGroup.deviceIds.length - 1);
    expect(
      reducer(state, { type: DeviceConstants.REMOVE_FROM_GROUP, group: 'testGroup', deviceIds: defaultState.devices.groups.byId.testGroup.deviceIds }).groups
        .byId.testGroup
    ).toBeFalsy();
    expect(
      reducer(initialState, { type: DeviceConstants.REMOVE_FROM_GROUP, group: 'testExtra', deviceIds: ['123', '1243'] }).groups.byId.testExtra
    ).toBeFalsy();
  });
  it('should handle ADD_DYNAMIC_GROUP', async () => {
    expect(
      reducer(undefined, { type: DeviceConstants.ADD_DYNAMIC_GROUP, groupName: 'test', group: { something: 'test' } }).groups.byId.test.something
    ).toBeTruthy();
    expect(
      reducer(initialState, { type: DeviceConstants.ADD_DYNAMIC_GROUP, groupName: 'test', group: { something: 'test' } }).groups.byId.test.something
    ).toBeTruthy();
  });
  it('should handle ADD_STATIC_GROUP', async () => {
    expect(
      reducer(undefined, { type: DeviceConstants.ADD_STATIC_GROUP, groupName: 'test', group: { something: 'test' } }).groups.byId.test.something
    ).toBeTruthy();
    expect(
      reducer(initialState, { type: DeviceConstants.ADD_STATIC_GROUP, groupName: 'test', group: { something: 'test' } }).groups.byId.test.something
    ).toBeTruthy();
  });

  it('should handle REMOVE_DYNAMIC_GROUP', async () => {
    let state = reducer(undefined, { type: DeviceConstants.RECEIVE_GROUPS, groups: defaultState.devices.groups.byId });
    // eslint-disable-next-line no-unused-vars
    const { testGroupDynamic, ...remainder } = defaultState.devices.groups.byId;
    expect(Object.keys(reducer(state, { type: DeviceConstants.REMOVE_DYNAMIC_GROUP, groups: remainder }).groups.byId)).toHaveLength(
      Object.keys(defaultState.devices.groups.byId).length - 1
    );
    expect(Object.keys(reducer(initialState, { type: DeviceConstants.REMOVE_DYNAMIC_GROUP, groups: remainder }).groups.byId)).toHaveLength(
      Object.keys(defaultState.devices.groups.byId).length - 1
    );
  });
  it('should handle REMOVE_STATIC_GROUP', async () => {
    let state = reducer(undefined, { type: DeviceConstants.RECEIVE_GROUPS, groups: defaultState.devices.groups.byId });
    // eslint-disable-next-line no-unused-vars
    const { testGroup, ...remainder } = defaultState.devices.groups.byId;
    expect(Object.keys(reducer(state, { type: DeviceConstants.REMOVE_STATIC_GROUP, groups: remainder }).groups.byId)).toHaveLength(
      Object.keys(defaultState.devices.groups.byId).length - 1
    );
    expect(Object.keys(reducer(initialState, { type: DeviceConstants.REMOVE_STATIC_GROUP, groups: remainder }).groups.byId)).toHaveLength(
      Object.keys(defaultState.devices.groups.byId).length - 1
    );
  });
  it('should handle SELECT_DEVICE', async () => {
    expect(reducer(undefined, { type: DeviceConstants.SELECT_DEVICE, deviceId: 'test' }).selectedDevice).toEqual('test');
    expect(reducer(initialState, { type: DeviceConstants.SELECT_DEVICE, deviceId: 'test' }).selectedDevice).toEqual('test');
  });
  it('should handle SET_DEVICE_LIST_STATE', async () => {
    expect(reducer(undefined, { type: DeviceConstants.SET_DEVICE_LIST_STATE, state: { deviceIds: ['test'] } }).deviceList.deviceIds).toEqual(['test']);
    expect(reducer(initialState, { type: DeviceConstants.SET_DEVICE_LIST_STATE, state: { deviceIds: ['test'] } }).deviceList.deviceIds).toEqual(['test']);
  });
  it('should handle SET_DEVICE_FILTERS', async () => {
    expect(
      reducer(undefined, { type: DeviceConstants.SET_DEVICE_FILTERS, filters: defaultState.devices.groups.byId.testGroupDynamic.filters }).filters
    ).toHaveLength(1);
    expect(reducer(initialState, { type: DeviceConstants.SET_DEVICE_FILTERS, filters: [{ key: 'test', operator: 'test' }] }).filters).toHaveLength(0);
  });
  it('should handle SET_FILTER_ATTRIBUTES', async () => {
    expect(reducer(undefined, { type: DeviceConstants.SET_FILTER_ATTRIBUTES, attributes: { things: '12' } }).filteringAttributes).toEqual({
      things: '12'
    });
    expect(reducer(initialState, { type: DeviceConstants.SET_FILTER_ATTRIBUTES, attributes: { things: '12' } }).filteringAttributes).toEqual({
      things: '12'
    });
  });
  it('should handle SET_TOTAL_DEVICES', async () => {
    expect(reducer(undefined, { type: DeviceConstants.SET_TOTAL_DEVICES, count: 2 }).total).toEqual(2);
    expect(reducer(initialState, { type: DeviceConstants.SET_TOTAL_DEVICES, count: 4 }).total).toEqual(4);
  });
  it('should handle SET_DEVICE_LIMIT', async () => {
    expect(reducer(undefined, { type: DeviceConstants.SET_DEVICE_LIMIT, limit: 500 }).limit).toEqual(500);
    expect(reducer(initialState, { type: DeviceConstants.SET_DEVICE_LIMIT, limit: 200 }).limit).toEqual(200);
  });

  it('should handle RECEIVE_DEVICE', async () => {
    expect(reducer(undefined, { type: DeviceConstants.RECEIVE_DEVICE, device: defaultState.devices.byId.b1 }).byId.b1).toEqual(defaultState.devices.byId.b1);
    expect(reducer(initialState, { type: DeviceConstants.RECEIVE_DEVICE, device: defaultState.devices.byId.b1 }).byId).not.toBe({});
  });
  it('should handle RECEIVE_DEVICE_AUTH', async () => {
    expect(
      reducer(undefined, {
        type: DeviceConstants.RECEIVE_DEVICE_AUTH,
        device: { auth_sets: [], id: defaultState.devices.byId.a1.id, identity_data: {}, status: 'test' }
      }).byId.a1.status
    ).toEqual('test');
    expect(
      reducer(initialState, { type: DeviceConstants.RECEIVE_DEVICE_AUTH, device: { auth_sets: [], id: 'unknown', identity_data: {}, status: 'test' } }).byId
        .unknown.status
    ).toEqual('test');
  });

  it('should handle RECEIVE_DEVICES', async () => {
    expect(reducer(undefined, { type: DeviceConstants.RECEIVE_DEVICES, devicesById: defaultState.devices.byId }).byId).toEqual(defaultState.devices.byId);
    expect(reducer(initialState, { type: DeviceConstants.RECEIVE_DEVICES, devicesById: defaultState.devices.byId }).byId).toEqual(defaultState.devices.byId);
  });
  it('should handle SET_INACTIVE_DEVICES', async () => {
    expect(reducer(undefined, { type: DeviceConstants.SET_INACTIVE_DEVICES, activeDeviceTotal: 1, inactiveDeviceTotal: 1 }).byStatus.active.total).toBeTruthy();
    expect(reducer(initialState, { type: DeviceConstants.SET_INACTIVE_DEVICES, activeDeviceTotal: 1, inactiveDeviceTotal: 1 }).byStatus.inactive.total).toEqual(
      1
    );
  });
  it('should handle SET_<authstatus>_DEVICES', async () => {
    Object.values(DeviceConstants.DEVICE_STATES).forEach(status => {
      expect(
        reducer(undefined, { type: DeviceConstants[`SET_${status.toUpperCase()}_DEVICES`], deviceIds: ['a1'], total: 1, status }).byStatus[status]
      ).toEqual({ deviceIds: ['a1'], total: 1 });
      expect(reducer(initialState, { type: DeviceConstants[`SET_${status.toUpperCase()}_DEVICES`], deviceIds: ['a1'], status }).byStatus[status]).toEqual({
        deviceIds: [],
        total: 0
      });
    });
  });
  it('should handle SET_<authstatus>_DEVICES_COUNT', async () => {
    Object.values(DeviceConstants.DEVICE_STATES).forEach(status => {
      expect(reducer(undefined, { type: DeviceConstants[`SET_${status.toUpperCase()}_DEVICES_COUNT`], count: 1, status }).byStatus[status].total).toEqual(1);
      expect(reducer(initialState, { type: DeviceConstants[`SET_${status.toUpperCase()}_DEVICES_COUNT`], count: 1, status }).byStatus[status].total).toEqual(1);
    });
  });
});
