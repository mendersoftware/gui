import parse from 'parse-link-header';

import DevicesApi from '../api/devices-api';
import * as DeviceConstants from '../constants/deviceConstants';
import { deriveAttributesFromDevices, mapDeviceAttributes } from '../helpers';

// default per page until pagination and counting integrated
const defaultPerPage = 20;
const defaultPage = 1;

const apiUrl = '/api/management/v1';
const apiUrlV2 = '/api/management/v2';
const deviceAuthV2 = `${apiUrlV2}/devauth`;
const inventoryApiUrl = `${apiUrl}/inventory`;

export const getGroups = () => dispatch =>
  DevicesApi.get(`${inventoryApiUrl}/groups`).then(res =>
    dispatch({
      type: DeviceConstants.RECEIVE_GROUPS,
      groups: res.body
    })
  );

export const addDeviceToGroup = (group, device) => dispatch =>
  DevicesApi.put(`${inventoryApiUrl}/devices/${device}/group`, { group }).then(() =>
    Promise.all([
      dispatch({
        type: DeviceConstants.ADD_TO_GROUP,
        group,
        device
      }),
      dispatch({
        type: DeviceConstants.REMOVE_FROM_GROUP,
        group: DeviceConstants.UNGROUPED_GROUP.id,
        device
      })
    ])
  );

export const removeDeviceFromGroup = (device, group) => dispatch =>
  DevicesApi.delete(`${inventoryApiUrl}/devices/${device}/group/${group}`).then(() =>
    Promise.all([
      dispatch({
        type: DeviceConstants.REMOVE_FROM_GROUP,
        group,
        device
      }),
      dispatch({
        type: DeviceConstants.ADD_TO_GROUP,
        group: DeviceConstants.UNGROUPED_GROUP.id,
        device
      })
    ])
  );

export const addGroup = group => dispatch =>
  dispatch({
    type: DeviceConstants.ADD_GROUP,
    group
  });

/*
 * Device inventory functions
 */
export const selectGroup = group => dispatch => dispatch({ type: DeviceConstants.SELECT_GROUP, group });

export const selectDevice = deviceId => dispatch => {
  let tasks = [
    dispatch({
      type: DeviceConstants.SELECT_DEVICE,
      deviceId
    })
  ];
  if (deviceId) {
    tasks.push(getDeviceById(deviceId)(dispatch));
    tasks.push(getDeviceAuth(deviceId)(dispatch));
  }
  return Promise.all(tasks);
};

export const selectDevices = deviceIds => dispatch => dispatch({ type: DeviceConstants.SELECT_DEVICES, deviceIds });

export const getGroupDevices = (group, page = defaultPage, perPage = defaultPerPage) => dispatch => {
  var forGroup = group ? `&group=${group}` : '&has_group=false';
  return DevicesApi.get(`${inventoryApiUrl}/devices?per_page=${perPage}&page=${page}${forGroup}`).then(res => {
    const devices = res.body.map(device => ({ ...device, attributes: mapDeviceAttributes(device.attributes) }));
    return dispatch({
      type: DeviceConstants.RECEIVE_GROUP_DEVICES,
      group,
      devices,
      total: Number(res.headers['x-total-count'])
    });
  });
};

export const getAllGroupDevices = group => dispatch => {
  var forGroup = group ? `&group=${group}` : '&has_group=false';
  const getAllDevices = (perPage = 200, page = defaultPage, devices = []) =>
    DevicesApi.get(`${inventoryApiUrl}/devices?per_page=${perPage}&page=${page}${forGroup}`).then(res => {
      var links = parse(res.headers['link']);
      const mappedDevices = res.body.map(device => ({ ...device, attributes: mapDeviceAttributes(device.attributes) }));
      devices.push(...mappedDevices);
      if (links.next) {
        return getAllDevices(perPage, page + 1, devices);
      }
      if (!group) {
        return Promise.resolve({ devices });
      }
      return dispatch({
        type: DeviceConstants.RECEIVE_GROUP_DEVICES,
        group,
        devices,
        total: devices.length
      });
    });
  return getAllDevices();
};

export const setFilterAttributes = attrs => dispatch =>
  dispatch({
    type: DeviceConstants.SET_FILTER_ATTRIBUTES,
    attributes: attrs
  });

export const getDeviceById = id => dispatch =>
  DevicesApi.get(`${inventoryApiUrl}/devices/${id}`).then(res =>
    dispatch({
      type: DeviceConstants.RECEIVE_DEVICE,
      device: { ...res.body, attributes: mapDeviceAttributes(res.body.attributes) }
    })
  );

export const getDevicesWithInventory = devices => dispatch => Promise.all(devices.map(device => getDeviceById(device.id)(dispatch)));

export const getDevices = (page = defaultPage, perPage = defaultPerPage, searchTerm) => dispatch => {
  // get devices from inventory
  var search = searchTerm ? `&${searchTerm}` : '';
  return DevicesApi.get(`${inventoryApiUrl}/devices?per_page=${perPage}&page=${page}${search}`).then(res => {
    const devices = res.body.map(device => ({ ...device, attributes: mapDeviceAttributes(device.attributes) }));
    let tasks = [
      dispatch({
        type: DeviceConstants.RECEIVE_DEVICES_LIST,
        devices
      }),
      // for each device, get device identity info
      getDevicesWithAuth(devices)(dispatch)
    ];
    if (res.body > 200) {
      tasks.push(setFilterAttributes(deriveAttributesFromDevices(devices))(dispatch));
    }
    Promise.all(tasks);
  });
};

const pickAcceptedUngroupedDeviceIds = (acceptedDevs, ungroupedDevs) => {
  const devices = ungroupedDevs.reduce((accu, device) => {
    const isContained = acceptedDevs.find(item => item.id === device.id);
    if (isContained) {
      accu.push(device.id);
    }
    return accu;
  }, []);
  return devices;
};

const deriveUngroupedDevices = acceptedDevices => dispatch => {
  return Promise.all([getAllGroupDevices()(dispatch), Promise.resolve(acceptedDevices)]).then(results => {
    let ungroupedDevices = results[0].devices;
    const acceptedDevices = results[1];
    if (acceptedDevices.length && ungroupedDevices.length) {
      ungroupedDevices = pickAcceptedUngroupedDeviceIds(acceptedDevices, ungroupedDevices);
    }
    return dispatch({
      type: DeviceConstants.SET_UNGROUPED_DEVICES,
      deviceIds: ungroupedDevices
    });
  });
};

const deriveInactiveDevices = (acceptedDevices, deviceInventory) => dispatch => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdaysIsoString = yesterday.toISOString();
  // now boil the list down to the ones that were not updated since yesterday
  const devices = acceptedDevices.reduce(
    (accu, item) => {
      const device = deviceInventory.find(inventory => inventory.id === item.id);
      if (device.updated_ts > yesterdaysIsoString || item.updated_ts > yesterdaysIsoString) {
        accu.active.push(item);
      } else {
        accu.inactive.push(item);
      }
      return accu;
    },
    { active: [], inactive: [] }
  );
  return dispatch({
    type: DeviceConstants.SET_INACTIVE_DEVICES,
    inactiveDeviceIds: devices.inactive,
    activeDeviceIds: devices.active
  });
};

export const getAllDevices = () => (dispatch, getState) => {
  const getAllDevices = (perPage = 200, page = 1, devices = []) =>
    DevicesApi.get(`${inventoryApiUrl}/devices?per_page=${perPage}&page=${page}`).then(res => {
      var links = parse(res.headers['link']);
      const mappedDevices = res.body.map(device => ({ ...device, attributes: mapDeviceAttributes(device.attributes) }));
      devices.push(...mappedDevices);
      if (links.next) {
        return getAllDevices(perPage, page + 1, devices);
      }
      let tasks = [
        dispatch({
          type: DeviceConstants.RECEIVE_ALL_DEVICES,
          devices
        })
      ];
      const state = getState();
      if (state.devices.byStatus.accepted.deviceIds.length === state.devices.byStatus.accepted.total) {
        const acceptedDevices = state.devices.byStatus.accepted.deviceIds.map(id => state.devices.byId[id]);
        tasks.push(deriveInactiveDevices(acceptedDevices, devices)(dispatch));
      }
      return Promise.all(tasks);
    });
  return getAllDevices();
};

/* 
    Device Auth + admission 
  */
export const getDeviceCount = status => dispatch => {
  return DevicesApi.get(`${deviceAuthV2}/devices/count${status ? `?status=${status}` : ''}`).then(res => {
    switch (status) {
    case DeviceConstants.DEVICE_STATES.accepted:
    case DeviceConstants.DEVICE_STATES.pending:
    case DeviceConstants.DEVICE_STATES.preauth:
    case DeviceConstants.DEVICE_STATES.rejected:
      return dispatch({
        type: DeviceConstants[`SET_${status.toUpperCase()}_DEVICES_COUNT`],
        count: res.body.count,
        status
      });
    default:
      return dispatch({
        type: DeviceConstants.SET_TOTAL_DEVICES,
        count: res.body.count
      });
    }
  });
};

export const getAllDeviceCounts = () => dispatch => Promise.all(Object.values(DeviceConstants.DEVICE_STATES).map(status => getDeviceCount(status)(dispatch)));

export const getDeviceLimit = () => dispatch =>
  DevicesApi.get(`${deviceAuthV2}/limits/max_devices`).then(res =>
    dispatch({
      type: DeviceConstants.SET_DEVICE_LIMIT,
      limit: res.body.limit
    })
  );

export const getDevicesByStatus = (status, page = defaultPage, perPage = defaultPerPage) => dispatch =>
  DevicesApi.get(`${deviceAuthV2}/devices?${status ? `status=${status}` : ''}&per_page=${perPage}&page=${page}`).then(response => {
    let tasks = [];
    if (!status) {
      // TODO incorporate device attribute setting in here
      tasks.push(
        dispatch({
          type: DeviceConstants.RECEIVE_DEVICES_LIST,
          devices: response.body
        })
      );
      if (response.body.length > 200) {
        tasks.push(setFilterAttributes(deriveAttributesFromDevices(response.body))(dispatch));
      }
      return Promise.all(tasks);
    } else {
      let deviceStatus = status;
      tasks.push(
        dispatch({
          type: DeviceConstants[`SET_${deviceStatus.toUpperCase()}_DEVICES`],
          devices: response.body,
          status
        })
      );
      if (status === DeviceConstants.DEVICE_STATES.accepted) {
        tasks.push(getDevicesWithInventory(response.body)(dispatch));
      }
    }
    return Promise.all(tasks);
  });

export const getAllDevicesByStatus = status => (dispatch, getState) => {
  const getAllDevices = (perPage = 200, page = 1, devices = []) =>
    DevicesApi.get(`${deviceAuthV2}/devices?status=${status}&per_page=${perPage}&page=${page}`).then(res => {
      var links = parse(res.headers['link']);
      devices.push(...res.body);
      if (links.next) {
        return getAllDevices(perPage, page + 1, devices);
      }
      let tasks = [
        dispatch({
          type: DeviceConstants[`SET_${status.toUpperCase()}_DEVICES`],
          devices,
          status,
          total: devices.length
        })
      ];
      if (status === DeviceConstants.DEVICE_STATES.accepted) {
        tasks.push(deriveUngroupedDevices(devices)(dispatch));
        const state = getState();
        if (Object.keys(state.devices.byId).length === state.devices.total) {
          const inventoryDevices = Object.values(state.devices.byId);
          tasks.push(deriveInactiveDevices(devices, inventoryDevices)(dispatch));
        }
      }
      return Promise.all(tasks);
    });
  return getAllDevices();
};

export const getDeviceAuth = id => dispatch =>
  DevicesApi.get(`${deviceAuthV2}/devices/${id}`).then(res =>
    dispatch({
      type: DeviceConstants.RECEIVE_DEVICE_AUTH,
      device: res.body
    })
  );

export const getDevicesWithAuth = devices => dispatch => devices.map(device => getDeviceAuth(device.id)(dispatch));

export const updateDeviceAuth = (deviceId, authId, status) => dispatch =>
  DevicesApi.put(`${deviceAuthV2}/devices/${deviceId}/auth/${authId}/status`, { status }).then(() =>
    Promise.all([
      dispatch({
        type: DeviceConstants.UPDATE_DEVICE_AUTHSET,
        authId,
        deviceId,
        status
      }),
      getDeviceAuth(deviceId)(dispatch)
    ])
  );

export const deleteAuthset = (deviceId, authId) => dispatch =>
  DevicesApi.delete(`${deviceAuthV2}/devices/${deviceId}/auth/${authId}`).then(() =>
    Promise.all([
      dispatch({
        type: DeviceConstants.REMOVE_DEVICE_AUTHSET,
        authId,
        deviceId
      }),
      getDeviceAuth(deviceId)(dispatch)
    ])
  );

export const preauthDevice = authset => dispatch =>
  DevicesApi.post(`${deviceAuthV2}/devices`, authset).then(() =>
    Promise.all([
      dispatch({
        type: DeviceConstants.ADD_DEVICE_AUTHSET,
        authset
      }),
      getDeviceCount(DeviceConstants.DEVICE_STATES.preauth)(dispatch)
    ])
  );

export const decommissionDevice = deviceId => dispatch =>
  DevicesApi.delete(`${deviceAuthV2}/devices/${deviceId}`).then(() =>
    dispatch({
      type: DeviceConstants.DECOMMISION_DEVICE,
      deviceId
    })
  );
