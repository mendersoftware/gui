import parse from 'parse-link-header';

import DevicesApi from '../api/devices-api';
import * as DeviceConstants from '../constants/deviceConstants';
import { deriveAttributesFromDevices, duplicateFilter, filterDevices, mapDeviceAttributes } from '../helpers';

// default per page until pagination and counting integrated
const defaultPerPage = 20;
const defaultPage = 1;

const apiUrl = '/api/management/v1';
const apiUrlV2 = '/api/management/v2';
const deviceAuthV2 = `${apiUrlV2}/devauth`;
const inventoryApiUrl = `${apiUrl}/inventory`;
const inventoryApiUrlV2 = `${apiUrlV2}/inventory`;

export const getGroups = () => (dispatch, getState) =>
  DevicesApi.get(`${inventoryApiUrl}/groups`).then(res => {
    const state = getState().devices.groups.byId;
    const groups = res.body.reduce((accu, group) => {
      accu[group] = { deviceIds: [], filters: [], total: 0, ...state[group] };
      return accu;
    }, {});
    return Promise.resolve(
      dispatch({
        type: DeviceConstants.RECEIVE_GROUPS,
        groups
      })
    );
  });

export const initializeGroupsDevices = () => (dispatch, getState) =>
  Promise.all(Object.keys(getState().devices.groups.byId).map(group => dispatch(getGroupDevices(group, 1, 1))));

export const addDeviceToGroup = (group, deviceId) => dispatch =>
  DevicesApi.put(`${inventoryApiUrl}/devices/${deviceId}/group`, { group: encodeURIComponent(group) }).then(() =>
    Promise.resolve(
      dispatch({
        type: DeviceConstants.ADD_TO_GROUP,
        group,
        deviceId
      })
    )
  );

export const removeDeviceFromGroup = (deviceId, group) => dispatch =>
  DevicesApi.delete(`${inventoryApiUrl}/devices/${deviceId}/group/${group}`).then(() =>
    Promise.resolve(
      dispatch({
        type: DeviceConstants.REMOVE_FROM_GROUP,
        group,
        deviceId
      })
    )
  );

export const addStaticGroup = (group, deviceIds) => (dispatch, getState) =>
  Promise.all(deviceIds.map(id => dispatch(addDeviceToGroup(group, id)))).then(() =>
    Promise.resolve(
      dispatch({
        type: DeviceConstants.ADD_STATIC_GROUP,
        group: { deviceIds: [], total: 0, filters: [], ...getState().devices.groups.byId[group] },
        groupName: group
      })
    ).then(() => Promise.all([dispatch(selectDevice()), dispatch(selectGroup(group))]))
  );

export const removeStaticGroup = groupName => (dispatch, getState) => {
  const { deviceIds } = getState().devices.groups.byId[groupName];
  const selectedGroup = getState().devices.groups.selectedGroup === groupName ? undefined : getState().devices.groups.selectedGroup;
  return Promise.all(
    deviceIds.reduce(
      (accu, id) => {
        accu.push(dispatch(removeDeviceFromGroup(id, groupName)));
        return accu;
      },
      [dispatch(selectGroup(selectedGroup))]
    )
  ).then(() => {
    let groups = getState().devices.groups.byId;
    delete groups[groupName];
    return Promise.resolve(
      dispatch({
        type: DeviceConstants.REMOVE_STATIC_GROUP,
        groups
      })
    );
  });
};

// for some reason these functions can not be stored in the deviceConstants...
const filterProcessors = {
  $eq: val => val,
  $ne: val => val,
  $gt: val => Number(val),
  $gte: val => Number(val),
  $lt: val => Number(val),
  $lte: val => Number(val),
  $in: val => ('' + val).split(','),
  $nin: val => ('' + val).split(',')
};
const mapFiltersToTerms = filters =>
  filters.map(filter => ({
    scope: filter.scope,
    attribute: filter.key,
    type: filter.operator,
    value: filterProcessors[filter.operator](filter.value)
  }));
const mapTermsToFilters = terms => terms.map(term => ({ scope: term.scope, key: term.attribute, operator: term.type, value: term.value }));

export const getDynamicGroups = () => (dispatch, getState) =>
  DevicesApi.get(`${inventoryApiUrlV2}/filters`).then(({ body: filters }) => {
    const state = getState().devices.groups.byId;
    const groups = (filters || []).reduce((accu, filter) => {
      accu[filter.name] = {
        deviceIds: [],
        total: 0,
        ...state[filter.name],
        id: filter.id,
        filters: mapTermsToFilters(filter.terms)
      };
      return accu;
    }, {});
    return Promise.resolve(
      dispatch({
        type: DeviceConstants.RECEIVE_DYNAMIC_GROUPS,
        groups
      })
    );
  });

export const getDynamicGroup = groupName => (dispatch, getState) => {
  const filterId = getState().devices.groups.byId[groupName].id;
  return DevicesApi.get(`${inventoryApiUrlV2}/filters/${filterId}`).then(filter =>
    Promise.resolve(
      dispatch({
        type: DeviceConstants.ADD_DYNAMIC_GROUP,
        groupName,
        group: {
          deviceIds: [],
          total: 0,
          ...getState().devices.groups.byId[groupName],
          id: filterId,
          filters: mapTermsToFilters(filter.terms)
        }
      })
    )
  );
};

export const addDynamicGroup = (groupName, filterPredicates) => (dispatch, getState) =>
  DevicesApi.post(`${inventoryApiUrlV2}/filters`, { name: groupName, terms: mapFiltersToTerms(filterPredicates) }).then(res =>
    Promise.resolve(
      dispatch({
        type: DeviceConstants.ADD_DYNAMIC_GROUP,
        groupName,
        group: {
          deviceIds: [],
          total: 0,
          ...getState().devices.groups.byId[groupName],
          id: res.headers['location'].substring(res.headers['location'].lastIndexOf('/') + 1),
          filters: filterPredicates
        }
      })
    ).then(() => Promise.resolve(dispatch(selectGroup(groupName))))
  );

export const updateDynamicGroup = (groupName, filterPredicates) => (dispatch, getState) => {
  const filterId = getState().devices.groups.byId[groupName].id;
  return DevicesApi.delete(`${inventoryApiUrlV2}/filters/${filterId}`).then(() => Promise.resolve(dispatch(addDynamicGroup(groupName, filterPredicates))));
};

export const removeDynamicGroup = groupName => (dispatch, getState) => {
  const filterId = getState().devices.groups.byId[groupName].id;
  const selectedGroup = getState().devices.groups.selectedGroup === groupName ? undefined : getState().devices.groups.selectedGroup;
  let groups = getState().devices.groups.byId;
  delete groups[groupName];
  return Promise.all([DevicesApi.delete(`${inventoryApiUrlV2}/filters/${filterId}`), dispatch(selectGroup(selectedGroup))]).then(() =>
    Promise.resolve(
      dispatch({
        type: DeviceConstants.REMOVE_DYNAMIC_GROUP,
        groups
      })
    )
  );
};

/*
 * Device inventory functions
 */
export const selectGroup = group => (dispatch, getState) => {
  let selectedGroup = getState().devices.groups.byId[group];
  let tasks = [];
  if (selectedGroup && selectedGroup.filters && selectedGroup.filters.length) {
    tasks.push(dispatch({ type: DeviceConstants.SET_DEVICE_FILTERS, filters: selectedGroup.filters }));
  } else {
    tasks.push(dispatch({ type: DeviceConstants.SET_DEVICE_FILTERS, filters: [] }));
  }
  selectedGroup = getState().devices.groups.byId[group] ? group : null;
  tasks.push(dispatch({ type: DeviceConstants.SELECT_GROUP, group: selectedGroup }));
  return Promise.all(tasks);
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
        device.attributes = stateDevice ? { ...stateDevice.attributes } : { device_type: '', artifact_name: '' };
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

export const getGroupDevices = (group, page = defaultPage, perPage = defaultPerPage, shouldSelectDevices = false) => (dispatch, getState) =>
  Promise.resolve(dispatch(getInventoryDevices(page, perPage, [], group))).then(results => {
    const { deviceAccu, total } = results[results.length - 1];
    let tasks = [];
    if (group.length) {
      const stateGroup = getState().devices.groups.byId[group];
      tasks.push(
        dispatch({
          type: DeviceConstants.RECEIVE_GROUP_DEVICES,
          group: {
            filters: [],
            ...stateGroup,
            deviceIds: deviceAccu.ids.length === total || deviceAccu.ids.length > stateGroup.deviceIds ? deviceAccu.ids : stateGroup.deviceIds,
            total
          },
          groupName: group
        })
      );
    }
    if (shouldSelectDevices) {
      tasks.push(dispatch(selectDevices(deviceAccu.ids)));
    }
    return Promise.all(tasks);
  });

export const getAllGroupDevices = group => (dispatch, getState) => {
  const state = getState();
  if (group && (!state.devices.groups[group] || state.devices.groups[group].filters.length)) {
    return Promise.resolve();
  }
  const forGroup = group ? `&group=${group}` : '&has_group=false';
  const getAllDevices = (perPage = 500, page = defaultPage, devices = []) =>
    DevicesApi.get(`${inventoryApiUrl}/devices?per_page=${perPage}&page=${page}${forGroup}`).then(res => {
      const links = parse(res.headers['link']);
      const deviceAccu = reduceReceivedDevices(res.body, devices, state);
      dispatch({
        type: DeviceConstants.RECEIVE_DEVICES,
        devicesById: deviceAccu.devicesById
      });
      if (links.next) {
        return getAllDevices(perPage, page + 1, deviceAccu.ids);
      }
      return Promise.resolve(
        dispatch({
          type: DeviceConstants.RECEIVE_GROUP_DEVICES,
          group: {
            filters: [],
            ...state.devices.groups[group],
            deviceIds: deviceAccu.ids,
            total: deviceAccu.ids.length
          },
          groupName: group
        })
      );
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

// TODO: refactor this using the v2 /filters/search endpoint to allow bulk retrieval once id filtering is possible
export const getDevicesWithInventory = devices => dispatch =>
  Promise.all(devices.map(device => dispatch(getDeviceById(device.id)))).then(deviceList => {
    if (deviceList.length && deviceList.length < 200) {
      return Promise.resolve(dispatch(setFilterAttributes(deriveAttributesFromDevices(deviceList))));
    }
    return Promise.resolve();
  });

export const getInventoryDevices = (page = defaultPage, perPage = defaultPerPage, filters, group = false) => (dispatch, getState) => {
  const state = getState();
  let request;
  if (group && state.devices.groups.byId[group].filters.length) {
    const groupFilters = state.devices.filters; // use non-grouped filters here, since the group filters are reflected in these + possible modifications
    request = DevicesApi.post(`${inventoryApiUrlV2}/filters/search`, { page, per_page: perPage, filters: mapFiltersToTerms(groupFilters) });
  } else if (typeof group === 'string') {
    const forGroup = group.length ? `&group=${group}` : '&has_group=false';
    request = DevicesApi.get(`${inventoryApiUrl}/devices?per_page=${perPage}&page=${page}${forGroup}`);
  } else {
    request = DevicesApi.post(`${inventoryApiUrlV2}/filters/search`, { page, per_page: perPage, filters: mapFiltersToTerms(filters) });
  }
  return request.then(res => {
    const deviceAccu = reduceReceivedDevices(res.body || [], [], state);
    let tasks = [
      dispatch({
        type: DeviceConstants.RECEIVE_DEVICES,
        devicesById: deviceAccu.devicesById
      })
    ];
    if (typeof group !== 'string') {
      // for each device, get device identity info
      tasks.push(dispatch(getDevicesWithAuth(Object.values(deviceAccu.devicesById))));
    }
    tasks.push(Promise.resolve({ deviceAccu, total: Number(res.headers['x-total-count']) }));
    return Promise.all(tasks);
  });
};

// get devices from inventory
export const getDevices = (page = defaultPage, perPage = defaultPerPage, filters, shouldSelectDevices = false) => dispatch =>
  Promise.resolve(dispatch(getInventoryDevices(page, perPage, filters))).then(results => {
    const { deviceAccu } = results[results.length - 1];
    let tasks = [];
    if (deviceAccu.ids.length < 200) {
      tasks.push(dispatch(setFilterAttributes(deriveAttributesFromDevices(Object.values(deviceAccu.devicesById)))));
    }
    if (shouldSelectDevices) {
      tasks.push(dispatch(selectDevices(deviceAccu.ids)));
    }
    return Promise.all(tasks);
  });

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

export const getAllDeviceCounts = () => dispatch => Promise.all(Object.values(DeviceConstants.DEVICE_STATES).map(status => dispatch(getDeviceCount(status))));

export const getDeviceLimit = () => dispatch =>
  DevicesApi.get(`${deviceAuthV2}/limits/max_devices`).then(res =>
    dispatch({
      type: DeviceConstants.SET_DEVICE_LIMIT,
      limit: res.body.limit
    })
  );

export const getDevicesByStatus = (status, page = defaultPage, perPage = defaultPerPage, shouldSelectDevices = false) => (dispatch, getState) => {
  const query = DevicesApi.get(`${deviceAuthV2}/devices?${status ? `status=${status}` : ''}&per_page=${perPage}&page=${page}`);
  const filters = getState().devices.filters;
  let possibleDeviceIds = [];
  if (filters.length && shouldSelectDevices && status !== DeviceConstants.DEVICE_STATES.accepted) {
    possibleDeviceIds = filterDevices(getState().devices, filters, status);
  }
  return query.then(response => {
    let tasks = [];
    if (response.body.length < 200) {
      tasks.push(dispatch(setFilterAttributes(deriveAttributesFromDevices(response.body))));
    }
    if (!status) {
      tasks.push(
        dispatch({
          type: DeviceConstants.RECEIVE_DEVICES_LIST,
          devices: response.body
        })
      );
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
        const state = getState();
        const inventoryDeviceIds = Object.keys(state.devices.byId);
        if (inventoryDeviceIds.length === state.devices.total) {
          tasks.push(dispatch(deriveInactiveDevices(deviceAccu.ids, inventoryDeviceIds)));
        }
      }
      return Promise.all(tasks);
    });
  return getAllDevices();
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

export const updateDeviceAuth = (deviceId, authId, status) => dispatch =>
  DevicesApi.put(`${deviceAuthV2}/devices/${deviceId}/auth/${authId}/status`, { status }).then(() =>
    Promise.all([
      dispatch({
        type: DeviceConstants.UPDATE_DEVICE_AUTHSET,
        authId,
        deviceId,
        status
      }),
      dispatch(getDeviceAuth(deviceId))
    ])
  );

export const deleteAuthset = (deviceId, authId) => dispatch =>
  DevicesApi.delete(`${deviceAuthV2}/devices/${deviceId}/auth/${authId}`).then(() =>
    Promise.resolve(
      dispatch({
        type: DeviceConstants.REMOVE_DEVICE_AUTHSET,
        authId,
        deviceId
      })
    )
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
