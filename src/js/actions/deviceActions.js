import axios from 'axios';
import pluralize from 'pluralize';

import { commonErrorFallback, commonErrorHandler, progress, setSnackbar } from '../actions/appActions';
import { getSingleDeployment } from '../actions/deploymentActions';
import { saveGlobalSettings } from '../actions/userActions';
import { auditLogsApiUrl } from '../actions/organizationActions';
import GeneralApi, { headerNames, MAX_PAGE_SIZE } from '../api/general-api';
import AppConstants from '../constants/appConstants';
import DeviceConstants, { DEVICE_ISSUE_OPTIONS, DEVICE_LIST_DEFAULTS, DEVICE_STATES } from '../constants/deviceConstants';

import { deepCompare, extractErrorMessage, getSnackbarMessage, mapDeviceAttributes } from '../helpers';
import { getIdAttribute } from '../selectors';

const { page: defaultPage, perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;

const apiUrl = '/api/management/v1';
const apiUrlV2 = '/api/management/v2';
export const deviceAuthV2 = `${apiUrlV2}/devauth`;
export const deviceConnect = `${apiUrl}/deviceconnect`;
export const inventoryApiUrl = `${apiUrl}/inventory`;
export const inventoryApiUrlV2 = `${apiUrlV2}/inventory`;
export const deviceConfig = `${apiUrl}/deviceconfig/configurations/device`;
export const reportingApiUrl = `${apiUrl}/reporting`;

const defaultAttributes = [
  { scope: 'identity', attribute: 'status' },
  { scope: 'inventory', attribute: 'artifact_name' },
  { scope: 'inventory', attribute: 'device_type' },
  { scope: 'inventory', attribute: 'rootfs-image.version' },
  { scope: 'system', attribute: 'created_ts' },
  { scope: 'system', attribute: 'updated_ts' },
  { scope: 'tags', attribute: 'name' }
];

export const getSearchEndpoint = hasReporting => {
  return hasReporting ? `${reportingApiUrl}/devices/search` : `${inventoryApiUrlV2}/filters/search`;
};

const getAttrsEndpoint = hasReporting => {
  return hasReporting ? `${reportingApiUrl}/devices/search/attributes` : `${inventoryApiUrlV2}/filters/attributes`;
};

export const getGroups = () => (dispatch, getState) =>
  GeneralApi.get(`${inventoryApiUrl}/groups`).then(res => {
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
  Promise.all(Object.keys(getState().devices.groups.byId).map(group => dispatch(getGroupDevices(group, { perPage: 1 }))));

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
    // eslint-disable-next-line no-unused-vars
    const { [groupName]: removal, ...groups } = getState().devices.groups.byId;
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
  $exists: () => true,
  $nexists: () => false
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
  GeneralApi.get(`${inventoryApiUrlV2}/filters?per_page=${MAX_PAGE_SIZE}`)
    .then(({ data: filters }) => {
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
    })
    .catch(() => console.log('Dynamic group retrieval failed - likely accessing a non-enterprise backend'));

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
  const state = getState();
  const selectedGroup = state.devices.groups.byId[groupName];
  const groupFilterLength = selectedGroup?.filters?.length || 0;
  if (state.devices.groups.selectedGroup === groupName && filters.length === 0 && !groupFilterLength) {
    return;
  }
  let tasks = [];
  if (groupFilterLength) {
    const cleanedFilters = (filters.length ? filters : selectedGroup.filters).filter(
      (item, index, array) => array.findIndex(filter => deepCompare(filter, item)) == index
    );
    tasks.push(dispatch(setDeviceFilters(cleanedFilters)));
  } else {
    tasks.push(dispatch(setDeviceFilters(filters)));
    tasks.push(dispatch(getGroupDevices(groupName, { perPage: 1, shouldIncludeAllStates: true })));
  }
  const selectedGroupName = selectedGroup || !Object.keys(state.devices.groups.byId).length ? groupName : undefined;
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
        dispatch(setDeviceListState({ deviceIds: [] }));
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

const reduceReceivedDevices = (devices, ids, state, status) =>
  devices.reduce(
    (accu, device) => {
      const stateDevice = state.devices.byId[device.id] || {};
      const { attributes: storedAttributes = {}, identity_data: storedIdentity = {}, tags: storedTags = {} } = stateDevice;
      const { identity, inventory, system = {}, tags } = mapDeviceAttributes(device.attributes);
      const { created_ts = device.created_ts || stateDevice.created_ts, updated_ts = device.updated_ts || stateDevice.updated_ts } = system;
      device.attributes = { ...storedAttributes, ...inventory };
      device.tags = { ...storedTags, ...tags };
      device.identity_data = { ...storedIdentity, ...identity };
      device.status = status ? status : device.status || identity.status;
      device.created_ts = created_ts;
      device.updated_ts = updated_ts;
      accu.devicesById[device.id] = { ...stateDevice, ...device };
      accu.ids.push(device.id);
      return accu;
    },
    { ids, devicesById: {} }
  );

export const getGroupDevices = (group, options = {}) => (dispatch, getState) => {
  const { shouldIncludeAllStates, ...remainder } = options;
  return Promise.resolve(
    dispatch(getDevicesByStatus(shouldIncludeAllStates ? undefined : DeviceConstants.DEVICE_STATES.accepted, { ...remainder, group }))
  ).then(results => {
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
  });
};

export const getAllGroupDevices = (group, shouldIncludeAllStates) => (dispatch, getState) => {
  if (!group || (!!group && (!getState().devices.groups.byId[group] || getState().devices.groups.byId[group].filters.length))) {
    return Promise.resolve();
  }
  const attributes = [...defaultAttributes, { scope: 'identity', attribute: getIdAttribute(getState()).attribute || 'id' }];
  let filters = [{ key: 'group', value: group, operator: '$eq', scope: 'system' }];
  if (!shouldIncludeAllStates) {
    filters.push({ key: 'status', value: DeviceConstants.DEVICE_STATES.accepted, operator: '$eq', scope: 'identity' });
  }
  const getAllDevices = (perPage = MAX_PAGE_SIZE, page = defaultPage, devices = []) =>
    GeneralApi.post(getSearchEndpoint(getState().app.features.hasReporting), {
      page,
      per_page: perPage,
      filters: mapFiltersToTerms(filters),
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
  const attributes = [...defaultAttributes, { scope: 'identity', attribute: getIdAttribute(getState()).attribute || 'id' }];
  const getAllDevices = (perPage = MAX_PAGE_SIZE, page = defaultPage, devices = []) =>
    GeneralApi.post(getSearchEndpoint(getState().app.features.hasReporting), { page, per_page: perPage, filters, attributes }).then(res => {
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

export const setDeviceFilters = filters => (dispatch, getState) => {
  const state = getState();
  if (deepCompare(filters, state.devices.filters)) {
    return Promise.resolve();
  }
  return Promise.resolve(dispatch({ type: DeviceConstants.SET_DEVICE_FILTERS, filters }));
};

export const getDeviceById = id => (dispatch, getState) =>
  GeneralApi.get(`${inventoryApiUrl}/devices/${id}`)
    .then(res => {
      const device = reduceReceivedDevices([res.data], [], getState()).devicesById[id];
      device.etag = res.headers.etag;
      delete device.updated_ts;
      dispatch({ type: DeviceConstants.RECEIVE_DEVICE, device });
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
export const getDeviceCount = status => (dispatch, getState) =>
  GeneralApi.post(getSearchEndpoint(getState().app.features.hasReporting), {
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

export const getAllDeviceCounts = () => dispatch =>
  Promise.all([DeviceConstants.DEVICE_STATES.accepted, DeviceConstants.DEVICE_STATES.pending].map(status => dispatch(getDeviceCount(status))));

export const getDeviceLimit = () => dispatch =>
  GeneralApi.get(`${deviceAuthV2}/limits/max_devices`).then(res =>
    dispatch({
      type: DeviceConstants.SET_DEVICE_LIMIT,
      limit: res.data.limit
    })
  );

export const setDeviceListState = selectionState => (dispatch, getState) =>
  Promise.resolve(
    dispatch({
      type: DeviceConstants.SET_DEVICE_LIST_STATE,
      state: {
        ...getState().devices.deviceList,
        sort: {
          ...getState().devices.deviceList.sort,
          ...selectionState.sort
        },
        ...selectionState
      }
    })
  );

const convertIssueOptionsToFilters = issuesSelection =>
  issuesSelection.map(item => {
    if (typeof DEVICE_ISSUE_OPTIONS[item].filterRule.value === 'function') {
      return { ...DEVICE_ISSUE_OPTIONS[item].filterRule, value: DEVICE_ISSUE_OPTIONS[item].filterRule.value() };
    }
    return DEVICE_ISSUE_OPTIONS[item].filterRule;
  });

export const convertDeviceListStateToFilters = ({ filters = [], group, selectedIssues = [], status }) => {
  let applicableFilters = [...filters];
  if (typeof group === 'string' && !applicableFilters.length) {
    applicableFilters = [{ key: 'group', value: group, operator: '$eq', scope: 'system' }];
  }
  const nonMonitorFilters = applicableFilters.filter(
    filter => !Object.values(DEVICE_ISSUE_OPTIONS).some(({ filterRule }) => filterRule.scope === filter.scope && filterRule.key === filter.key)
  );
  const deviceIssueFilters = convertIssueOptionsToFilters(selectedIssues);
  applicableFilters = [...nonMonitorFilters, ...deviceIssueFilters];
  const effectiveFilters = status ? [...applicableFilters, { key: 'status', value: status, operator: '$eq', scope: 'identity' }] : applicableFilters;
  return { applicableFilters: nonMonitorFilters, filterTerms: mapFiltersToTerms(effectiveFilters) };
};

// get devices from inventory
export const getDevicesByStatus = (status, options = {}) => (dispatch, getState) => {
  const {
    group,
    selectedIssues = [],
    page = defaultPage,
    perPage = defaultPerPage,
    shouldSelectDevices = false,
    sortOptions = [],
    trackSelectionState = false
  } = options;
  const { applicableFilters, filterTerms } = convertDeviceListStateToFilters({ filters: getState().devices.filters, group, selectedIssues, status });
  const attributes = [...defaultAttributes, { scope: 'identity', attribute: getIdAttribute(getState()).attribute || 'id' }];
  return GeneralApi.post(getSearchEndpoint(getState().app.features.hasReporting), {
    page,
    per_page: perPage,
    filters: filterTerms,
    sort: sortOptions,
    attributes
  })
    .then(response => {
      const state = getState();
      const deviceAccu = reduceReceivedDevices(response.data, [], state, status);
      let total = !applicableFilters.length ? Number(response.headers[headerNames.total]) : null;
      if (status && state.devices.byStatus[status].total === deviceAccu.ids.length) {
        total = deviceAccu.ids.length;
      }
      let tasks = [
        dispatch({
          type: DeviceConstants.RECEIVE_DEVICES,
          devicesById: deviceAccu.devicesById
        })
      ];
      if (status) {
        tasks.push(
          dispatch({
            type: DeviceConstants[`SET_${status.toUpperCase()}_DEVICES`],
            deviceIds: deviceAccu.ids,
            status,
            total
          })
        );
      }
      // for each device, get device identity info
      const receivedDevices = Object.values(deviceAccu.devicesById);
      if (receivedDevices.length) {
        tasks.push(dispatch(getDevicesWithAuth(receivedDevices)));
      }
      if (shouldSelectDevices || trackSelectionState) {
        tasks.push(
          dispatch(
            setDeviceListState({
              deviceIds: shouldSelectDevices ? deviceAccu.ids : state.devices.deviceList.deviceIds,
              page,
              perPage,
              sort: {
                direction: sortOptions.length ? sortOptions[0].order : state.devices.deviceList.sort.direction,
                columns: sortOptions.length
                  ? sortOptions.map(option => ({ column: option.attribute, scope: option.scope }))
                  : state.devices.deviceList.sort.columns
              },
              total: Number(response.headers[headerNames.total])
            })
          )
        );
      }

      tasks.push(Promise.resolve({ deviceAccu, total: Number(response.headers[headerNames.total]) }));
      return Promise.all(tasks);
    })
    .catch(err => commonErrorHandler(err, `${status} devices couldn't be loaded.`, dispatch, commonErrorFallback));
};

export const getAllDevicesByStatus = status => (dispatch, getState) => {
  const attributes = [...defaultAttributes, { scope: 'identity', attribute: getIdAttribute(getState()).attribute || 'id' }];
  const getAllDevices = (perPage = MAX_PAGE_SIZE, page = 1, devices = []) =>
    GeneralApi.post(getSearchEndpoint(getState().app.features.hasReporting), {
      page,
      per_page: perPage,
      filters: mapFiltersToTerms([{ key: 'status', value: status, operator: '$eq', scope: 'identity' }]),
      attributes
    }).then(res => {
      const state = getState();
      const deviceAccu = reduceReceivedDevices(res.data, devices, state, status);
      dispatch({
        type: DeviceConstants.RECEIVE_DEVICES,
        devicesById: deviceAccu.devicesById
      });
      const total = Number(res.headers[headerNames.total]);
      if (total > state.deployments.deploymentDeviceLimit) {
        return Promise.resolve();
      }
      if (total > perPage * page) {
        return getAllDevices(perPage, page + 1, deviceAccu.ids);
      }
      let tasks = [
        dispatch({
          type: DeviceConstants[`SET_${status.toUpperCase()}_DEVICES`],
          deviceIds: deviceAccu.ids,
          forceUpdate: true,
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

const ATTRIBUTE_LIST_CUTOFF = 100;
export const getDeviceAttributes = () => (dispatch, getState) =>
  GeneralApi.get(getAttrsEndpoint(getState().app.features.hasReporting)).then(({ data }) => {
    const { inventory: inventoryAttributes, identity: identityAttributes, tags: tagAttributes } = (data || []).slice(0, ATTRIBUTE_LIST_CUTOFF).reduce(
      (accu, item) => {
        if (!accu[item.scope]) {
          accu[item.scope] = [];
        }
        accu[item.scope].push(item.name);
        return accu;
      },
      { inventory: [], identity: [], tags: [] }
    );
    return dispatch({
      type: DeviceConstants.SET_FILTER_ATTRIBUTES,
      attributes: { identityAttributes, inventoryAttributes, tagAttributes }
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
          if (item.meta?.session_id?.includes(sessionId)) {
            accu.start = new Date(item.action.startsWith('open') ? item.time : accu.start);
            accu.end = new Date(item.action.startsWith('close') ? item.time : accu.end);
          }
          return accu;
        },
        { start: startDate || endDate, end: endDate || startDate }
      );
      return Promise.resolve({ start, end });
    }
  );
};

export const getDeviceFileDownloadLink = (deviceId, path) => () =>
  Promise.resolve(`${deviceConnect}/devices/${deviceId}/download?path=${encodeURIComponent(path)}`);

export const deviceFileUpload = (deviceId, path, file) => dispatch => {
  var formData = new FormData();
  formData.append('path', path);
  formData.append('file', file);
  const cancelSource = axios.CancelToken.source();
  return Promise.all([
    dispatch(setSnackbar('Uploading file')),
    dispatch({ type: AppConstants.UPLOAD_PROGRESS, inprogress: true, uploadProgress: 0, cancelSource }),
    GeneralApi.uploadPut(`${deviceConnect}/devices/${deviceId}/upload`, formData, e => progress(e, dispatch), cancelSource.token)
  ])
    .then(() => Promise.resolve(dispatch(setSnackbar('Upload successful', 5000))))
    .catch(err => {
      if (axios.isCancel(err)) {
        return dispatch(setSnackbar('The upload has been cancelled', 5000));
      }
      return commonErrorHandler(err, `Error uploading file to device.`, dispatch);
    })
    .finally(() => Promise.resolve(dispatch({ type: AppConstants.UPLOAD_PROGRESS, inprogress: false, uploadProgress: 0 })));
};

export const getDeviceAuth = id => dispatch =>
  Promise.resolve(dispatch(getDevicesWithAuth([{ id }]))).then(results => {
    if (results[results.length - 1]) {
      return Promise.resolve(results[results.length - 1][0]);
    }
    return Promise.resolve();
  });

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

const maybeUpdateDevicesByStatus = (deviceId, authId) => (dispatch, getState) => {
  const devicesState = getState().devices;
  const device = devicesState.byId[deviceId];
  const hasMultipleAuthSets = authId ? device.auth_sets.filter(authset => authset.id !== authId).length > 0 : false;
  if (!hasMultipleAuthSets && Object.values(DEVICE_STATES).includes(device.status)) {
    const deviceIds = devicesState.byStatus[device.status].deviceIds.filter(id => id !== deviceId);
    return Promise.resolve(
      dispatch({
        type: DeviceConstants[`SET_${device.status.toUpperCase()}_DEVICES`],
        deviceIds,
        forceUpdate: true,
        status: device.status,
        total: Math.max(0, devicesState.byStatus[device.status].total - 1)
      })
    );
  }
  return Promise.resolve();
};

export const updateDeviceAuth = (deviceId, authId, status) => dispatch =>
  GeneralApi.put(`${deviceAuthV2}/devices/${deviceId}/auth/${authId}/status`, { status })
    .then(() => Promise.all([dispatch(getDeviceAuth(deviceId)), dispatch(setSnackbar('Device authorization status was updated successfully'))]))
    .catch(err => commonErrorHandler(err, 'There was a problem updating the device authorization status:', dispatch))
    .then(() => Promise.resolve(dispatch(maybeUpdateDevicesByStatus(deviceId, authId))));

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

export const deleteAuthset = (deviceId, authId) => dispatch =>
  GeneralApi.delete(`${deviceAuthV2}/devices/${deviceId}/auth/${authId}`)
    .then(() => Promise.all([dispatch(setSnackbar('Device authorization status was updated successfully'))]))
    .catch(err => commonErrorHandler(err, 'There was a problem updating the device authorization status:', dispatch))
    .then(() => Promise.resolve(dispatch(maybeUpdateDevicesByStatus(deviceId, authId))));

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

export const decommissionDevice = (deviceId, authId) => dispatch =>
  GeneralApi.delete(`${deviceAuthV2}/devices/${deviceId}`)
    .then(() => Promise.resolve(dispatch(setSnackbar('Device was decommissioned successfully'))))
    .catch(err => commonErrorHandler(err, 'There was a problem decommissioning the device:', dispatch))
    .then(() => Promise.resolve(dispatch(maybeUpdateDevicesByStatus(deviceId, authId))));

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
        return commonErrorHandler(err, `There was an error retrieving the configuration for device ${deviceId}.`, dispatch, commonErrorFallback);
      }
    });

export const setDeviceConfig = (deviceId, config) => dispatch =>
  GeneralApi.put(`${deviceConfig}/${deviceId}`, config)
    .catch(err => commonErrorHandler(err, `There was an error setting the configuration for device ${deviceId}.`, dispatch, commonErrorFallback))
    .then(() => Promise.resolve(dispatch(getDeviceConfig(deviceId))));

export const applyDeviceConfig = (deviceId, configDeploymentConfiguration, isDefault, config) => (dispatch, getState) =>
  GeneralApi.post(`${deviceConfig}/${deviceId}/deploy`, configDeploymentConfiguration)
    .catch(err => commonErrorHandler(err, `There was an error deploying the configuration to device ${deviceId}.`, dispatch, commonErrorFallback))
    .then(({ data }) => {
      let tasks = [dispatch(getSingleDeployment(data.deployment_id))];
      if (isDefault) {
        const { previous } = getState().users.globalSettings.defaultDeviceConfig;
        tasks.push(dispatch(saveGlobalSettings({ defaultDeviceConfig: { current: config, previous } })));
      }
      return Promise.all(tasks);
    });

export const setDeviceTags = (deviceId, tags) => dispatch =>
  // to prevent tag set failures, retrieve the device & use the freshest etag we can get
  Promise.resolve(dispatch(getDeviceById(deviceId))).then(device => {
    const headers = device.etag ? { 'If-Match': device.etag } : {};
    return GeneralApi.put(
      `${inventoryApiUrl}/devices/${deviceId}/tags`,
      Object.entries(tags).map(([name, value]) => ({ name, value })),
      { headers }
    )
      .catch(err => commonErrorHandler(err, `There was an error setting tags for device ${deviceId}.`, dispatch, 'Please check your connection.'))
      .then(() => Promise.resolve(dispatch({ type: DeviceConstants.RECEIVE_DEVICE, device: { ...device, tags } })));
  });
