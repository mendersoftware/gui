import parse from 'parse-link-header';

import DevicesApi from '../api/devices-api';
import * as DeviceConstants from '../constants/deviceConstants';
import { deriveAttributesFromDevices, duplicateFilter, encodeFilters, filterDevices, mapDeviceAttributes } from '../helpers';

// default per page until pagination and counting integrated
const defaultPerPage = 20;
const defaultPage = 1;

const apiUrl = '/api/management/v1';
const apiUrlV2 = '/api/management/v2';
const deviceAuthV2 = `${apiUrlV2}/devauth`;
const inventoryApiUrl = `${apiUrl}/inventory`;
const inventoryApiUrlV2 = `${apiUrlV2}/inventory`;

export const getGroups = () => dispatch =>
  DevicesApi.get(`${inventoryApiUrl}/groups`).then(res =>
    Promise.all(
      res.body.reduce(
        (accu, group) => {
          accu.push(dispatch(getGroupDevices(group)));
          return accu;
        },
        [
          dispatch({
            type: DeviceConstants.RECEIVE_GROUPS,
            groups: res.body
          })
        ]
      )
    )
  );

export const addDeviceToGroup = (group, deviceId) => dispatch =>
  DevicesApi.put(`${inventoryApiUrl}/devices/${deviceId}/group`, { group: encodeURIComponent(group) }).then(() =>
    Promise.all([
      dispatch({
        type: DeviceConstants.ADD_TO_GROUP,
        group,
        deviceId
      }),
      dispatch({
        type: DeviceConstants.REMOVE_FROM_GROUP,
        group: DeviceConstants.UNGROUPED_GROUP.id,
        deviceId
      })
    ])
  );

export const removeDeviceFromGroup = (deviceId, group) => dispatch =>
  DevicesApi.delete(`${inventoryApiUrl}/devices/${deviceId}/group/${group}`).then(() =>
    Promise.all([
      dispatch({
        type: DeviceConstants.REMOVE_FROM_GROUP,
        group,
        deviceId
      }),
      dispatch({
        type: DeviceConstants.ADD_TO_GROUP,
        group: DeviceConstants.UNGROUPED_GROUP.id,
        deviceId
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
export const selectGroup = group => (dispatch, getState) => {
  const selectedGroup = getState().devices.groups.byId[group] ? group : null;
  return Promise.all([
    dispatch({ type: DeviceConstants.SELECT_GROUP, group: selectedGroup }),
    dispatch({ type: DeviceConstants.SET_DEVICE_FILTERS, filters: [] })
  ]);
};

export const trySelectDevice = (deviceId, status) => (dispatch, getState) => {
  const deviceIds = status ? getState().devices.byStatus[status].deviceIds : Object.keys(getState().devices.byId);
  if (status === DeviceConstants.DEVICE_STATES.accepted || (deviceIds[0] && deviceId.length === deviceIds[0].length)) {
    return Promise.resolve(dispatch(selectDevice(deviceId, status)));
  }
  const possibleDevices = deviceIds.filter(id => id.startsWith(deviceId));
  return Promise.resolve(possibleDevices.length ? dispatch(selectDevices(possibleDevices)) : dispatch(selectDevice(deviceId)));
};

export const selectDevice = (deviceId, status) => dispatch => {
  if (deviceId) {
    const tasks = [dispatch(getDeviceById(deviceId)), dispatch(getDeviceAuth(deviceId))];
    return Promise.all(tasks)
      .then(results => {
        if (status && status !== results[1].status) {
          return Promise.reject();
        }
        dispatch({
          type: DeviceConstants.SELECT_DEVICE,
          deviceId
        });
      })
      .catch(() =>
        Promise.all([
          dispatch(selectDevices([])),
          dispatch({
            type: DeviceConstants.SELECT_DEVICE,
            deviceId: null
          })
        ])
      );
  }
  return Promise.resolve(
    dispatch({
      type: DeviceConstants.SELECT_DEVICE,
      deviceId
    })
  );
};

export const selectDevices = deviceIds => dispatch => dispatch({ type: DeviceConstants.SELECT_DEVICES, deviceIds });

const reduceReceivedDevices = (devices, ids, state, status) =>
  devices.reduce(
    (accu, device) => {
      const stateDevice = state.devices.byId[device.id];
      if (status) {
        delete device.updated_ts;
        device.status = status;
      } else {
        const attributes = mapDeviceAttributes(device.attributes);
        device.attributes = stateDevice ? { ...stateDevice.attributes, ...attributes } : attributes;
      }
      accu.devicesById[device.id] = { ...stateDevice, ...device };
      accu.ids.push(device.id);
      return accu;
    },
    { ids, devicesById: {} }
  );

export const getGroupDevices = (group, selectDevices = false, page = defaultPage, perPage = defaultPerPage) => (dispatch, getState) => {
  var forGroup = group ? `&group=${group}` : '&has_group=false';
  return DevicesApi.get(`${inventoryApiUrl}/devices?per_page=${perPage}&page=${page}${forGroup}`).then(res => {
    const deviceAccu = reduceReceivedDevices(res.body, [], getState());
    return Promise.all([
      dispatch(setFilterAttributes(deriveAttributesFromDevices(Object.values(deviceAccu.devicesById)))),
      dispatch({
        type: DeviceConstants.RECEIVE_DEVICES,
        devicesById: deviceAccu.devicesById
      }),
      dispatch({
        type: DeviceConstants.RECEIVE_GROUP_DEVICES,
        group,
        deviceIds: deviceAccu.ids,
        selectDevices,
        total: Number(res.headers['x-total-count'])
      })
    ]);
  });
};

export const getAllGroupDevices = group => (dispatch, getState) => {
  const forGroup = group ? `&group=${group}` : '&has_group=false';
  const getAllDevices = (perPage = 500, page = defaultPage, devices = []) =>
    DevicesApi.get(`${inventoryApiUrl}/devices?per_page=${perPage}&page=${page}${forGroup}`).then(res => {
      const links = parse(res.headers['link']);
      const deviceAccu = reduceReceivedDevices(res.body, devices, getState());
      dispatch({
        type: DeviceConstants.RECEIVE_DEVICES,
        devicesById: deviceAccu.devicesById
      });
      if (links.next) {
        return getAllDevices(perPage, page + 1, deviceAccu.ids);
      }
      let tasks = [];

      if (!group) {
        tasks.push(
          dispatch({
            type: DeviceConstants.RECEIVE_ALL_DEVICE_IDS,
            deviceIds: deviceAccu.ids
          })
        );
        group = DeviceConstants.UNGROUPED_GROUP.id;
      }
      tasks.push(
        dispatch({
          type: DeviceConstants.RECEIVE_GROUP_DEVICES,
          group,
          deviceIds: deviceAccu.ids,
          total: deviceAccu.ids.length
        })
      );
      return Promise.all([tasks]);
    });
  return getAllDevices();
};

export const setFilterAttributes = attrs => (dispatch, getState) => {
  const storedFilteringAttributes = getState().devices.filteringAttributes;
  const identityAttributes = [...storedFilteringAttributes.identityAttributes, ...attrs.identityAttributes].filter(duplicateFilter);
  const inventoryAttributes = [...storedFilteringAttributes.inventoryAttributes, ...attrs.inventoryAttributes].filter(duplicateFilter);
  return dispatch({
    type: DeviceConstants.SET_FILTER_ATTRIBUTES,
    attributes: { identityAttributes, inventoryAttributes }
  });
};

export const setDeviceFilters = filters => dispatch =>
  dispatch({
    type: DeviceConstants.SET_DEVICE_FILTERS,
    filters
  });

export const getDeviceById = id => dispatch =>
  DevicesApi.get(`${inventoryApiUrl}/devices/${id}`)
    .then(res => {
      const device = { ...res.body, attributes: mapDeviceAttributes(res.body.attributes) };
      dispatch({
        type: DeviceConstants.RECEIVE_DEVICE,
        device
      });
      return Promise.resolve(device);
    })
    .catch(err => {
      if (err.res && err.res.body && err.res.body.error.startsWith('Device not found')) {
        console.log(`${id} does not have any inventory information`);
        return;
      }
      return err;
    });

export const getDevicesWithInventory = devices => dispatch =>
  Promise.all(devices.map(device => dispatch(getDeviceById(device.id)))).then(deviceList => {
    if (deviceList.length && deviceList.length < 200) {
      return Promise.resolve(dispatch(setFilterAttributes(deriveAttributesFromDevices(deviceList))));
    }
    return Promise.resolve();
  });

export const getDevices = (page = defaultPage, perPage = defaultPerPage, filters, shouldSelectDevices = false) => dispatch => {
  // get devices from inventory
  const search = filters ? `&${encodeFilters(filters)}` : '';
  const query = DevicesApi.get(`${inventoryApiUrl}/devices?per_page=${perPage}&page=${page}${search}`);
  return query.then(res => {
    const devices = res.body.map(device => ({ ...device, attributes: mapDeviceAttributes(device.attributes) }));
    let tasks = [];
    tasks.push(
      dispatch({
        type: DeviceConstants.RECEIVE_DEVICES_LIST,
        devices
      })
    );
    // for each device, get device identity info
    tasks.push(dispatch(getDevicesWithAuth(devices)));
    if (devices.length < 200) {
      tasks.push(dispatch(setFilterAttributes(deriveAttributesFromDevices(devices))));
    }
    if (shouldSelectDevices) {
      tasks.push(dispatch(selectDevices(devices.map(device => device.id))));
    }
    return Promise.all(tasks);
  });
};

const deriveUngroupedDevices = acceptedDeviceIds => (dispatch, getState) => {
  return Promise.all([dispatch(getAllGroupDevices())]).then(() => {
    const deviceIds = getState().devices.groups.byId[DeviceConstants.UNGROUPED_GROUP.id].deviceIds.reduce((accu, deviceId) => {
      const isContained = acceptedDeviceIds.find(item => item === deviceId);
      if (isContained) {
        accu.push(deviceId);
      }
      return accu;
    }, []);
    return dispatch({
      type: DeviceConstants.SET_UNGROUPED_DEVICES,
      deviceIds
    });
  });
};

const deriveInactiveDevices = (acceptedDeviceIds, deviceInventoryIds) => (dispatch, getState) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdaysIsoString = yesterday.toISOString();
  const state = getState().devices;
  const deviceInventory = deviceInventoryIds.map(id => state.byId[id]);
  // now boil the list down to the ones that were not updated since yesterday
  const devices = acceptedDeviceIds.reduce(
    (accu, id) => {
      const item = state.byId[id];
      const device = deviceInventory[id];
      if ((device && device.updated_ts > yesterdaysIsoString) || item.updated_ts > yesterdaysIsoString) {
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

export const getAllDevices = limit => (dispatch, getState) => {
  const getAllDevices = (perPage = 500, page = 1, devices = []) =>
    DevicesApi.get(`${inventoryApiUrl}/devices?per_page=${perPage}&page=${page}`).then(res => {
      const links = parse(res.headers['link']);
      const deviceAccu = reduceReceivedDevices(res.body, devices, getState());
      dispatch({
        type: DeviceConstants.RECEIVE_DEVICES,
        devicesById: deviceAccu.devicesById
      });
      if (links.next && !(limit && perPage * page >= limit)) {
        return getAllDevices(perPage, page + 1, deviceAccu.ids);
      }
      let tasks = [
        dispatch({
          type: DeviceConstants.RECEIVE_ALL_DEVICE_IDS,
          deviceIds: deviceAccu.ids
        })
      ];
      const state = getState();
      if (state.devices.byStatus.accepted.deviceIds.length === state.devices.byStatus.accepted.total) {
        tasks.push(dispatch(deriveInactiveDevices(state.devices.byStatus.accepted.deviceIds, deviceAccu.ids)));
      }
      return Promise.all(tasks);
    });
  return getAllDevices();
};

/*
    Device Auth + admission
  */
export const getDeviceCount = status => dispatch => {
  return DevicesApi.post(`${inventoryApiUrlV2}/filters/search`, {
    page: 1,
    per_page: 500,
    filters: [{ scope: 'identity', attribute: 'status', type: '$eq', value: status }]
  }).then(res => {
    switch (status) {
      case DeviceConstants.DEVICE_STATES.accepted:
      case DeviceConstants.DEVICE_STATES.pending:
      case DeviceConstants.DEVICE_STATES.preauth:
      case DeviceConstants.DEVICE_STATES.rejected:
        return dispatch({
          type: DeviceConstants[`SET_${status.toUpperCase()}_DEVICES_COUNT`],
          count: Number(res.headers['x-total-count']),
          status
        });
      default:
        return dispatch({
          type: DeviceConstants.SET_TOTAL_DEVICES,
          count: Number(res.headers['x-total-count'])
        });
    }
  });
};

export const getAllDeviceCounts = () => dispatch => Promise.all(Object.values(DeviceConstants.DEVICE_STATES).map(status => dispatch(getDeviceCount(status))));

export const getDeviceLimit = () => dispatch =>
  DevicesApi.get(`${deviceAuthV2}/limits/max_devices`).then(res =>
    dispatch({
      type: DeviceConstants.SET_DEVICE_LIMIT,
      limit: res.body.limit
    })
  );

export const getDevicesByStatus = (status, page = defaultPage, perPage = defaultPerPage, shouldSelectDevices = false) => (dispatch, getState) => {
  // const query = DevicesApi.get(`${deviceAuthV2}/devices?${status ? `status=${status}` : ''}&per_page=${perPage}&page=${page}`);
  const query = DevicesApi.post(`${inventoryApiUrlV2}/filters/search`, {
    page,
    per_page: perPage,
    filters: [{ scope: 'identity', attribute: 'status', type: '$eq', value: status }]
  });

  const filters = getState().devices.filters;
  let possibleDeviceIds = [];
  if (filters.length && shouldSelectDevices && status !== DeviceConstants.DEVICE_STATES.accepted) {
    possibleDeviceIds = filterDevices(getState().devices, filters, status);
  }
  return query.then(response => {
    console.log('getDevicesByStatus this was successful status: ' + status + '; response:');
    console.log(response);
    console.log('getDevicesByStatus response body:');
    console.log(response.body);
    console.log('getDevicesByStatus');
    let tasks = [];
    if (!status) {
      tasks.push(
        dispatch({
          type: DeviceConstants.RECEIVE_DEVICES_LIST,
          devices: response.body
        })
      );
      if (response.body.length < 200) {
        tasks.push(dispatch(setFilterAttributes(deriveAttributesFromDevices(response.body))));
      }
    } else {
      const deviceAccu = reduceReceivedDevices(response.body, [], getState(), status);
      let total;
      if (getState().devices.byStatus[status].total === deviceAccu.ids.length) {
        total = deviceAccu.ids.length;
      }
      tasks = [
        dispatch({
          type: DeviceConstants[`SET_${status.toUpperCase()}_DEVICES`],
          deviceIds: deviceAccu.ids,
          status,
          total
        }),
        dispatch({
          type: DeviceConstants.RECEIVE_DEVICES,
          devicesById: deviceAccu.devicesById
        })
      ];
      if (status === DeviceConstants.DEVICE_STATES.accepted || status === DeviceConstants.DEVICE_STATES.rejected) {
        tasks.push(dispatch(getDevicesWithInventory(response.body)));
      }
      if (shouldSelectDevices) {
        // since deviceauth doesn't have any filtering we have to rely on the local filtering capabilities if filters are selected
        tasks.push(dispatch(selectDevices(filters.length ? possibleDeviceIds : deviceAccu.ids)));
      }
    }
    return Promise.all(tasks);
  });
};

export const getAllDevicesByStatus = status => (dispatch, getState) => {
  if (status == 'pending') {
    const getAllDevices = (perPage = 500, page = 1, devices = []) =>
      DevicesApi.get(`${deviceAuthV2}/devices?status=${status}&per_page=${perPage}&page=${page}`).then(res => {
        const deviceAccu = reduceReceivedDevices(res.body, devices, getState(), status);
        dispatch({
          type: DeviceConstants.RECEIVE_DEVICES,
          devicesById: deviceAccu.devicesById
        });
        const links = parse(res.headers['link']);
        if (links.next) {
          return getAllDevices(perPage, page + 1, deviceAccu.ids);
        }
        let tasks = [
          dispatch({
            type: DeviceConstants[`SET_${status.toUpperCase()}_DEVICES`],
            deviceIds: deviceAccu.ids,
            status,
            total: deviceAccu.ids.length
          })
        ];
        if (status === DeviceConstants.DEVICE_STATES.accepted) {
          tasks.push(dispatch(deriveUngroupedDevices(deviceAccu.ids)));
          const state = getState();
          const inventoryDeviceIds = Object.keys(state.devices.byId);
          if (inventoryDeviceIds.length === state.devices.total) {
            tasks.push(dispatch(deriveInactiveDevices(deviceAccu.ids, inventoryDeviceIds)));
          }
        }
        return Promise.all(tasks);
      });
    return getAllDevices();
  } else {
    const getAllDevices = (perPage = 500, page = 1, devices = []) =>
      DevicesApi.post(`${inventoryApiUrlV2}/filters/search`, {
        page: page,
        per_page: perPage,
        filters: [{ scope: 'identity', attribute: 'status', type: '$eq', value: status }]
      }).then(res => {
        const deviceAccu = reduceReceivedDevices(res.body, devices, getState(), status);
        dispatch({
          type: DeviceConstants.RECEIVE_DEVICES,
          devicesById: deviceAccu.devicesById
        });
        const links = parse(res.headers['link']);
        if (links.next) {
          return getAllDevices(perPage, page + 1, deviceAccu.ids);
        }
        let tasks = [
          dispatch({
            type: DeviceConstants[`SET_${status.toUpperCase()}_DEVICES`],
            deviceIds: deviceAccu.ids,
            status,
            total: deviceAccu.ids.length
          })
        ];
        if (status === DeviceConstants.DEVICE_STATES.accepted) {
          tasks.push(dispatch(deriveUngroupedDevices(deviceAccu.ids)));
          const state = getState();
          const inventoryDeviceIds = Object.keys(state.devices.byId);
          if (inventoryDeviceIds.length === state.devices.total) {
            tasks.push(dispatch(deriveInactiveDevices(deviceAccu.ids, inventoryDeviceIds)));
          }
        }
        return Promise.all(tasks);
      });
    return getAllDevices();
  }
};

export const getDeviceAuth = id => dispatch =>
  DevicesApi.get(`${deviceAuthV2}/devices/${id}`).then(res => {
    dispatch({
      type: DeviceConstants.RECEIVE_DEVICE_AUTH,
      device: res.body
    });
    return Promise.resolve(res.body);
  });

export const getDevicesWithAuth = devices => dispatch => devices.map(device => dispatch(getDeviceAuth(device.id)));

export const updateDeviceAuth = (deviceId, authId, status) => dispatch => {
  console.log('updateDeviceAuth starting');
  DevicesApi.put(`${deviceAuthV2}/devices/${deviceId}/auth/${authId}/status`, { status }).then(() => {
    console.log('updateDeviceAuth put to ' + deviceAuthV2);
    Promise.all([
      dispatch({
        type: DeviceConstants.UPDATE_DEVICE_AUTHSET,
        authId,
        deviceId,
        status
      }),
      dispatch(getDeviceAuth(deviceId))
    ]);
  });
};

export const deleteAuthset = (deviceId, authId) => dispatch =>
  DevicesApi.delete(`${deviceAuthV2}/devices/${deviceId}/auth/${authId}`).then(() =>
    Promise.all([
      dispatch({
        type: DeviceConstants.REMOVE_DEVICE_AUTHSET,
        authId,
        deviceId
      }),
      dispatch(getDeviceAuth(deviceId))
    ])
  );

export const preauthDevice = authset => dispatch =>
  DevicesApi.post(`${deviceAuthV2}/devices`, authset).then(() =>
    Promise.all([
      dispatch({
        type: DeviceConstants.ADD_DEVICE_AUTHSET,
        authset
      }),
      dispatch(getDeviceCount(DeviceConstants.DEVICE_STATES.preauth))
    ])
  );

export const decommissionDevice = deviceId => dispatch =>
  DevicesApi.delete(`${deviceAuthV2}/devices/${deviceId}`).then(() =>
    dispatch({
      type: DeviceConstants.DECOMMISION_DEVICE,
      deviceId
    })
  );
