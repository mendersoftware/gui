import pluralize from 'pluralize';

import { commonErrorHandler, setSnackbar } from '../actions/appActions';
import { getSingleDeployment } from '../actions/deploymentActions';
import { saveGlobalSettings } from '../actions/userActions';
import { auditLogsApiUrl } from '../actions/organizationActions';
import GeneralApi, { headerNames, MAX_PAGE_SIZE } from '../api/general-api';
import DeviceConstants from '../constants/deviceConstants';

import { extractErrorMessage, getSnackbarMessage, mapDeviceAttributes } from '../helpers';

// default per page until pagination and counting integrated
const defaultPerPage = 20;
const defaultPage = 1;

const apiUrl = '/api/management/v1';
const apiUrlV2 = '/api/management/v2';
export const deviceAuthV2 = `${apiUrlV2}/devauth`;
export const deviceConnect = `${apiUrl}/deviceconnect`;
export const inventoryApiUrl = `${apiUrl}/inventory`;
export const inventoryApiUrlV2 = `${apiUrlV2}/inventory`;
export const deviceConfig = `${apiUrl}/deviceconfig/configurations/device`;

const defaultAttributes = [
  { scope: 'identity', attribute: 'status' },
  { scope: 'inventory', attribute: 'artifact_name' },
  { scope: 'inventory', attribute: 'device_type' },
  { scope: 'inventory', attribute: 'rootfs-image.version' },
  { scope: 'system', attribute: 'created_ts' },
  { scope: 'system', attribute: 'updated_ts' }
];

export const getGroups = () => (dispatch, getState) =>
  GeneralApi.get(`${inventoryApiUrl}/groups?status=${DeviceConstants.DEVICE_STATES.accepted}`).then(res => {
    const state = getState().devices.groups.byId;
    const groups = res.data.reduce((accu, group) => {
      accu[group] = { deviceIds: [], filters: [], total: 0, ...state[group] };
      return accu;
    }, {});
    return Promise.all([
      dispatch({
        type: DeviceConstants.RECEIVE_GROUPS,
        groups
      }),
      dispatch({
        type: DeviceConstants.ADD_DYNAMIC_GROUP,
        groupName: DeviceConstants.UNGROUPED_GROUP.id,
        group: {
          deviceIds: [],
          total: 0,
          ...getState().devices.groups.byId[DeviceConstants.UNGROUPED_GROUP.id],
          filters: [{ key: 'group', value: res.data, operator: '$nin', scope: 'system' }]
        }
      })
    ]);
  });

export const initializeGroupsDevices = () => (dispatch, getState) =>
  Promise.all(Object.keys(getState().devices.groups.byId).map(group => dispatch(getGroupDevices(group, 1, 1))));

export const addDevicesToGroup = (group, deviceIds) => dispatch =>
  GeneralApi.patch(`${inventoryApiUrl}/groups/${group}/devices`, deviceIds).then(() =>
    Promise.resolve(
      dispatch({
        type: DeviceConstants.ADD_TO_GROUP,
        group,
        deviceIds
      })
    )
  );

export const removeDevicesFromGroup = (group, deviceIds) => dispatch =>
  GeneralApi.delete(`${inventoryApiUrl}/groups/${group}/devices`, deviceIds).then(() =>
    Promise.all([
      dispatch({
        type: DeviceConstants.REMOVE_FROM_GROUP,
        group,
        deviceIds
      }),
      dispatch(setSnackbar(`The ${pluralize('devices', deviceIds.length)} ${pluralize('were', deviceIds.length)} removed from the group`, 5000))
    ])
  );

export const addStaticGroup = (group, deviceIds) => (dispatch, getState) =>
  Promise.resolve(dispatch(addDevicesToGroup(group, deviceIds)))
    .then(() =>
      Promise.resolve(
        dispatch({
          type: DeviceConstants.ADD_STATIC_GROUP,
          group: { deviceIds: [], total: 0, filters: [], ...getState().devices.groups.byId[group] },
          groupName: group
        })
      ).then(() =>
        Promise.all([
          dispatch(selectDevice()),
          dispatch(selectGroup(group)),
          dispatch(getGroups()),
          dispatch(setSnackbar('The group was updated successfully', 5000))
        ])
      )
    )
    .catch(err => commonErrorHandler(err, `Group could not be updated:`, dispatch));

export const removeStaticGroup = groupName => (dispatch, getState) => {
  const { deviceIds } = getState().devices.groups.byId[groupName];
  return Promise.resolve(dispatch(removeDevicesFromGroup(groupName, deviceIds))).then(() => {
    const selectedGroup = getState().devices.groups.selectedGroup === groupName ? undefined : getState().devices.groups.selectedGroup;
    let groups = { ...getState().devices.groups.byId };
    delete groups[groupName];
    return Promise.all([
      dispatch({
        type: DeviceConstants.REMOVE_STATIC_GROUP,
        groups
      }),
      dispatch(getGroups()),
      dispatch(selectGroup(selectedGroup)),
      dispatch(setSnackbar('Group was removed successfully', 5000))
    ]);
  });
};

// for some reason these functions can not be stored in the deviceConstants...
const filterProcessors = {
  $gt: val => Number(val) || val,
  $gte: val => Number(val) || val,
  $lt: val => Number(val) || val,
  $lte: val => Number(val) || val,
  $in: val => ('' + val).split(',').map(i => i.trim()),
  $nin: val => ('' + val).split(',').map(i => i.trim()),
  $exists: () => 1,
  $nexists: () => 0
};
const filterAliases = {
  $nexists: '$exists'
};
const mapFiltersToTerms = filters =>
  filters.map(filter => ({
    scope: filter.scope,
    attribute: filter.key,
    type: filterAliases[filter.operator] || filter.operator,
    value: filterProcessors.hasOwnProperty(filter.operator) ? filterProcessors[filter.operator](filter.value) : filter.value
  }));
const mapTermsToFilters = terms => terms.map(term => ({ scope: term.scope, key: term.attribute, operator: term.type, value: term.value }));

export const getDynamicGroups = () => (dispatch, getState) =>
  GeneralApi.get(`${inventoryApiUrlV2}/filters?per_page=${MAX_PAGE_SIZE}`).then(({ data: filters }) => {
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

export const addDynamicGroup = (groupName, filterPredicates) => (dispatch, getState) =>
  GeneralApi.post(`${inventoryApiUrlV2}/filters`, { name: groupName, terms: mapFiltersToTerms(filterPredicates) })
    .then(res =>
      Promise.resolve(
        dispatch({
          type: DeviceConstants.ADD_DYNAMIC_GROUP,
          groupName,
          group: {
            deviceIds: [],
            total: 0,
            ...getState().devices.groups.byId[groupName],
            id: res.headers[headerNames.location].substring(res.headers[headerNames.location].lastIndexOf('/') + 1),
            filters: filterPredicates
          }
        })
      ).then(() => Promise.all([dispatch(selectGroup(groupName)), dispatch(setSnackbar('The group was updated successfully', 5000))]))
    )
    .catch(err => commonErrorHandler(err, `Group could not be updated:`, dispatch));

export const updateDynamicGroup = (groupName, filterPredicates) => (dispatch, getState) => {
  const filterId = getState().devices.groups.byId[groupName].id;
  return GeneralApi.delete(`${inventoryApiUrlV2}/filters/${filterId}`).then(() => Promise.resolve(dispatch(addDynamicGroup(groupName, filterPredicates))));
};

export const removeDynamicGroup = groupName => (dispatch, getState) => {
  let groups = { ...getState().devices.groups.byId };
  const filterId = groups[groupName].id;
  const selectedGroup = getState().devices.groups.selectedGroup === groupName ? undefined : getState().devices.groups.selectedGroup;
  return Promise.all([GeneralApi.delete(`${inventoryApiUrlV2}/filters/${filterId}`), dispatch(selectGroup(selectedGroup))]).then(() => {
    delete groups[groupName];
    return Promise.all([
      dispatch({
        type: DeviceConstants.REMOVE_DYNAMIC_GROUP,
        groups
      }),
      dispatch(setSnackbar('Group was removed successfully', 5000))
    ]);
  });
};

/*
 * Device inventory functions
 */
export const selectGroup = (group, filters = []) => (dispatch, getState) => {
  const groupName = group === DeviceConstants.UNGROUPED_GROUP.id || group === DeviceConstants.UNGROUPED_GROUP.name ? DeviceConstants.UNGROUPED_GROUP.id : group;
  if (getState().devices.groups.selectedGroup === groupName && filters.length === 0) {
    return;
  }
  let tasks = [];
  const selectedGroup = getState().devices.groups.byId[groupName];
  if (selectedGroup && selectedGroup.filters && selectedGroup.filters.length) {
    tasks.push(dispatch({ type: DeviceConstants.SET_DEVICE_FILTERS, filters: selectedGroup.filters.concat(filters) }));
  } else {
    tasks.push(dispatch({ type: DeviceConstants.SET_DEVICE_FILTERS, filters: filters }));
  }
  const selectedGroupName = selectedGroup ? groupName : null;
  tasks.push(dispatch({ type: DeviceConstants.SELECT_GROUP, group: selectedGroupName }));
  return Promise.all(tasks);
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
      .catch(err => {
        dispatch(selectDevices([]));
        dispatch({ type: DeviceConstants.SELECT_DEVICE, deviceId: null });
        commonErrorHandler(err, `Error fetching device details.`, dispatch);
      });
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
      const { identity, inventory, system } = mapDeviceAttributes(device.attributes);
      device.attributes = stateDevice ? { ...stateDevice.attributes, ...inventory } : inventory;
      device.identity_data = stateDevice ? { ...stateDevice.identity_data, ...identity } : identity;
      device.status = status ? status : device.status || identity.status;
      device.created_ts = system.created_ts ? system.created_ts : device.created_ts || stateDevice.created_ts;
      device.updated_ts = system.updated_ts ? system.updated_ts : device.updated_ts || stateDevice.updated_ts;
      accu.devicesById[device.id] = { ...stateDevice, ...device };
      accu.ids.push(device.id);
      return accu;
    },
    { ids, devicesById: {} }
  );

export const getGroupDevices = (group, page = defaultPage, perPage = defaultPerPage, shouldSelectDevices = false, sortOptions) => (dispatch, getState) =>
  Promise.resolve(dispatch(getDevicesByStatus(DeviceConstants.DEVICE_STATES.accepted, page, perPage, shouldSelectDevices, group, sortOptions))).then(
    results => {
      if (!group) {
        return Promise.resolve();
      }
      const { deviceAccu, total } = results[results.length - 1];
      const stateGroup = getState().devices.groups.byId[group];
      if (!stateGroup && !total && !deviceAccu.ids.length) {
        return Promise.resolve();
      }
      return Promise.resolve(
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
  );

export const getAllGroupDevices = group => (dispatch, getState) => {
  if (!!group && (!getState().devices.groups.byId[group] || getState().devices.groups.byId[group].filters.length)) {
    return Promise.resolve();
  }
  const attributes = [...defaultAttributes, { scope: 'identity', attribute: getState().users.globalSettings.id_attribute || 'id' }];
  const getAllDevices = (perPage = MAX_PAGE_SIZE, page = defaultPage, devices = []) =>
    GeneralApi.post(`${inventoryApiUrlV2}/filters/search`, {
      page,
      per_page: perPage,
      filters: mapFiltersToTerms([
        { key: 'group', value: group, operator: '$eq', scope: 'system' },
        { key: 'status', value: DeviceConstants.DEVICE_STATES.accepted, operator: '$eq', scope: 'identity' }
      ]),
      attributes
    }).then(res => {
      const state = getState();
      const deviceAccu = reduceReceivedDevices(res.data, devices, state);
      dispatch({
        type: DeviceConstants.RECEIVE_DEVICES,
        devicesById: deviceAccu.devicesById
      });
      const total = Number(res.headers[headerNames.total]);
      if (total > perPage * page) {
        return getAllDevices(perPage, page + 1, deviceAccu.ids);
      }
      return Promise.resolve(
        dispatch({
          type: DeviceConstants.RECEIVE_GROUP_DEVICES,
          group: {
            filters: [],
            ...state.devices.groups.byId[group],
            deviceIds: deviceAccu.ids,
            total: deviceAccu.ids.length
          },
          groupName: group
        })
      );
    });
  return getAllDevices();
};

export const getAllDynamicGroupDevices = group => (dispatch, getState) => {
  if (!!group && (!getState().devices.groups.byId[group] || !getState().devices.groups.byId[group].filters.length)) {
    return Promise.resolve();
  }
  const filters = mapFiltersToTerms([
    ...getState().devices.groups.byId[group].filters,
    { key: 'status', value: DeviceConstants.DEVICE_STATES.accepted, operator: '$eq', scope: 'identity' }
  ]);
  const attributes = [...defaultAttributes, { scope: 'identity', attribute: getState().users.globalSettings.id_attribute || 'id' }];
  const getAllDevices = (perPage = MAX_PAGE_SIZE, page = defaultPage, devices = []) =>
    GeneralApi.post(`${inventoryApiUrlV2}/filters/search`, { page, per_page: perPage, filters, attributes }).then(res => {
      const state = getState();
      const deviceAccu = reduceReceivedDevices(res.data, devices, state);
      dispatch({
        type: DeviceConstants.RECEIVE_DEVICES,
        devicesById: deviceAccu.devicesById
      });
      const total = Number(res.headers['x-total-count']);
      if (total > deviceAccu.ids.length) {
        return getAllDevices(perPage, page + 1, deviceAccu.ids);
      }
      return Promise.resolve(
        dispatch({
          type: DeviceConstants.RECEIVE_GROUP_DEVICES,
          group: {
            ...state.devices.groups.byId[group],
            deviceIds: deviceAccu.ids,
            total
          },
          groupName: group
        })
      );
    });
  return getAllDevices();
};

export const setDeviceFilters = filters => dispatch =>
  dispatch({
    type: DeviceConstants.SET_DEVICE_FILTERS,
    filters
  });

export const getDeviceById = id => dispatch =>
  GeneralApi.get(`${inventoryApiUrl}/devices/${id}`)
    .then(res => {
      const device = { ...res.data, attributes: mapDeviceAttributes(res.data.attributes).inventory };
      delete device.updated_ts;
      dispatch({
        type: DeviceConstants.RECEIVE_DEVICE,
        device
      });
      return Promise.resolve(device);
    })
    .catch(err => {
      const errMsg = extractErrorMessage(err);
      if (errMsg.startsWith('Device not found')) {
        console.log(`${id} does not have any inventory information`);
        return;
      }
      return err;
    });

const deriveInactiveDevices = deviceIds => (dispatch, getState) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdaysIsoString = yesterday.toISOString();
  const state = getState().devices;
  // now boil the list down to the ones that were not updated since yesterday
  const devices = deviceIds.reduce(
    (accu, id) => {
      const device = state.byId[id];
      if (device && device.updated_ts > yesterdaysIsoString) {
        accu.active.push(id);
      } else {
        accu.inactive.push(id);
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

/*
    Device Auth + admission
  */
export const getDeviceCount = status => dispatch =>
  GeneralApi.post(`${inventoryApiUrlV2}/filters/search`, {
    page: 1,
    per_page: 1,
    filters: mapFiltersToTerms([{ key: 'status', value: status, operator: '$eq', scope: 'identity' }]),
    attributes: defaultAttributes
  }).then(response => {
    const count = Number(response.headers[headerNames.total]);
    switch (status) {
      case DeviceConstants.DEVICE_STATES.accepted:
      case DeviceConstants.DEVICE_STATES.pending:
      case DeviceConstants.DEVICE_STATES.preauth:
      case DeviceConstants.DEVICE_STATES.rejected:
        return dispatch({ type: DeviceConstants[`SET_${status.toUpperCase()}_DEVICES_COUNT`], count, status });
      default:
        return dispatch({ type: DeviceConstants.SET_TOTAL_DEVICES, count });
    }
  });

export const getAllDeviceCounts = () => dispatch => Promise.all(Object.values(DeviceConstants.DEVICE_STATES).map(status => dispatch(getDeviceCount(status))));

export const getDeviceLimit = () => dispatch =>
  GeneralApi.get(`${deviceAuthV2}/limits/max_devices`).then(res =>
    dispatch({
      type: DeviceConstants.SET_DEVICE_LIMIT,
      limit: res.data.limit
    })
  );

// get devices from inventory
export const getDevicesByStatus = (status, page = defaultPage, perPage = defaultPerPage, shouldSelectDevices = false, group, sortOptions) => (
  dispatch,
  getState
) => {
  let applicableFilters = getState().devices.filters || [];
  if (typeof group === 'string' && !applicableFilters.length) {
    applicableFilters = [{ key: 'group', value: group, operator: '$eq', scope: 'system' }];
  }
  const attributes = [...defaultAttributes, { scope: 'identity', attribute: getState().users.globalSettings.id_attribute || 'id' }];
  return GeneralApi.post(`${inventoryApiUrlV2}/filters/search`, {
    page,
    per_page: perPage,
    filters: mapFiltersToTerms([...applicableFilters, { key: 'status', value: status, operator: '$eq', scope: 'identity' }]),
    sort: sortOptions,
    attributes
  })
    .then(response => {
      const state = getState();
      const deviceAccu = reduceReceivedDevices(response.data, [], state, status);
      let total = !applicableFilters.length ? Number(response.headers[headerNames.total]) : null;
      if (state.devices.byStatus[status].total === deviceAccu.ids.length) {
        total = deviceAccu.ids.length;
      }
      let tasks = [
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
      // for each device, get device identity info
      const receivedDevices = Object.values(deviceAccu.devicesById);
      if (receivedDevices.length) {
        tasks.push(dispatch(getDevicesWithAuth(receivedDevices)));
      }
      if (shouldSelectDevices) {
        tasks.push(dispatch(selectDevices(deviceAccu.ids)));
      }
      tasks.push(Promise.resolve({ deviceAccu, total: Number(response.headers[headerNames.total]) }));
      return Promise.all(tasks);
    })
    .catch(err => commonErrorHandler(err, `${status} devices couldn't be loaded.`, dispatch, 'Please check your connection.'));
};

export const getAllDevicesByStatus = status => (dispatch, getState) => {
  const attributes = [...defaultAttributes, { scope: 'identity', attribute: getState().users.globalSettings.id_attribute || 'id' }];
  const getAllDevices = (perPage = MAX_PAGE_SIZE, page = 1, devices = []) =>
    GeneralApi.post(`${inventoryApiUrlV2}/filters/search`, {
      page,
      per_page: perPage,
      filters: mapFiltersToTerms([{ key: 'status', value: status, operator: '$eq', scope: 'identity' }]),
      attributes
    }).then(res => {
      const deviceAccu = reduceReceivedDevices(res.data, devices, getState(), status);
      dispatch({
        type: DeviceConstants.RECEIVE_DEVICES,
        devicesById: deviceAccu.devicesById
      });
      const total = Number(res.headers[headerNames.total]);
      if (total > perPage * page) {
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
      if (status === DeviceConstants.DEVICE_STATES.accepted && deviceAccu.ids.length === total) {
        tasks.push(dispatch(deriveInactiveDevices(deviceAccu.ids)));
      }
      return Promise.all(tasks);
    });
  return getAllDevices();
};

export const getDeviceAttributes = () => dispatch =>
  GeneralApi.get(`${inventoryApiUrlV2}/filters/attributes`).then(({ data }) => {
    const { inventory: inventoryAttributes, identity: identityAttributes } = (data || []).reduce(
      (accu, item) => {
        if (!accu[item.scope]) {
          accu[item.scope] = [];
        }
        accu[item.scope].push(item.name);
        return accu;
      },
      { inventory: [], identity: [] }
    );
    return dispatch({
      type: DeviceConstants.SET_FILTER_ATTRIBUTES,
      attributes: { identityAttributes, inventoryAttributes }
    });
  });

export const getDeviceConnect = id => dispatch =>
  GeneralApi.get(`${deviceConnect}/devices/${id}`).then(({ data }) => {
    let tasks = [
      dispatch({
        type: DeviceConstants.RECEIVE_DEVICE_CONNECT,
        device: data
      })
    ];
    tasks.push(Promise.resolve(data));
    return Promise.all(tasks);
  });

export const getSessionDetails = (sessionId, deviceId, userId, startDate, endDate) => () => {
  const createdAfter = startDate ? `&created_after=${Math.round(Date.parse(startDate) / 1000)}` : '';
  const createdBefore = endDate ? `&created_before=${Math.round(Date.parse(endDate) / 1000)}` : '';
  const objectSearch = `&object_id=${deviceId}`;
  return GeneralApi.get(`${auditLogsApiUrl}/logs?per_page=500${createdAfter}${createdBefore}&actor_id=${userId}${objectSearch}`).then(
    ({ data: auditLogEntries }) => {
      const { start, end } = auditLogEntries.reduce(
        (accu, item) => {
          if (item.meta.session_id.includes(sessionId)) {
            accu.start = new Date(item.action.startsWith('open') ? item.time : accu.start);
            accu.end = new Date(item.action.startsWith('close') ? item.time : accu.end);
          }
          return accu;
        },
        { start: startDate, end: endDate }
      );
      return Promise.resolve({ start, end });
    }
  );
};

export const getDeviceAuth = id => dispatch => Promise.resolve(dispatch(getDevicesWithAuth([{ id }]))).then(results => Promise.resolve(results[1][0]));

export const getDevicesWithAuth = devices => dispatch =>
  devices.length
    ? GeneralApi.get(`${deviceAuthV2}/devices?id=${devices.map(device => device.id).join('&id=')}`)
        .then(({ data: receivedDevices }) => {
          let tasks = receivedDevices.map(device => dispatch({ type: DeviceConstants.RECEIVE_DEVICE_AUTH, device }));
          tasks.push(Promise.resolve(receivedDevices));
          return Promise.all(tasks);
        })
        .catch(err => console.log(`Error: ${err}`))
    : Promise.resolve([[], []]);

const maybeUpdateDevicesByStatus = (devicesState, deviceId, authId, dispatch) => {
  const device = devicesState.byId[deviceId];
  const hasMultipleAuthSets = authId ? device.auth_sets.filter(authset => authset.id !== authId).length > 0 : false;
  if (!hasMultipleAuthSets) {
    const deviceIds = devicesState.byStatus[device.status].deviceIds.filter(id => id !== deviceId);
    return Promise.resolve(
      dispatch({
        type: DeviceConstants[`SET_${device.status.toUpperCase()}_DEVICES`],
        deviceIds,
        status: device.status,
        total: Math.max(0, devicesState.byStatus[device.status].total - 1)
      })
    );
  }
  return Promise.resolve();
};

export const updateDeviceAuth = (deviceId, authId, status) => (dispatch, getState) =>
  GeneralApi.put(`${deviceAuthV2}/devices/${deviceId}/auth/${authId}/status`, { status })
    .then(() => {
      let tasks = [dispatch(getDeviceAuth(deviceId)), dispatch(setSnackbar('Device authorization status was updated successfully'))];
      tasks.push(maybeUpdateDevicesByStatus(getState().devices, deviceId, authId, dispatch));
      return Promise.all(tasks);
    })
    .catch(err => commonErrorHandler(err, 'There was a problem updating the device authorization status:', dispatch));

export const updateDevicesAuth = (deviceIds, status) => (dispatch, getState) => {
  let devices = getState().devices.byId;
  const deviceIdsWithoutAuth = deviceIds.reduce((accu, id) => (devices[id].auth_sets ? accu : [...accu, { id }]), []);
  return dispatch(getDevicesWithAuth(deviceIdsWithoutAuth)).then(() => {
    devices = getState().devices.byId;
    // for each device, get id and id of authset & make api call to accept
    // if >1 authset, skip instead
    const deviceAuthUpdates = deviceIds.map(id => {
      const device = devices[id];
      if (device.auth_sets.length !== 1) {
        return Promise.reject();
      }
      // api call device.id and device.authsets[0].id
      return dispatch(updateDeviceAuth(device.id, device.auth_sets[0].id, status)).catch(err =>
        commonErrorHandler(err, 'The action was stopped as there was a problem updating a device authorization status: ', dispatch)
      );
    });
    return Promise.allSettled(deviceAuthUpdates).then(results => {
      const { skipped, count } = results.reduce(
        (accu, item) => {
          if (item.status === 'rejected') {
            accu.skipped = accu.skipped + 1;
          } else {
            accu.count = accu.count + 1;
          }
          return accu;
        },
        { skipped: 0, count: 0 }
      );
      const message = getSnackbarMessage(skipped, count);
      // break if an error occurs, display status up til this point before error message
      return dispatch(setSnackbar(message));
    });
  });
};

export const deleteAuthset = (deviceId, authId) => (dispatch, getState) =>
  GeneralApi.delete(`${deviceAuthV2}/devices/${deviceId}/auth/${authId}`)
    .then(() => {
      let tasks = [dispatch(setSnackbar('Device authorization status was updated successfully'))];
      tasks.push(maybeUpdateDevicesByStatus(getState().devices, deviceId, authId, dispatch));
      return Promise.all(tasks);
    })
    .catch(err => commonErrorHandler(err, 'There was a problem updating the device authorization status:', dispatch));

export const preauthDevice = authset => dispatch =>
  GeneralApi.post(`${deviceAuthV2}/devices`, authset)
    .catch(err => {
      if (err.response.status === 409) {
        return Promise.reject('A device with a matching identity data set already exists');
      }
      commonErrorHandler(err, 'The device could not be added:', dispatch);
      return Promise.reject();
    })
    .then(() => Promise.resolve(dispatch(setSnackbar('Device was successfully added to the preauthorization list', 5000))));

export const decommissionDevice = deviceId => (dispatch, getState) =>
  GeneralApi.delete(`${deviceAuthV2}/devices/${deviceId}`)
    .then(() => {
      let tasks = [dispatch(setSnackbar('Device was decommissioned successfully'))];
      tasks.push(maybeUpdateDevicesByStatus(getState().devices, deviceId, null, dispatch));
      return Promise.all(tasks);
    })
    .catch(err => commonErrorHandler(err, 'There was a problem decommissioning the device:', dispatch));

export const getDeviceConfig = deviceId => (dispatch, getState) =>
  GeneralApi.get(`${deviceConfig}/${deviceId}`)
    .then(({ data }) => {
      const device = {
        ...getState().devices.byId[deviceId],
        config: data
      };
      let tasks = [
        dispatch({
          type: DeviceConstants.RECEIVE_DEVICE_CONFIG,
          device
        })
      ];
      tasks.push(Promise.resolve(data));
      return Promise.all(tasks);
    })
    .catch(err => {
      // if we get a proper error response we most likely queried a device without an existing config check-in and we can just ignore the call
      if (err.response?.data?.error.status_code !== 404) {
        return commonErrorHandler(err, `There was an error retrieving the configuration for device ${deviceId}.`, dispatch, 'Please check your connection.');
      }
    });

export const setDeviceConfig = (deviceId, config) => dispatch =>
  GeneralApi.put(`${deviceConfig}/${deviceId}`, config)
    .catch(err => commonErrorHandler(err, `There was an error setting the configuration for device ${deviceId}.`, dispatch, 'Please check your connection.'))
    .then(() => Promise.resolve(dispatch(getDeviceConfig(deviceId))));

export const applyDeviceConfig = (deviceId, config, isDefault) => (dispatch, getState) =>
  GeneralApi.post(`${deviceConfig}/${deviceId}/deploy`, config)
    .catch(err => commonErrorHandler(err, `There was an error deploying the configuration to device ${deviceId}.`, dispatch, 'Please check your connection.'))
    .then(({ data }) => {
      let tasks = [dispatch(getSingleDeployment(data.deployment_id))];
      if (isDefault) {
        const { previous } = getState().users.globalSettings.defaultDeviceConfig;
        tasks.push(dispatch(saveGlobalSettings({ defaultDeviceConfig: { current: config, previous } })));
      }
      return Promise.all(tasks);
    });
