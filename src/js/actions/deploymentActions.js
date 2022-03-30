import DeploymentConstants from '../constants/deploymentConstants';
import { DEVICE_LIST_DEFAULTS } from '../constants/deviceConstants';
import GeneralApi, { apiUrl, headerNames } from '../api/general-api';
import { commonErrorHandler, setSnackbar } from '../actions/appActions';
import { startTimeSort } from '../helpers';
import { SORTING_OPTIONS } from '../constants/appConstants';
import Tracking from '../tracking';
import { saveGlobalSettings } from './userActions';

export const deploymentsApiUrl = `${apiUrl.v1}/deployments`;
export const deploymentsApiUrlV2 = `${apiUrl.v2}/deployments`;

// default per page until pagination and counting integrated
const { page: defaultPage, perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;

const transformDeployments = (deployments, deploymentsById) =>
  deployments.sort(startTimeSort).reduce(
    (accu, item) => {
      accu.deployments[item.id] = {
        ...DeploymentConstants.deploymentPrototype,
        ...deploymentsById[item.id],
        ...item,
        name: decodeURIComponent(item.name)
      };
      accu.deploymentIds.push(item.id);
      return accu;
    },
    { deployments: {}, deploymentIds: [] }
  );

/*Deployments */
export const getDeploymentsByStatus =
  (status, page = defaultPage, per_page = defaultPerPage, startDate, endDate, group, type, shouldSelect = true, sort = SORTING_OPTIONS.desc) =>
  (dispatch, getState) => {
    const created_after = startDate ? `&created_after=${startDate}` : '';
    const created_before = endDate ? `&created_before=${endDate}` : '';
    const search = group ? `&search=${group}` : '';
    const typeFilter = type ? `&type=${type}` : '';
    return GeneralApi.get(
      `${deploymentsApiUrl}/deployments?status=${status}&per_page=${per_page}&page=${page}${created_after}${created_before}${search}${typeFilter}&sort=${sort}`
    ).then(res => {
      const { deployments, deploymentIds } = transformDeployments(res.data, getState().deployments.byId);
      const total = Number(res.headers[headerNames.total]);
      let tasks = [
        dispatch({ type: DeploymentConstants.RECEIVE_DEPLOYMENTS, deployments }),
        dispatch({
          type: DeploymentConstants[`RECEIVE_${status.toUpperCase()}_DEPLOYMENTS`],
          deploymentIds,
          status,
          total: !(startDate || endDate || group || type) ? total : getState().deployments.byStatus[status].total
        })
      ];
      if (deploymentIds.length) {
        tasks.push(dispatch(getDeploymentsStats(deploymentIds)));
      }
      tasks = deploymentIds.reduce((accu, deploymentId) => {
        if (deployments[deploymentId].type === DeploymentConstants.DEPLOYMENT_TYPES.configuration) {
          accu.push(dispatch(getSingleDeployment(deploymentId)));
        }
        return accu;
      }, tasks);
      if (shouldSelect) {
        tasks.push(dispatch({ type: DeploymentConstants[`SELECT_${status.toUpperCase()}_DEPLOYMENTS`], deploymentIds, status, total }));
      }
      tasks.push({ deploymentIds, total });
      return Promise.all(tasks);
    });
  };

const isWithinFirstMonth = expirationDate => {
  if (!expirationDate) {
    return false;
  }
  const endOfFirstMonth = new Date(expirationDate);
  endOfFirstMonth.setMonth(endOfFirstMonth.getMonth() - 11);
  return endOfFirstMonth > new Date();
};

export const createDeployment = newDeployment => (dispatch, getState) => {
  let request;
  if (newDeployment.filter_id) {
    request = GeneralApi.post(`${deploymentsApiUrlV2}/deployments`, newDeployment);
  } else if (newDeployment.group) {
    request = GeneralApi.post(`${deploymentsApiUrl}/deployments/group/${newDeployment.group}`, newDeployment);
  } else {
    request = GeneralApi.post(`${deploymentsApiUrl}/deployments`, newDeployment);
  }
  const totalDeploymentCount = Object.values(getState().deployments.byStatus).reduce((accu, item) => accu + item.total, 0);
  const { hasDeployments } = getState().users.globalSettings;
  const { trial_expiration } = getState().organization.organization;
  return request
    .catch(err => commonErrorHandler(err, 'Error creating deployment.', dispatch))
    .then(data => {
      const lastslashindex = data.headers.location.lastIndexOf('/');
      const deploymentId = data.headers.location.substring(lastslashindex + 1);
      const deployment = {
        ...newDeployment,
        devices: newDeployment.devices ? newDeployment.devices.map(id => ({ id, status: 'pending' })) : [],
        stats: {}
      };
      let tasks = [
        dispatch({
          type: DeploymentConstants.CREATE_DEPLOYMENT,
          deployment,
          deploymentId
        }),
        dispatch(getSingleDeployment(deploymentId)),
        dispatch(setSnackbar('Deployment created successfully', 8000))
      ];
      if (!totalDeploymentCount) {
        if (!hasDeployments) {
          Tracking.event({ category: 'deployments', action: 'create_initial_deployment' });
          if (isWithinFirstMonth(trial_expiration)) {
            Tracking.event({ category: 'deployments', action: 'create_initial_deployment_first_month' });
          }
          tasks.push(dispatch(saveGlobalSettings({ hasDeployments: true })));
        }
        Tracking.event({ category: 'deployments', action: 'create_initial_deployment_user' });
      }
      return Promise.all(tasks);
    });
};

export const getDeploymentsStats = ids => (dispatch, getState) =>
  GeneralApi.post(`${deploymentsApiUrl}/deployments/statistics/list`, { deployment_ids: ids }).then(res => {
    const byIdState = getState().deployments.byId;
    const deployments = res.data.reduce((accu, item) => {
      accu[item.id] = { ...byIdState[item.id], stats: item.stats };
      return accu;
    }, {});
    return Promise.resolve(dispatch({ type: DeploymentConstants.RECEIVE_DEPLOYMENTS, deployments }));
  });

export const getDeploymentDevices =
  (id, options = {}) =>
  (dispatch, getState) => {
    const { page = defaultPage, perPage = defaultPerPage } = options;
    return GeneralApi.get(`${deploymentsApiUrl}/deployments/${id}/devices/list?deployment_id=${id}&page=${page}&per_page=${perPage}`).then(response => {
      const { devices: deploymentDevices = {} } = getState().deployments.byId[id] || {};
      const devices = response.data.reduce((accu, item) => {
        accu[item.id] = item;
        const log = (deploymentDevices[item.id] || {}).log;
        if (log) {
          accu[item.id].log = log;
        }
        return accu;
      }, {});
      return Promise.resolve(
        dispatch({
          type: DeploymentConstants.RECEIVE_DEPLOYMENT_DEVICES,
          deploymentId: id,
          devices,
          selectedDeviceIds: Object.keys(devices),
          totalDeviceCount: Number(response.headers[headerNames.total])
        })
      );
    });
  };

export const getSingleDeployment = id => (dispatch, getState) =>
  Promise.resolve(GeneralApi.get(`${deploymentsApiUrl}/deployments/${id}`)).then(({ data }) => {
    const storedDeployment = getState().deployments.byId[id] || {};
    return Promise.all([
      dispatch({
        type: DeploymentConstants.RECEIVE_DEPLOYMENT,
        deployment: {
          ...DeploymentConstants.deploymentPrototype,
          ...storedDeployment,
          ...data,
          name: decodeURIComponent(data.name)
        }
      }),
      dispatch(getDeploymentsStats([id]))
    ]);
  });

export const getDeviceLog = (deploymentId, deviceId) => (dispatch, getState) =>
  GeneralApi.get(`${deploymentsApiUrl}/deployments/${deploymentId}/devices/${deviceId}/log`)
    .catch(e => {
      console.log('no log here');
      console.log(e);
      return Promise.reject();
    })
    .then(({ data: log }) => {
      const stateDeployment = getState().deployments.byId[deploymentId];
      const deployment = {
        ...stateDeployment,
        devices: {
          ...stateDeployment.devices,
          [deviceId]: {
            ...stateDeployment.devices[deviceId],
            log
          }
        }
      };
      return Promise.all([
        Promise.resolve(
          dispatch({
            type: DeploymentConstants.RECEIVE_DEPLOYMENT_DEVICE_LOG,
            deployment
          })
        ),
        Promise.resolve(log)
      ]);
    });

export const abortDeployment = deploymentId => (dispatch, getState) =>
  GeneralApi.put(`${deploymentsApiUrl}/deployments/${deploymentId}/status`, { status: 'aborted' })
    .then(() => {
      const state = getState();
      let status = DeploymentConstants.DEPLOYMENT_STATES.pending;
      let index = state.deployments.byStatus.pending.deploymentIds.findIndex(id => id === deploymentId);
      if (index < 0) {
        status = DeploymentConstants.DEPLOYMENT_STATES.inprogress;
        index = state.deployments.byStatus.inprogress.deploymentIds.findIndex(id => id === deploymentId);
      }
      const deploymentIds = [
        ...state.deployments.byStatus[status].deploymentIds.slice(0, index),
        ...state.deployments.byStatus[status].deploymentIds.slice(index + 1)
      ];
      const deployments = deploymentIds.reduce((accu, id) => {
        accu[id] = state.deployments.byId[id];
        return accu;
      }, {});
      const total = Math.max(state.deployments.byStatus[status].total - 1, 0);
      return Promise.all([
        dispatch({ type: DeploymentConstants.RECEIVE_DEPLOYMENTS, deployments }),
        dispatch({ type: DeploymentConstants[`RECEIVE_${status.toUpperCase()}_DEPLOYMENTS`], deploymentIds, status, total }),
        dispatch({
          type: DeploymentConstants.REMOVE_DEPLOYMENT,
          deploymentId
        }),
        dispatch(setSnackbar('The deployment was successfully aborted'))
      ]);
    })
    .catch(err => commonErrorHandler(err, 'There was wan error while aborting the deployment:', dispatch));

export const updateDeploymentControlMap = (deploymentId, update_control_map) => dispatch =>
  GeneralApi.patch(`${deploymentsApiUrl}/deployments/${deploymentId}`, { update_control_map })
    .catch(err => commonErrorHandler(err, 'There was wan error while updating the deployment status:', dispatch))
    .then(() => Promise.resolve(dispatch(getSingleDeployment(deploymentId))));

export const selectDeployment = deploymentId => dispatch => {
  let tasks = [
    dispatch({
      type: DeploymentConstants.SELECT_DEPLOYMENT,
      deploymentId
    })
  ];
  if (deploymentId) {
    tasks.push(dispatch(getSingleDeployment(deploymentId)));
  }
  return Promise.all(tasks);
};

export const setDeploymentsState = selectionState => (dispatch, getState) => {
  const state = getState().deployments.selectionState;
  return Promise.resolve(
    dispatch({
      type: DeploymentConstants.SET_DEPLOYMENTS_STATE,
      state: {
        ...state,
        ...selectionState,
        ...Object.keys(DeploymentConstants.DEPLOYMENT_STATES).reduce((accu, item) => {
          accu[item] = {
            ...state[item],
            ...selectionState[item]
          };
          return accu;
        }, {}),
        general: {
          ...state.general,
          ...selectionState.general
        }
      }
    })
  );
};
