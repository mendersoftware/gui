/*eslint import/namespace: ['error', { allowComputed: true }]*/
import React from 'react';
import { Link } from 'react-router-dom';

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAttrsEndpoint,
  getCurrentUser,
  getDeviceTwinIntegrations,
  getFeatures,
  getGlobalSettings,
  getIdAttribute,
  getSearchEndpoint,
  getTenantCapabilities,
  getUserCapabilities,
  getUserSettings
} from '@store/selectors';
import { isCancel } from 'axios';
import pluralize from 'pluralize';
import { v4 as uuid } from 'uuid';

import { actions, sliceName } from '.';
import { routes, sortingAlternatives } from '../../components/devices/base-devices';
import { filtersFilter } from '../../components/devices/widgets/filters';
import { attributeDuplicateFilter, deepCompare, extractErrorMessage, getSnackbarMessage, mapDeviceAttributes } from '../../helpers';
import { chartColorPalette } from '../../themes/Mender';
import storeActions from '../actions';
import GeneralApi from '../api/general-api';
import {
  ALL_DEVICES,
  DEVICE_FILTERING_OPTIONS,
  DEVICE_LIST_DEFAULTS,
  EXTERNAL_PROVIDER,
  MAX_PAGE_SIZE,
  SORTING_OPTIONS,
  TIMEOUTS,
  UNGROUPED_GROUP,
  auditLogsApiUrl,
  defaultReports,
  headerNames,
  rootfsImageVersion
} from '../constants';
import { commonErrorFallback, commonErrorHandler } from '../store';
import { getDeviceMonitorConfig, getLatestDeviceAlerts, getSingleDeployment, saveGlobalSettings } from '../thunks';
import { convertDeviceListStateToFilters, mapFiltersToTerms, mapTermsToFilters, progress } from '../utils';
import {
  DEVICE_STATES,
  deviceAuthV2,
  deviceConfig,
  deviceConnect,
  emptyFilter,
  geoAttributes,
  inventoryApiUrl,
  inventoryApiUrlV2,
  iotManagerBaseURL,
  reportingApiUrl
} from './constants';
import {
  getDeviceById as getDeviceByIdSelector,
  getDeviceFilters,
  getDeviceListState,
  getDevicesById,
  getGroupsById,
  getGroups as getGroupsSelector,
  getSelectedGroup
} from './selectors';

const { cleanUpUpload, initUpload, setSnackbar, uploadProgress } = storeActions;
const { page: defaultPage, perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;

const defaultAttributes = [
  { scope: 'identity', attribute: 'status' },
  { scope: 'inventory', attribute: 'artifact_name' },
  { scope: 'inventory', attribute: 'device_type' },
  { scope: 'inventory', attribute: 'mender_is_gateway' },
  { scope: 'inventory', attribute: 'mender_gateway_system_id' },
  { scope: 'inventory', attribute: rootfsImageVersion },
  { scope: 'monitor', attribute: 'alerts' },
  { scope: 'system', attribute: 'created_ts' },
  { scope: 'system', attribute: 'updated_ts' },
  { scope: 'system', attribute: 'check_in_time' },
  { scope: 'system', attribute: 'group' },
  { scope: 'tags', attribute: 'name' }
];

export const getGroups = createAsyncThunk(`${sliceName}/getGroups`, (_, { dispatch, getState }) =>
  GeneralApi.get(`${inventoryApiUrl}/groups`).then(res => {
    const state = getGroupsById(getState());
    const dynamicGroups = Object.entries(state).reduce((accu, [id, group]) => {
      if (group.id || (group.filters?.length && id !== UNGROUPED_GROUP.id)) {
        accu[id] = group;
      }
      return accu;
    }, {});
    const groups = res.data.reduce((accu, group) => {
      accu[group] = { deviceIds: [], filters: [], total: 0, ...state[group] };
      return accu;
    }, dynamicGroups);
    const filters = [{ key: 'group', value: res.data, operator: DEVICE_FILTERING_OPTIONS.$nin.key, scope: 'system' }];
    return Promise.all([
      dispatch(actions.receivedGroups(groups)),
      dispatch(getDevicesByStatus(undefined, { filterSelection: filters, group: 0, page: 1, perPage: 1 }))
    ]).then(promises => {
      const ungroupedDevices = promises[promises.length - 1] || [];
      const result = ungroupedDevices[ungroupedDevices.length - 1] || {};
      if (!result.total) {
        return Promise.resolve();
      }
      return Promise.resolve(
        dispatch(
          actions.addGroup({
            groupName: UNGROUPED_GROUP.id,
            group: { filters: [{ key: 'group', value: res.data, operator: DEVICE_FILTERING_OPTIONS.$nin.key, scope: 'system' }] }
          })
        )
      );
    });
  })
);

export const addDevicesToGroup = createAsyncThunk(`${sliceName}/addDevicesToGroup`, ({ group, deviceIds, isCreation }, { dispatch }) =>
  GeneralApi.patch(`${inventoryApiUrl}/groups/${group}/devices`, deviceIds)
    .then(() => dispatch(actions.addToGroup({ group, deviceIds })))
    .finally(() => (isCreation ? Promise.resolve(dispatch(getGroups())) : {}))
);

export const removeDevicesFromGroup = createAsyncThunk(`${sliceName}/removeDevicesFromGroup`, ({ group, deviceIds }, { dispatch }) =>
  GeneralApi.delete(`${inventoryApiUrl}/groups/${group}/devices`, deviceIds).then(() =>
    Promise.all([
      dispatch(actions.removeFromGroup({ group, deviceIds })),
      dispatch(setSnackbar(`The ${pluralize('devices', deviceIds.length)} ${pluralize('were', deviceIds.length)} removed from the group`, TIMEOUTS.fiveSeconds))
    ])
  )
);

const getGroupNotification = (newGroup, selectedGroup) => {
  const successMessage = 'The group was updated successfully';
  if (newGroup === selectedGroup) {
    return [successMessage, TIMEOUTS.fiveSeconds];
  }
  return [
    <>
      {successMessage} - <Link to={`/devices?inventory=group:eq:${newGroup}`}>click here</Link> to see it.
    </>,
    5000,
    undefined,
    undefined,
    () => {}
  ];
};

export const addStaticGroup = createAsyncThunk(`${sliceName}/addStaticGroup`, ({ group, devices }, { dispatch, getState }) =>
  Promise.resolve(dispatch(addDevicesToGroup({ group, deviceIds: devices.map(({ id }) => id), isCreation: true })))
    .then(() =>
      Promise.resolve(
        dispatch(
          actions.addGroup({
            group: { deviceIds: [], total: 0, filters: [], ...getState().devices.groups.byId[group] },
            groupName: group
          })
        )
      ).then(() =>
        Promise.all([
          dispatch(setDeviceListState({ setOnly: true })),
          dispatch(getGroups()),
          dispatch(setSnackbar(...getGroupNotification(group, getState().devices.groups.selectedGroup)))
        ])
      )
    )
    .catch(err => commonErrorHandler(err, `Group could not be updated:`, dispatch))
);

export const removeStaticGroup = createAsyncThunk(`${sliceName}/removeStaticGroup`, (groupName, { dispatch }) =>
  GeneralApi.delete(`${inventoryApiUrl}/groups/${groupName}`).then(() =>
    Promise.all([
      dispatch(actions.removeGroup(groupName)),
      dispatch(getGroups()),
      dispatch(setSnackbar('Group was removed successfully', TIMEOUTS.fiveSeconds))
    ])
  )
);

export const getDynamicGroups = createAsyncThunk(`${sliceName}/getDynamicGroups`, (_, { dispatch, getState }) =>
  GeneralApi.get(`${inventoryApiUrlV2}/filters?per_page=${MAX_PAGE_SIZE}`)
    .then(({ data: filters }) => {
      const state = getGroupsById(getState());
      const staticGroups = Object.entries(state).reduce((accu, [id, group]) => {
        if (!(group.id || group.filters?.length)) {
          accu[id] = group;
        }
        return accu;
      }, {});
      const groups = (filters || []).reduce((accu, filter) => {
        accu[filter.name] = {
          deviceIds: [],
          total: 0,
          ...state[filter.name],
          id: filter.id,
          filters: mapTermsToFilters(filter.terms)
        };
        return accu;
      }, staticGroups);
      return Promise.resolve(dispatch(actions.receivedGroups(groups)));
    })
    .catch(() => console.log('Dynamic group retrieval failed - likely accessing a non-enterprise backend'))
);

export const addDynamicGroup = createAsyncThunk(`${sliceName}/addDynamicGroup`, ({ groupName, filterPredicates }, { dispatch, getState }) =>
  GeneralApi.post(`${inventoryApiUrlV2}/filters`, { name: groupName, terms: mapFiltersToTerms(filterPredicates) })
    .then(res =>
      Promise.resolve(
        dispatch(
          actions.addGroup({
            groupName,
            group: {
              id: res.headers[headerNames.location].substring(res.headers[headerNames.location].lastIndexOf('/') + 1),
              filters: filterPredicates
            }
          })
        )
      ).then(() => {
        const { cleanedFilters } = getGroupFilters(groupName, getState().devices.groups);
        return Promise.all([
          dispatch(actions.setDeviceFilters(cleanedFilters)),
          dispatch(setSnackbar(...getGroupNotification(groupName, getState().devices.groups.selectedGroup))),
          dispatch(getDynamicGroups())
        ]);
      })
    )
    .catch(err => commonErrorHandler(err, `Group could not be updated:`, dispatch))
);

export const updateDynamicGroup = createAsyncThunk(`${sliceName}/updateDynamicGroup`, ({ groupName, filterPredicates }, { dispatch, getState }) => {
  const filterId = getState().devices.groups.byId[groupName].id;
  return GeneralApi.delete(`${inventoryApiUrlV2}/filters/${filterId}`).then(() => Promise.resolve(dispatch(addDynamicGroup(groupName, filterPredicates))));
});

export const removeDynamicGroup = createAsyncThunk(`${sliceName}/removeDynamicGroup`, (groupName, { dispatch, getState }) => {
  const filterId = getState().devices.groups.byId[groupName].id;
  return GeneralApi.delete(`${inventoryApiUrlV2}/filters/${filterId}`).then(() =>
    Promise.all([actions.removeGroup(groupName), dispatch(setSnackbar('Group was removed successfully', TIMEOUTS.fiveSeconds))])
  );
});

/*
 * Device inventory functions
 */
const getGroupFilters = (group, groupsState, filters = []) => {
  const groupName = group === UNGROUPED_GROUP.id || group === UNGROUPED_GROUP.name ? UNGROUPED_GROUP.id : group;
  const selectedGroup = groupsState.byId[groupName];
  const groupFilterLength = selectedGroup?.filters?.length || 0;
  const cleanedFilters = groupFilterLength ? [...filters, ...selectedGroup.filters].filter(filtersFilter) : filters;
  return { cleanedFilters, groupName, selectedGroup, groupFilterLength };
};

export const selectGroup = createAsyncThunk(`${sliceName}/selectGroup`, ({ group, filters = [] }, { dispatch, getState }) => {
  const { cleanedFilters, groupName, selectedGroup, groupFilterLength } = getGroupFilters(group, getState().devices.groups, filters);
  if (getSelectedGroup(getState()) === groupName && ((filters.length === 0 && !groupFilterLength) || filters.length === cleanedFilters.length)) {
    return Promise.resolve();
  }
  let tasks = [];
  if (groupFilterLength) {
    tasks.push(dispatch(actions.setDeviceFilters(cleanedFilters)));
  } else {
    tasks.push(dispatch(actions.setDeviceFilters(filters)));
    tasks.push(dispatch(getGroupDevices(groupName, { perPage: 1, shouldIncludeAllStates: true })));
  }
  const selectedGroupName = selectedGroup || !Object.keys(getGroupsById(getState())).length ? groupName : undefined;
  tasks.push(dispatch(actions.selectGroup(selectedGroupName)));
  return Promise.all(tasks);
});

const getEarliestTs = (dateA = '', dateB = '') => (!dateA || !dateB ? dateA || dateB : dateA < dateB ? dateA : dateB);

const reduceReceivedDevices = (devices, ids, state, status) =>
  devices.reduce(
    (accu, device) => {
      const stateDevice = getDeviceByIdSelector(state, device.id);
      const {
        attributes: storedAttributes = {},
        identity_data: storedIdentity = {},
        monitor: storedMonitor = {},
        tags: storedTags = {},
        group: storedGroup
      } = stateDevice;
      const { identity, inventory, monitor, system = {}, tags } = mapDeviceAttributes(device.attributes);
      device.tags = { ...storedTags, ...tags };
      device.group = system.group ?? storedGroup;
      device.monitor = { ...storedMonitor, ...monitor };
      device.identity_data = { ...storedIdentity, ...identity, ...(device.identity_data ? device.identity_data : {}) };
      device.status = status ? status : device.status || identity.status;
      device.check_in_time_rounded = system.check_in_time ?? stateDevice.check_in_time_rounded;
      device.check_in_time_exact = device.check_in_time ?? stateDevice.check_in_time_exact;
      device.created_ts = getEarliestTs(getEarliestTs(system.created_ts, device.created_ts), stateDevice.created_ts);
      device.updated_ts = device.attributes ? device.updated_ts : stateDevice.updated_ts;
      device.isNew = new Date(device.created_ts) > new Date(state.app.newThreshold);
      device.isOffline = new Date(device.check_in_time_rounded) < new Date(state.app.offlineThreshold) || device.check_in_time_rounded === undefined;
      // all the other mapped attributes return as empty objects if there are no attributes to map, but identity will be initialized with an empty state
      // for device_type and artifact_name, potentially overwriting existing info, so rely on stored information instead if there are no attributes
      device.attributes = device.attributes ? { ...storedAttributes, ...inventory } : storedAttributes;
      accu.devicesById[device.id] = { ...stateDevice, ...device };
      accu.ids.push(device.id);
      return accu;
    },
    { ids, devicesById: {} }
  );

export const getGroupDevices = createAsyncThunk(`${sliceName}/getGroupDevices`, (options, { dispatch, getState }) => {
  const { group, shouldIncludeAllStates, ...remainder } = options;
  const { cleanedFilters: filterSelection } = getGroupFilters(group, getState().devices.groups);
  return Promise.resolve(
    dispatch(getDevicesByStatus(shouldIncludeAllStates ? undefined : DEVICE_STATES.accepted, { ...remainder, filterSelection, group }))
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
      dispatch(
        actions.addGroup({
          group: { deviceIds: deviceAccu.ids.length === total || deviceAccu.ids.length > stateGroup?.deviceIds ? deviceAccu.ids : stateGroup.deviceIds, total },
          groupName: group
        })
      )
    );
  });
});

export const getAllGroupDevices = createAsyncThunk(`${sliceName}/getAllGroupDevices`, ({ group, shouldIncludeAllStates }, { dispatch, getState }) => {
  if (!group || (!!group && (!getGroupsById(getState())[group] || getGroupsById(getState())[group].filters.length))) {
    return Promise.resolve();
  }
  const { attributes, filterTerms } = prepareSearchArguments({
    filters: [],
    group,
    state: getState(),
    status: shouldIncludeAllStates ? undefined : DEVICE_STATES.accepted
  });
  const { hasReporting } = getFeatures(getState());
  const getAllDevices = (perPage = MAX_PAGE_SIZE, page = defaultPage, devices = []) =>
    GeneralApi.post(getSearchEndpoint(hasReporting), {
      page,
      per_page: perPage,
      filters: filterTerms,
      attributes
    }).then(res => {
      const state = getState();
      const deviceAccu = reduceReceivedDevices(res.data, devices, state);
      dispatch(actions.receivedDevices(deviceAccu.devicesById));
      const total = Number(res.headers[headerNames.total]);
      if (total > perPage * page) {
        return getAllDevices(perPage, page + 1, deviceAccu.ids);
      }
      return Promise.resolve(dispatch(actions.addGroup({ group: { deviceIds: deviceAccu.ids, total: deviceAccu.ids.length }, groupName: group })));
    });
  return getAllDevices();
});

export const getAllDynamicGroupDevices = createAsyncThunk(`${sliceName}/getAllDynamicGroupDevices`, (group, { dispatch, getState }) => {
  if (!!group && (!getGroupsById(getState())[group] || !getGroupsById(getState())[group].filters.length)) {
    return Promise.resolve();
  }
  const { attributes, filterTerms: filters } = prepareSearchArguments({
    filters: getState().devices.groups.byId[group].filters,
    state: getState(),
    status: DEVICE_STATES.accepted
  });
  const { hasReporting } = getFeatures(getState());
  const getAllDevices = (perPage = MAX_PAGE_SIZE, page = defaultPage, devices = []) =>
    GeneralApi.post(getSearchEndpoint(hasReporting), { page, per_page: perPage, filters, attributes }).then(res => {
      const state = getState();
      const deviceAccu = reduceReceivedDevices(res.data, devices, state);
      dispatch(actions.receivedDevices(deviceAccu.devicesById));
      const total = Number(res.headers[headerNames.total]);
      if (total > deviceAccu.ids.length) {
        return getAllDevices(perPage, page + 1, deviceAccu.ids);
      }
      return Promise.resolve(dispatch(actions.addGroup({ group: { deviceIds: deviceAccu.ids, total }, groupName: group })));
    });
  return getAllDevices();
});

export const getDeviceById = createAsyncThunk(`${sliceName}/getDeviceById`, (id, { dispatch, getState }) =>
  GeneralApi.get(`${inventoryApiUrl}/devices/${id}`)
    .then(res => {
      const device = reduceReceivedDevices([res.data], [], getState()).devicesById[id];
      device.etag = res.headers.etag;
      dispatch(actions.receivedDevice(device));
      return Promise.resolve(device);
    })
    .catch(err => {
      const errMsg = extractErrorMessage(err);
      if (errMsg.includes('Not Found')) {
        console.log(`${id} does not have any inventory information`);
        const device = reduceReceivedDevices(
          [
            {
              id,
              attributes: [
                { name: 'status', value: 'decomissioned', scope: 'identity' },
                { name: 'decomissioned', value: 'true', scope: 'inventory' }
              ]
            }
          ],
          [],
          getState()
        ).devicesById[id];
        dispatch(actions.receivedDevice(device));
      }
    })
);

export const getDeviceInfo = createAsyncThunk(`${sliceName}/getDeviceInfo`, (deviceId, { dispatch, getState }) => {
  const device = getDeviceByIdSelector(deviceId);
  const { hasDeviceConfig, hasDeviceConnect, hasMonitor } = getTenantCapabilities(getState());
  const { canConfigure } = getUserCapabilities(getState());
  const integrations = getDeviceTwinIntegrations(getState());
  let tasks = [dispatch(getDeviceAuth(deviceId)), ...integrations.map(integration => dispatch(getDeviceTwin(deviceId, integration)))];
  if (hasDeviceConfig && canConfigure && [DEVICE_STATES.accepted, DEVICE_STATES.preauth].includes(device.status)) {
    tasks.push(dispatch(getDeviceConfig(deviceId)));
  }
  if (device.status === DEVICE_STATES.accepted) {
    // Get full device identity details for single selected device
    tasks.push(dispatch(getDeviceById(deviceId)));
    if (hasDeviceConnect) {
      tasks.push(dispatch(getDeviceConnect(deviceId)));
    }
    if (hasMonitor) {
      tasks.push(dispatch(getLatestDeviceAlerts({ id: deviceId })));
      tasks.push(dispatch(getDeviceMonitorConfig(deviceId)));
    }
  }
  return Promise.all(tasks);
});

const deriveInactiveDevices = createAsyncThunk(`${sliceName}/deriveInactiveDevices`, (deviceIds, { dispatch, getState }) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdaysIsoString = yesterday.toISOString();
  // now boil the list down to the ones that were not updated since yesterday
  const devices = deviceIds.reduce(
    (accu, id) => {
      const device = getDeviceByIdSelector(getState(), id);
      if (device && device.updated_ts > yesterdaysIsoString) {
        accu.active.push(id);
      } else {
        accu.inactive.push(id);
      }
      return accu;
    },
    { active: [], inactive: [] }
  );
  return dispatch(actions.setInactiveDevices({ activeDeviceTotal: devices.active.length, inactiveDeviceTotal: devices.inactive.length }));
});

/*
    Device Auth + admission
  */
export const getDeviceCount = createAsyncThunk(`${sliceName}/deriveInactiveDevices`, (status, { dispatch, getState }) => {
  const { hasReporting } = getFeatures(getState());
  return GeneralApi.post(getSearchEndpoint(hasReporting), {
    page: 1,
    per_page: 1,
    filters: mapFiltersToTerms([{ key: 'status', value: status, operator: DEVICE_FILTERING_OPTIONS.$eq.key, scope: 'identity' }]),
    attributes: defaultAttributes
  }).then(response => {
    const count = Number(response.headers[headerNames.total]);
    if (status) {
      return dispatch(actions.setDevicesCountByStatus({ count, status }));
    }
    return dispatch(actions.setTotalDevices(count));
  });
});

export const getAllDeviceCounts = createAsyncThunk(`${sliceName}/getAllDeviceCounts`, (_, { dispatch }) =>
  Promise.all([DEVICE_STATES.accepted, DEVICE_STATES.pending].map(status => dispatch(getDeviceCount(status))))
);

export const getDeviceLimit = createAsyncThunk(`${sliceName}/getDeviceLimit`, (_, { dispatch }) =>
  GeneralApi.get(`${deviceAuthV2}/limits/max_devices`).then(res => dispatch(actions.setDeviceLimit(res.data.limit)))
);

export const setDeviceListState = createAsyncThunk(
  `${sliceName}/setDeviceListState`,
  ({ selectionState, shouldSelectDevices = true, forceRefresh, fetchAuth = true }, { dispatch, getState }) => {
    const currentState = getDeviceListState(getState());
    const refreshTrigger = forceRefresh ? !currentState.refreshTrigger : selectionState.refreshTrigger;
    let nextState = {
      ...currentState,
      setOnly: false,
      refreshTrigger,
      ...selectionState,
      sort: { ...currentState.sort, ...selectionState.sort }
    };
    let tasks = [];
    // eslint-disable-next-line no-unused-vars
    const { isLoading: currentLoading, deviceIds: currentDevices, selection: currentSelection, ...currentRequestState } = currentState;
    // eslint-disable-next-line no-unused-vars
    const { isLoading: nextLoading, deviceIds: nextDevices, selection: nextSelection, ...nextRequestState } = nextState;
    if (!nextState.setOnly && !deepCompare(currentRequestState, nextRequestState)) {
      const { direction: sortDown = SORTING_OPTIONS.desc, key: sortCol, scope: sortScope } = nextState.sort ?? {};
      const sortBy = sortCol ? [{ attribute: sortCol, order: sortDown, scope: sortScope }] : undefined;
      if (sortCol && sortingAlternatives[sortCol]) {
        sortBy.push({ ...sortBy[0], attribute: sortingAlternatives[sortCol] });
      }
      const applicableSelectedState = nextState.state === routes.allDevices.key ? undefined : nextState.state;
      nextState.isLoading = true;
      tasks.push(
        dispatch(getDevicesByStatus(applicableSelectedState, { ...nextState, sortOptions: sortBy }, fetchAuth))
          .then(results => {
            const { deviceAccu, total } = results[results.length - 1];
            const devicesState = shouldSelectDevices ? { deviceIds: deviceAccu.ids, total, isLoading: false } : { isLoading: false };
            return Promise.resolve(devicesState);
          })
          // whatever happens, change "loading" back to null
          .catch(() => Promise.resolve({ isLoading: false }))
      );
    }
    tasks.push(Promise.resolve(nextState));
    return Promise.all(tasks);
  }
);

// get devices from inventory
export const getDevicesByStatus = createAsyncThunk(`${sliceName}/getDevicesByStatus`, (options, { dispatch, getState }) => {
  const {
    status,
    fetchAuth = true,
    filterSelection,
    group,
    selectedIssues = [],
    page = defaultPage,
    perPage = defaultPerPage,
    sortOptions = [],
    selectedAttributes = []
  } = options;
  const { applicableFilters, filterTerms } = convertDeviceListStateToFilters({
    filters: filterSelection ?? getDeviceFilters(getState()),
    group: group ?? getSelectedGroup(getState()),
    groups: getState().devices.groups,
    offlineThreshold: getState().app.offlineThreshold,
    selectedIssues,
    status
  });
  const attributes = [...defaultAttributes, { scope: 'identity', attribute: getIdAttribute(getState()).attribute || 'id' }, ...selectedAttributes];
  const { hasReporting } = getFeatures(getState());
  return GeneralApi.post(getSearchEndpoint(hasReporting), {
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
      let tasks = [dispatch(actions.receivedDevices(deviceAccu.devicesById))];
      if (status) {
        tasks.push(dispatch(actions.setDevicesByStatus({ deviceIds: deviceAccu.ids, status, total })));
      }
      // for each device, get device identity info
      const receivedDevices = Object.values(deviceAccu.devicesById);
      if (receivedDevices.length && fetchAuth) {
        tasks.push(dispatch(getDevicesWithAuth(receivedDevices)));
      }
      tasks.push(Promise.resolve({ deviceAccu, total: Number(response.headers[headerNames.total]) }));
      return Promise.all(tasks);
    })
    .catch(err => commonErrorHandler(err, `${status} devices couldn't be loaded.`, dispatch, commonErrorFallback));
});

export const getAllDevicesByStatus = createAsyncThunk(`${sliceName}/getAllDevicesByStatus`, (status, { dispatch, getState }) => {
  const attributes = [...defaultAttributes, { scope: 'identity', attribute: getIdAttribute(getState()).attribute || 'id' }];
  const { hasReporting } = getFeatures(getState());
  const getAllDevices = (perPage = MAX_PAGE_SIZE, page = 1, devices = []) =>
    GeneralApi.post(getSearchEndpoint(hasReporting), {
      page,
      per_page: perPage,
      filters: mapFiltersToTerms([{ key: 'status', value: status, operator: DEVICE_FILTERING_OPTIONS.$eq.key, scope: 'identity' }]),
      attributes
    }).then(res => {
      const state = getState();
      const deviceAccu = reduceReceivedDevices(res.data, devices, state, status);
      dispatch(actions.receivedDevices(deviceAccu.devicesById));
      const total = Number(res.headers[headerNames.total]);
      if (total > state.deployments.deploymentDeviceLimit) {
        return Promise.resolve();
      }
      if (total > perPage * page) {
        return getAllDevices(perPage, page + 1, deviceAccu.ids);
      }
      let tasks = [dispatch(actions.setDevicesByStatus({ deviceIds: deviceAccu.ids, forceUpdate: true, status, total: deviceAccu.ids.length }))];
      if (status === DEVICE_STATES.accepted && deviceAccu.ids.length === total) {
        tasks.push(dispatch(deriveInactiveDevices(deviceAccu.ids)));
        tasks.push(dispatch(deriveReportsData()));
      }
      return Promise.all(tasks);
    });
  return getAllDevices();
});

export const searchDevices = createAsyncThunk(`${sliceName}/searchDevices`, (passedOptions = {}, { dispatch, getState }) => {
  const state = getState();
  let options = { ...state.app.searchState, ...passedOptions };
  const { page = defaultPage, searchTerm, sortOptions = [] } = options;
  const { columnSelection = [] } = getUserSettings(state);
  const selectedAttributes = columnSelection.map(column => ({ attribute: column.key, scope: column.scope }));
  const attributes = attributeDuplicateFilter(
    [...defaultAttributes, { scope: 'identity', attribute: getIdAttribute(state).attribute }, ...selectedAttributes],
    'attribute'
  );
  const { hasReporting } = getFeatures(getState());
  return GeneralApi.post(getSearchEndpoint(hasReporting), {
    page,
    per_page: 10,
    filters: [],
    sort: sortOptions,
    text: searchTerm,
    attributes
  })
    .then(response => {
      const deviceAccu = reduceReceivedDevices(response.data, [], getState());
      return Promise.all([
        dispatch(actions.receivedDevices(deviceAccu.devicesById)),
        Promise.resolve({ deviceIds: deviceAccu.ids, searchTotal: Number(response.headers[headerNames.total]) })
      ]);
    })
    .catch(err => commonErrorHandler(err, `devices couldn't be searched.`, dispatch, commonErrorFallback));
});

const ATTRIBUTE_LIST_CUTOFF = 100;
const attributeReducer = (attributes = []) =>
  attributes.slice(0, ATTRIBUTE_LIST_CUTOFF).reduce(
    (accu, { name, scope }) => {
      if (!accu[scope]) {
        accu[scope] = [];
      }
      accu[scope].push(name);
      return accu;
    },
    { identity: [], inventory: [], system: [], tags: [] }
  );

export const getDeviceAttributes = createAsyncThunk(`${sliceName}/getDeviceAttributes`, (_, { dispatch, getState }) =>
  GeneralApi.get(getAttrsEndpoint(getFeatures(getState()).hasReporting)).then(({ data }) => {
    // TODO: remove the array fallback once the inventory attributes endpoint is fixed
    const { identity: identityAttributes, inventory: inventoryAttributes, system: systemAttributes, tags: tagAttributes } = attributeReducer(data || []);
    return dispatch(actions.setFilterAttributes({ identityAttributes, inventoryAttributes, systemAttributes, tagAttributes }));
  })
);

export const getReportingLimits = createAsyncThunk(`${sliceName}/getReportingLimits`, (_, { dispatch }) =>
  GeneralApi.get(`${reportingApiUrl}/devices/attributes`)
    .catch(err => commonErrorHandler(err, `filterable attributes limit & usage could not be retrieved.`, dispatch, commonErrorFallback))
    .then(({ data }) => {
      const { attributes, count, limit } = data;
      const groupedAttributes = attributeReducer(attributes);
      return Promise.resolve(dispatch(actions.setFilterablesConfig({ count, limit, attributes: groupedAttributes })));
    })
);

export const ensureVersionString = (software, fallback) =>
  software.length && software !== 'artifact_name' ? (software.endsWith('.version') ? software : `${software}.version`) : fallback;

const getSingleReportData = (reportConfig, groups) => {
  const { attribute, group, software = '' } = reportConfig;
  const filters = [{ key: 'status', scope: 'identity', operator: DEVICE_FILTERING_OPTIONS.$eq.key, value: 'accepted' }];
  if (group) {
    const staticGroupFilter = { key: 'group', scope: 'system', operator: DEVICE_FILTERING_OPTIONS.$eq.key, value: group };
    const { cleanedFilters: groupFilters } = getGroupFilters(group, groups);
    filters.push(...(groupFilters.length ? groupFilters : [staticGroupFilter]));
  }
  const aggregationAttribute = ensureVersionString(software, attribute);
  return GeneralApi.post(`${reportingApiUrl}/devices/aggregate`, {
    aggregations: [{ attribute: aggregationAttribute, name: '*', scope: 'inventory', size: chartColorPalette.length }],
    filters: mapFiltersToTerms(filters)
  }).then(({ data }) => ({ data, reportConfig }));
};

export const getReportsData = createAsyncThunk(`${sliceName}/getReportsData`, (_, { dispatch, getState }) => {
  const state = getState();
  const currentUserId = getCurrentUser(state).id;
  const reports =
    getUserSettings(state).reports || getGlobalSettings(state)[`${currentUserId}-reports`] || (Object.keys(getDevicesById(state)).length ? defaultReports : []);
  return Promise.all(reports.map(report => getSingleReportData(report, getState().devices.groups))).then(results => {
    const devicesState = getState().devices;
    const totalDeviceCount = devicesState.byStatus.accepted.total;
    const newReports = results.map(({ data, reportConfig }) => {
      let { items, other_count } = data[0];
      const { attribute, group, software = '' } = reportConfig;
      const dataCount = items.reduce((accu, item) => accu + item.count, 0);
      // the following is needed to show reports including both old (artifact_name) & current style (rootfs-image.version) device software
      const otherCount = !group && (software === rootfsImageVersion || attribute === 'artifact_name') ? totalDeviceCount - dataCount : other_count;
      return { items, otherCount, total: otherCount + dataCount };
    });
    return Promise.resolve(dispatch(actions.setDeviceReports(newReports)));
  });
});

const initializeDistributionData = (report, groups, devices, totalDeviceCount) => {
  const { attribute, group = '', software = '' } = report;
  const effectiveAttribute = software ? software : attribute;
  const { deviceIds, total = 0 } = groups[group] || {};
  const relevantDevices = groups[group] ? deviceIds.map(id => devices[id]) : Object.values(devices);
  const distributionByAttribute = relevantDevices.reduce((accu, item) => {
    if (!item.attributes || item.status !== DEVICE_STATES.accepted) return accu;
    if (!accu[item.attributes[effectiveAttribute]]) {
      accu[item.attributes[effectiveAttribute]] = 0;
    }
    accu[item.attributes[effectiveAttribute]] = accu[item.attributes[effectiveAttribute]] + 1;
    return accu;
  }, {});
  const distributionByAttributeSorted = Object.entries(distributionByAttribute).sort((pairA, pairB) => pairB[1] - pairA[1]);
  const items = distributionByAttributeSorted.map(([key, count]) => ({ key, count }));
  const dataCount = items.reduce((accu, item) => accu + item.count, 0);
  // the following is needed to show reports including both old (artifact_name) & current style (rootfs-image.version) device software
  const otherCount = (groups[group] ? total : totalDeviceCount) - dataCount;
  return { items, otherCount, total: otherCount + dataCount };
};

const deriveReportsData = createAsyncThunk(`${sliceName}/deriveReportsData`, (_, { dispatch, getState }) => {
  const state = getState();
  const {
    groups: { byId: groupsById },
    byId,
    byStatus: {
      accepted: { total }
    }
  } = state.devices;
  const reports =
    getUserSettings(state).reports || state.users.globalSettings[`${state.users.currentUser}-reports`] || (Object.keys(byId).length ? defaultReports : []);
  const newReports = reports.map(report => initializeDistributionData(report, groupsById, byId, total));
  return Promise.resolve(dispatch(actions.setDeviceReports(newReports)));
});

export const getReportsDataWithoutBackendSupport = createAsyncThunk(`${sliceName}/getReportsDataWithoutBackendSupport`, (_, { dispatch, getState }) =>
  Promise.all([dispatch(getAllDevicesByStatus(DEVICE_STATES.accepted)), dispatch(getGroups()), dispatch(getDynamicGroups())]).then(() => {
    const { dynamic: dynamicGroups, static: staticGroups } = getGroupsSelector(getState());
    return Promise.all([
      ...staticGroups.map(group => dispatch(getAllGroupDevices(group))),
      ...dynamicGroups.map(group => dispatch(getAllDynamicGroupDevices(group)))
    ]).then(() => dispatch(deriveReportsData()));
  })
);

export const getDeviceConnect = createAsyncThunk(`${sliceName}/getDeviceConnect`, (id, { dispatch }) =>
  GeneralApi.get(`${deviceConnect}/devices/${id}`).then(({ data }) =>
    Promise.all([dispatch(actions.receivedDevice({ connect_status: data.status, connect_updated_ts: data.updated_ts, id })), Promise.resolve(data)])
  )
);

export const getSessionDetails = createAsyncThunk(`${sliceName}/getSessionDetails`, ({ sessionId, deviceId, userId, startDate, endDate }) => {
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
});

export const getDeviceFileDownloadLink = createAsyncThunk(`${sliceName}/getDeviceFileDownloadLink`, ({ deviceId, path }) =>
  Promise.resolve(`${deviceConnect}/devices/${deviceId}/download?path=${encodeURIComponent(path)}`)
);

export const deviceFileUpload = createAsyncThunk(`${sliceName}/deviceFileUpload`, ({ deviceId, path, file }, { dispatch }) => {
  let formData = new FormData();
  formData.append('path', path);
  formData.append('file', file);
  const uploadId = uuid();
  const cancelSource = new AbortController();
  return Promise.all([
    dispatch(setSnackbar('Uploading file')),
    dispatch(initUpload({ id: uploadId, progress: { inprogress: true, uploadProgress: 0, cancelSource } })),
    GeneralApi.uploadPut(
      `${deviceConnect}/devices/${deviceId}/upload`,
      formData,
      e => dispatch(uploadProgress({ id: uploadId, progress: progress(e) })),
      cancelSource.signal
    )
  ])
    .then(() => Promise.resolve(dispatch(setSnackbar('Upload successful', TIMEOUTS.fiveSeconds))))
    .catch(err => {
      if (isCancel(err)) {
        return dispatch(setSnackbar('The upload has been cancelled', TIMEOUTS.fiveSeconds));
      }
      return commonErrorHandler(err, `Error uploading file to device.`, dispatch);
    })
    .finally(() => dispatch(cleanUpUpload(uploadId)));
});

export const getDeviceAuth = createAsyncThunk(`${sliceName}/getDeviceAuth`, (id, { dispatch }) =>
  Promise.resolve(dispatch(getDevicesWithAuth([{ id }]))).then(results => {
    if (results[results.length - 1]) {
      return Promise.resolve(results[results.length - 1][0]);
    }
    return Promise.resolve();
  })
);

export const getDevicesWithAuth = createAsyncThunk(`${sliceName}/getDevicesWithAuth`, (devices, { dispatch, getState }) =>
  devices.length
    ? GeneralApi.get(`${deviceAuthV2}/devices?id=${devices.map(device => device.id).join('&id=')}`)
        .then(({ data: receivedDevices }) => {
          const { devicesById } = reduceReceivedDevices(receivedDevices, [], getState());
          return Promise.all([dispatch(actions.receivedDevices(devicesById)), Promise.resolve(receivedDevices)]);
        })
        .catch(err => commonErrorHandler(err, `Error: ${err}`, dispatch))
    : Promise.resolve([[], []])
);

export const updateDeviceAuth = createAsyncThunk(`${sliceName}/updateDeviceAuth`, ({ deviceId, authId, status }, { dispatch, getState }) =>
  GeneralApi.put(`${deviceAuthV2}/devices/${deviceId}/auth/${authId}/status`, { status })
    .then(() => Promise.all([dispatch(getDeviceAuth(deviceId)), dispatch(setSnackbar('Device authorization status was updated successfully'))]))
    .catch(err => commonErrorHandler(err, 'There was a problem updating the device authorization status:', dispatch))
    .then(() => Promise.resolve(dispatch(actions.maybeUpdateDevicesByStatus({ deviceId, authId }))))
    .finally(() => dispatch(setDeviceListState({ refreshTrigger: !getDeviceListState(getState()).refreshTrigger })))
);

export const updateDevicesAuth = createAsyncThunk(`${sliceName}/updateDevicesAuth`, ({ deviceIds, status }, { dispatch, getState }) => {
  let devices = getDevicesById(getState());
  const deviceIdsWithoutAuth = deviceIds.reduce((accu, id) => (devices[id].auth_sets ? accu : [...accu, { id }]), []);
  return dispatch(getDevicesWithAuth(deviceIdsWithoutAuth)).then(() => {
    devices = getDevicesById(getState());
    // for each device, get id and id of authset & make api call to accept
    // if >1 authset, skip instead
    const deviceAuthUpdates = deviceIds.map(id => {
      const device = devices[id];
      if (device.auth_sets.length !== 1) {
        return Promise.reject();
      }
      // api call device.id and device.authsets[0].id
      return dispatch(updateDeviceAuth({ authId: device.auth_sets[0].id, deviceId: device.id, status })).catch(err =>
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
});

export const deleteAuthset = createAsyncThunk(`${sliceName}/deleteAuthset`, ({ deviceId, authId }, { dispatch, getState }) =>
  GeneralApi.delete(`${deviceAuthV2}/devices/${deviceId}/auth/${authId}`)
    .then(() => Promise.all([dispatch(setSnackbar('Device authorization status was updated successfully'))]))
    .catch(err => commonErrorHandler(err, 'There was a problem updating the device authorization status:', dispatch))
    .then(() => Promise.resolve(dispatch(actions.maybeUpdateDevicesByStatus({ deviceId, authId }))))
    .finally(() => dispatch(setDeviceListState({ refreshTrigger: !getState().devices.deviceList.refreshTrigger })))
);

export const preauthDevice = createAsyncThunk(`${sliceName}/preauthDevice`, (authset, { dispatch }) =>
  GeneralApi.post(`${deviceAuthV2}/devices`, authset)
    .catch(err => {
      if (err.response.status === 409) {
        return Promise.reject('A device with a matching identity data set already exists');
      }
      return commonErrorHandler(err, 'The device could not be added:', dispatch);
    })
    .then(() => Promise.resolve(dispatch(setSnackbar('Device was successfully added to the preauthorization list', TIMEOUTS.fiveSeconds))))
);

export const decommissionDevice = createAsyncThunk(`${sliceName}/decommissionDevice`, ({ deviceId, authId }, { dispatch, getState }) =>
  GeneralApi.delete(`${deviceAuthV2}/devices/${deviceId}`)
    .then(() => Promise.resolve(dispatch(setSnackbar('Device was decommissioned successfully'))))
    .catch(err => commonErrorHandler(err, 'There was a problem decommissioning the device:', dispatch))
    .then(() => Promise.resolve(dispatch(actions.maybeUpdateDevicesByStatus({ deviceId, authId }))))
    // trigger reset of device list list!
    .finally(() => dispatch(setDeviceListState({ refreshTrigger: !getState().devices.deviceList.refreshTrigger })))
);

export const getDeviceConfig = createAsyncThunk(`${sliceName}/getDeviceConfig`, (deviceId, { dispatch }) =>
  GeneralApi.get(`${deviceConfig}/${deviceId}`)
    .then(({ data }) => Promise.all([dispatch(actions.receivedDevice({ id: deviceId, config: data })), Promise.resolve(data)]))
    .catch(err => {
      // if we get a proper error response we most likely queried a device without an existing config check-in and we can just ignore the call
      if (err.response?.data?.error.status_code !== 404) {
        return commonErrorHandler(err, `There was an error retrieving the configuration for device ${deviceId}.`, dispatch, commonErrorFallback);
      }
    })
);

export const setDeviceConfig = createAsyncThunk(`${sliceName}/setDeviceConfig`, ({ deviceId, config }, { dispatch }) =>
  GeneralApi.put(`${deviceConfig}/${deviceId}`, config)
    .catch(err => commonErrorHandler(err, `There was an error setting the configuration for device ${deviceId}.`, dispatch, commonErrorFallback))
    .then(() => Promise.resolve(dispatch(getDeviceConfig(deviceId))))
);

export const applyDeviceConfig = createAsyncThunk(
  `${sliceName}/applyDeviceConfig`,
  ({ deviceId, configDeploymentConfiguration, isDefault, config }, { dispatch, getState }) =>
    GeneralApi.post(`${deviceConfig}/${deviceId}/deploy`, configDeploymentConfiguration)
      .catch(err => commonErrorHandler(err, `There was an error deploying the configuration to device ${deviceId}.`, dispatch, commonErrorFallback))
      .then(({ data }) => {
        const device = getDeviceByIdSelector(getState(), deviceId);
        const { canManageUsers } = getUserCapabilities(getState());
        let tasks = [
          dispatch(actions.receivedDevice({ ...device, config: { ...device.config, deployment_id: '' } })),
          new Promise(resolve => setTimeout(() => resolve(dispatch(getSingleDeployment(data.deployment_id))), TIMEOUTS.oneSecond))
        ];
        if (isDefault && canManageUsers) {
          const { previous } = getGlobalSettings(getState()).defaultDeviceConfig ?? {};
          tasks.push(dispatch(saveGlobalSettings({ defaultDeviceConfig: { current: config, previous } })));
        }
        return Promise.all(tasks);
      })
);

export const setDeviceTags = createAsyncThunk(`${sliceName}/setDeviceTags`, ({ deviceId, tags }, { dispatch }) =>
  // to prevent tag set failures, retrieve the device & use the freshest etag we can get
  Promise.resolve(dispatch(getDeviceById(deviceId))).then(device => {
    const headers = device.etag ? { 'If-Match': device.etag } : {};
    return GeneralApi.put(
      `${inventoryApiUrl}/devices/${deviceId}/tags`,
      Object.entries(tags).map(([name, value]) => ({ name, value })),
      { headers }
    )
      .catch(err => commonErrorHandler(err, `There was an error setting tags for device ${deviceId}.`, dispatch, 'Please check your connection.'))
      .then(() => Promise.all([dispatch(actions.receivedDevice({ ...device, tags })), dispatch(setSnackbar('Device name changed'))]));
  })
);

export const getDeviceTwin = createAsyncThunk(`${sliceName}/getDeviceTwin`, ({ deviceId, integration }, { dispatch, getState }) => {
  let providerResult = {};
  return GeneralApi.get(`${iotManagerBaseURL}/devices/${deviceId}/state`)
    .then(({ data }) => {
      providerResult = { ...data, twinError: '' };
    })
    .catch(err => {
      providerResult = {
        twinError: `There was an error getting the ${EXTERNAL_PROVIDER[integration.provider].twinTitle.toLowerCase()} for device ${deviceId}. ${err}`
      };
    })
    .finally(() => {
      const device = getDeviceByIdSelector(getState(), deviceId);
      Promise.resolve(dispatch(actions.receivedDevice({ ...device, twinsByIntegration: { ...device.twinsByIntegration, ...providerResult } })));
    });
});

export const setDeviceTwin = createAsyncThunk(`${sliceName}/getDeviceTwin`, ({ deviceId, integration, settings }, { dispatch, getState }) =>
  GeneralApi.put(`${iotManagerBaseURL}/devices/${deviceId}/state/${integration.id}`, { desired: settings })
    .catch(err =>
      commonErrorHandler(
        err,
        `There was an error updating the ${EXTERNAL_PROVIDER[integration.provider].twinTitle.toLowerCase()} for device ${deviceId}.`,
        dispatch
      )
    )
    .then(() => {
      const device = getDeviceByIdSelector(getState(), deviceId);
      const { twinsByIntegration = {} } = device;
      const { [integration.id]: currentState = {} } = twinsByIntegration;
      return Promise.resolve(
        dispatch(actions.receivedDevice({ ...device, twinsByIntegration: { ...twinsByIntegration, [integration.id]: { ...currentState, desired: settings } } }))
      );
    })
);

const prepareSearchArguments = ({ filters, group, state, status }) => {
  const { filterTerms } = convertDeviceListStateToFilters({ filters, group, offlineThreshold: state.app.offlineThreshold, selectedIssues: [], status });
  const { columnSelection = [] } = getUserSettings(state);
  const selectedAttributes = columnSelection.map(column => ({ attribute: column.key, scope: column.scope }));
  const attributes = [...defaultAttributes, { scope: 'identity', attribute: getIdAttribute(state).attribute }, ...selectedAttributes];
  return { attributes, filterTerms };
};

export const getSystemDevices = createAsyncThunk(`${sliceName}/getSystemDevices`, (options, { dispatch, getState }) => {
  const { id, page = defaultPage, perPage = defaultPerPage, sortOptions = [] } = options;
  const state = getState();
  const { hasFullFiltering } = getTenantCapabilities(state);
  if (!hasFullFiltering) {
    return Promise.resolve();
  }
  const { attributes: deviceAttributes = {} } = getDeviceByIdSelector(state, id);
  const { mender_gateway_system_id = '' } = deviceAttributes;
  const filters = [
    { ...emptyFilter, key: 'mender_is_gateway', operator: DEVICE_FILTERING_OPTIONS.$ne.key, value: 'true', scope: 'inventory' },
    { ...emptyFilter, key: 'mender_gateway_system_id', value: mender_gateway_system_id, scope: 'inventory' }
  ];
  const { attributes, filterTerms } = prepareSearchArguments({ filters, state });
  const { hasReporting } = getFeatures(state);
  return GeneralApi.post(getSearchEndpoint(hasReporting), {
    page,
    per_page: perPage,
    filters: filterTerms,
    sort: sortOptions,
    attributes
  })
    .catch(err => commonErrorHandler(err, `There was an error getting system devices device ${id}.`, dispatch, 'Please check your connection.'))
    .then(({ data, headers }) => {
      const state = getState();
      const { devicesById, ids } = reduceReceivedDevices(data, [], state);
      const device = {
        ...getDeviceByIdSelector(state, id),
        systemDeviceIds: ids,
        systemDeviceTotal: Number(headers[headerNames.total])
      };
      return Promise.resolve(dispatch(actions.receivedDevices({ ...devicesById, [id]: device })));
    });
});

export const getGatewayDevices = createAsyncThunk(`${sliceName}/getGatewayDevices`, (deviceId, { dispatch, getState }) => {
  const state = getState();
  const { attributes = {} } = getDeviceByIdSelector(state, deviceId);
  const { mender_gateway_system_id = '' } = attributes;
  const filters = [
    { ...emptyFilter, key: 'id', operator: DEVICE_FILTERING_OPTIONS.$ne.key, value: deviceId, scope: 'identity' },
    { ...emptyFilter, key: 'mender_is_gateway', value: 'true', scope: 'inventory' },
    { ...emptyFilter, key: 'mender_gateway_system_id', value: mender_gateway_system_id, scope: 'inventory' }
  ];
  const { attributes: attributeSelection, filterTerms } = prepareSearchArguments({ filters, state });
  const { hasReporting } = getFeatures(getState());
  return GeneralApi.post(getSearchEndpoint(hasReporting), {
    page: 1,
    per_page: MAX_PAGE_SIZE,
    filters: filterTerms,
    attributes: attributeSelection
  }).then(({ data }) => {
    const { ids } = reduceReceivedDevices(data, [], getState());
    let tasks = ids.map(deviceId => dispatch(getDeviceInfo(deviceId)));
    tasks.push(dispatch(actions.receivedDevice({ id: deviceId, gatewayIds: ids })));
    return Promise.all(tasks);
  });
});

export const getDevicesInBounds = createAsyncThunk(`${sliceName}/getDevicesInBounds`, ({ bounds, group }, { dispatch, getState }) => {
  const state = getState();
  const { filterTerms } = convertDeviceListStateToFilters({
    group: group === ALL_DEVICES ? undefined : group,
    groups: state.devices.groups,
    status: DEVICE_STATES.accepted
  });
  const { hasReporting } = getFeatures(state);
  return GeneralApi.post(getSearchEndpoint(hasReporting), {
    page: 1,
    per_page: MAX_PAGE_SIZE,
    filters: filterTerms,
    attributes: geoAttributes,
    geo_bounding_box_filter: {
      geo_bounding_box: {
        location: {
          top_left: { lat: bounds._northEast.lat, lon: bounds._southWest.lng },
          bottom_right: { lat: bounds._southWest.lat, lon: bounds._northEast.lng }
        }
      }
    }
  }).then(({ data }) => {
    const { devicesById } = reduceReceivedDevices(data, [], getState());
    return Promise.resolve(dispatch(actions.receivedDevices(devicesById)));
  });
});
