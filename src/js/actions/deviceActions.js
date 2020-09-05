import { setSnackbar } from '../actions/appActions';
import GeneralApi, { headerNames } from '../api/general-api';
import * as DeviceConstants from '../constants/deviceConstants';
import { deriveAttributesFromDevices, duplicateFilter, getSnackbarMessage, mapDeviceAttributes, preformatWithRequestID } from '../helpers';

// default per page until pagination and counting integrated
const defaultPerPage = 20;
const defaultPage = 1;

const apiUrl = '/api/management/v1';
const apiUrlV2 = '/api/management/v2';
const deviceAuthV2 = `${apiUrlV2}/devauth`;
const deviceConnect = `${apiUrl}/deviceconnect`;
const inventoryApiUrl = `${apiUrl}/inventory`;
const inventoryApiUrlV2 = `${apiUrlV2}/inventory`;

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
    Promise.resolve(
      dispatch({
        type: DeviceConstants.REMOVE_FROM_GROUP,
        group,
        deviceIds
      })
    )
  );

export const addStaticGroup = (group, deviceIds) => (dispatch, getState) =>
  Promise.resolve(dispatch(addDevicesToGroup(group, deviceIds))).then(() =>
    Promise.resolve(
      dispatch({
        type: DeviceConstants.ADD_STATIC_GROUP,
        group: { deviceIds: [], total: 0, filters: [], ...getState().devices.groups.byId[group] },
        groupName: group
      })
    ).then(() => Promise.all([dispatch(selectDevice()), dispatch(selectGroup(group)), dispatch(getGroups())]))
  );

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
      dispatch(selectGroup(selectedGroup))
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
  GeneralApi.get(`${inventoryApiUrlV2}/filters`).then(({ data: filters }) => {
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
  GeneralApi.post(`${inventoryApiUrlV2}/filters`, { name: groupName, terms: mapFiltersToTerms(filterPredicates) }).then(res =>
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
    ).then(() => Promise.resolve(dispatch(selectGroup(groupName))))
  );

export const updateDynamicGroup = (groupName, filterPredicates) => (dispatch, getState) => {
  const filterId = getState().devices.groups.byId[groupName].id;
  return GeneralApi.delete(`${inventoryApiUrlV2}/filters/${filterId}`).then(() => Promise.resolve(dispatch(addDynamicGroup(groupName, filterPredicates))));
};

export const removeDynamicGroup = groupName => (dispatch, getState) => {
  const filterId = getState().devices.groups.byId[groupName].id;
  const selectedGroup = getState().devices.groups.selectedGroup === groupName ? undefined : getState().devices.groups.selectedGroup;
  let groups = getState().devices.groups.byId;
  delete groups[groupName];
  return Promise.all([GeneralApi.delete(`${inventoryApiUrlV2}/filters/${filterId}`), dispatch(selectGroup(selectedGroup))]).then(() =>
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
  const state = getState();
  if (!!group && (!state.devices.groups.byId[group] || state.devices.groups.byId[group].filters.length)) {
    return Promise.resolve();
  }
  const getAllDevices = (perPage = 500, page = defaultPage, devices = []) =>
    GeneralApi.post(`${inventoryApiUrlV2}/filters/search`, {
      page,
      per_page: perPage,
      filters: mapFiltersToTerms([{ key: 'group', value: group, operator: '$eq', scope: 'system' }])
    }).then(res => {
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
  const state = getState();
  if (!!group && (!state.devices.groups.byId[group] || !state.devices.groups.byId[group].filters.length)) {
    return Promise.resolve();
  }
  const filters = mapFiltersToTerms(state.devices.groups.byId[group].filters);
  const getAllDevices = (perPage = 500, page = defaultPage, devices = []) =>
    GeneralApi.post(`${inventoryApiUrlV2}/filters/search`, { page, per_page: perPage, filters }).then(res => {
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
      if (err.response?.data?.error.startsWith('Device not found')) {
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
export const getDeviceCount = status => dispatch => {
  return GeneralApi.get(`${deviceAuthV2}/devices/count${status ? `?status=${status}` : ''}`).then(res => {
    switch (status) {
      case DeviceConstants.DEVICE_STATES.accepted:
      case DeviceConstants.DEVICE_STATES.pending:
      case DeviceConstants.DEVICE_STATES.preauth:
      case DeviceConstants.DEVICE_STATES.rejected:
        return dispatch({
          type: DeviceConstants[`SET_${status.toUpperCase()}_DEVICES_COUNT`],
          count: res.data.count,
          status
        });
      default:
        return dispatch({
          type: DeviceConstants.SET_TOTAL_DEVICES,
          count: res.data.count
        });
    }
  });
};

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
  const state = getState();
  let applicableFilters = state.devices.filters || [];
  if (typeof group === 'string' && !applicableFilters.length) {
    applicableFilters = [{ key: 'group', value: group, operator: '$eq', scope: 'system' }];
  }
  return GeneralApi.post(`${inventoryApiUrlV2}/filters/search`, {
    page,
    per_page: perPage,
    filters: mapFiltersToTerms([...applicableFilters, { key: 'status', value: status, operator: '$eq', scope: 'identity' }]),
    sort: sortOptions
  }).then(response => {
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
    if (response.data.length < 200) {
      tasks.push(dispatch(setFilterAttributes(deriveAttributesFromDevices(Object.values(deviceAccu.devicesById)))));
    }
    if (status === DeviceConstants.DEVICE_STATES.pending) {
      // for each device, get device identity info
      tasks.push(dispatch(getDevicesWithAuth(Object.values(deviceAccu.devicesById))));
    }
    if (shouldSelectDevices) {
      tasks.push(dispatch(selectDevices(deviceAccu.ids)));
    }
    tasks.push(Promise.resolve({ deviceAccu, total: Number(response.headers[headerNames.total]) }));
    return Promise.all(tasks);
  });
};

export const getAllDevicesByStatus = status => (dispatch, getState) => {
  const getAllDevices = (perPage = 500, page = 1, devices = []) =>
    GeneralApi.post(`${inventoryApiUrlV2}/filters/search`, {
      page,
      per_page: perPage,
      filters: mapFiltersToTerms([{ key: 'status', value: status, operator: '$eq', scope: 'identity' }])
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

export const getDeviceAuth = (id, isBulkRetrieval = false) => dispatch =>
  GeneralApi.get(`${deviceAuthV2}/devices/${id}`).then(res => {
    let tasks = [];
    if (!isBulkRetrieval) {
      tasks.push(
        dispatch({
          type: DeviceConstants.RECEIVE_DEVICE_AUTH,
          device: res.data
        })
      );
    }
    tasks.push(Promise.resolve(res.data));
    return Promise.all(tasks);
  });

export const getDeviceConnect = (id, isBulkRetrieval = false) => dispatch =>
  GeneralApi.get(`${deviceConnect}/devices/${id}`).then(res => {
    let tasks = [];
    if (!isBulkRetrieval) {
      tasks.push(
        dispatch({
          type: DeviceConstants.RECEIVE_DEVICE_CONNECT,
          device: res.data
        })
      );
    }
    tasks.push(Promise.resolve(res.data));
    return Promise.all(tasks);
  });

export const getDevicesWithAuth = devices => (dispatch, getState) =>
  Promise.all(devices.map(device => dispatch(getDeviceAuth(device.id, true)))).then(tasks => {
    const devices = tasks.map(task => task[task.length - 1]);
    const deviceAccu = reduceReceivedDevices(devices, [], getState());
    return dispatch({
      type: DeviceConstants.RECEIVE_DEVICES,
      devicesById: deviceAccu.devicesById
    });
  });

export const updateDeviceAuth = (deviceId, authId, status) => dispatch =>
  GeneralApi.put(`${deviceAuthV2}/devices/${deviceId}/auth/${authId}/status`, { status }).then(() =>
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
      return dispatch(updateDeviceAuth(device.id, device.auth_sets[0].id, status)).catch(err => {
        var errMsg = err.response.data.error.message || '';
        // notify if an error occurs
        dispatch(
          setSnackbar(
            preformatWithRequestID(err.response, `The action was stopped as there was a problem updating a device authorization status: ${errMsg}`),
            null,
            'Copy to clipboard'
          )
        );
        return Promise.reject();
      });
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

export const deleteAuthset = (deviceId, authId) => dispatch =>
  GeneralApi.delete(`${deviceAuthV2}/devices/${deviceId}/auth/${authId}`).then(() =>
    Promise.resolve(
      dispatch({
        type: DeviceConstants.REMOVE_DEVICE_AUTHSET,
        authId,
        deviceId
      })
    )
  );

export const preauthDevice = authset => dispatch =>
  GeneralApi.post(`${deviceAuthV2}/devices`, authset)
    .catch(err => {
      console.log(err);
      const errMsg = err.response.data?.error?.message || err.response.data?.error || err.error || '';
      if (err.response.status === 409) {
        return Promise.reject('A device with a matching identity data set already exists');
      }
      return Promise.all([
        dispatch(setSnackbar(preformatWithRequestID(err.response, `The device could not be added: ${errMsg}`), null, 'Copy to clipboard')),
        Promise.reject()
      ]);
    })
    .then(() => Promise.resolve(dispatch(setSnackbar('Device was successfully added to the preauthorization list', 5000))));

export const decommissionDevice = deviceId => dispatch =>
  GeneralApi.delete(`${deviceAuthV2}/devices/${deviceId}`).then(() =>
    dispatch({
      type: DeviceConstants.DECOMMISION_DEVICE,
      deviceId
    })
  );
