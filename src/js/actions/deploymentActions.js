import DeploymentConstants from '../constants/deploymentConstants';
import GeneralApi, { headerNames } from '../api/general-api';
import { setSnackbar } from '../actions/appActions';
import { mapAttributesToAggregator, preformatWithRequestID, startTimeSort } from '../helpers';

const apiUrl = '/api/management/v1';
const apiUrlV2 = '/api/management/v2';
const deploymentsApiUrl = `${apiUrl}/deployments`;
const deploymentsApiUrlV2 = `${apiUrlV2}/deployments`;

// default per page until pagination and counting integrated
const default_per_page = 20;
const default_page = 1;

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
// all deployments
export const getDeployments = (page = default_page, per_page = default_per_page) => (dispatch, getState) =>
  GeneralApi.get(`${deploymentsApiUrl}/deployments?page=${page}&per_page=${per_page}`).then(res => {
    const deploymentsByStatus = res.data.reduce((accu, item) => {
      accu[item.status].push(item);
      return accu;
    }, mapAttributesToAggregator(getState().deployments.byStatus));
    return Promise.all(
      Object.entries(deploymentsByStatus).map(([status, value]) => {
        const { deployments, deploymentIds } = transformDeployments(value, getState().deployments.byId);
        return dispatch({ type: DeploymentConstants[`RECEIVE_${status.toUpperCase()}_DEPLOYMENTS`], deployments, deploymentIds, status });
      })
    );
  });

export const getDeploymentsByStatus = (status, page = default_page, per_page = default_per_page, startDate, endDate, group, shouldSelect = true) => (
  dispatch,
  getState
) => {
  var created_after = startDate ? `&created_after=${startDate}` : '';
  var created_before = endDate ? `&created_before=${endDate}` : '';
  var search = group ? `&search=${group}` : '';
  return GeneralApi.get(`${deploymentsApiUrl}/deployments?status=${status}&per_page=${per_page}&page=${page}${created_after}${created_before}${search}`).then(
    res => {
      const { deployments, deploymentIds } = transformDeployments(res.data, getState().deployments.byId);
      let tasks = deploymentIds.reduce(
        (accu, deploymentId) => {
          accu.push(dispatch(getSingleDeploymentStats(deploymentId)));
          return accu;
        },
        [
          dispatch({
            type: DeploymentConstants[`RECEIVE_${status.toUpperCase()}_DEPLOYMENTS`],
            deployments,
            deploymentIds,
            status,
            total: Number(res.headers[headerNames.total])
          })
        ]
      );
      if (shouldSelect) {
        tasks.push(dispatch({ type: DeploymentConstants[`SELECT_${status.toUpperCase()}_DEPLOYMENTS`], deploymentIds, status }));
      }
      return Promise.all(tasks);
    }
  );
};

export const createDeployment = newDeployment => dispatch => {
  let request;
  if (newDeployment.filter_id) {
    request = GeneralApi.post(`${deploymentsApiUrlV2}/deployments`, newDeployment);
  } else if (newDeployment.group) {
    request = GeneralApi.post(`${deploymentsApiUrl}/deployments/group/${newDeployment.group}`, newDeployment);
  } else {
    request = GeneralApi.post(`${deploymentsApiUrl}/deployments`, newDeployment);
  }
  return request
    .catch(err => {
      const errMsg = err.response.data?.error?.message || err.response.data?.error || err.error || '';
      dispatch(setSnackbar(preformatWithRequestID(err.response, `Error creating deployment. ${errMsg}`), null, 'Copy to clipboard'));
      return Promise.reject();
    })
    .then(data => {
      const lastslashindex = data.headers.location.lastIndexOf('/');
      const deploymentId = data.headers.location.substring(lastslashindex + 1);
      const deployment = {
        ...newDeployment,
        devices: newDeployment.devices ? newDeployment.devices.map(id => ({ id, status: 'pending' })) : [],
        stats: {}
      };
      return Promise.all([
        dispatch({
          type: DeploymentConstants.CREATE_DEPLOYMENT,
          deployment,
          deploymentId
        }),
        dispatch(getSingleDeployment(deploymentId)),
        dispatch(setSnackbar('Deployment created successfully', 8000))
      ]);
    });
};

export const getSingleDeployment = id => dispatch =>
  GeneralApi.get(`${deploymentsApiUrl}/deployments/${id}`).then(res =>
    dispatch({
      type: DeploymentConstants.RECEIVE_DEPLOYMENT,
      deployment: { ...res.data, name: decodeURIComponent(res.data.name) }
    })
  );

export const getSingleDeploymentStats = id => dispatch =>
  GeneralApi.get(`${deploymentsApiUrl}/deployments/${id}/statistics`).then(res =>
    dispatch({ type: DeploymentConstants.RECEIVE_DEPLOYMENT_STATS, stats: res.data, deploymentId: id })
  );

export const getSingleDeploymentDevices = id => (dispatch, getState) =>
  GeneralApi.get(`${deploymentsApiUrl}/deployments/${id}/devices`).then(res => {
    const deploymentDevices = (getState().deployments.byId[id] || {}).devices || {};
    const devices = res.data.reduce((accu, item) => {
      accu[item.id] = item;
      const log = (deploymentDevices[item.id] || {}).log;
      if (log) {
        accu[item.id].log = log;
      }
      return accu;
    }, {});
    return dispatch({
      type: DeploymentConstants.RECEIVE_DEPLOYMENT_DEVICES,
      devices,
      deploymentId: id
    });
  });

export const getDeviceLog = (deploymentId, deviceId) => (dispatch, getState) =>
  GeneralApi.get(`${deploymentsApiUrl}/deployments/${deploymentId}/devices/${deviceId}/log`).then(({ data: log }) => {
    const devices = getState().deployments.byId[deploymentId].devices;
    devices[deviceId].log = log;
    return dispatch({
      type: DeploymentConstants.RECEIVE_DEPLOYMENT_DEVICE_LOG,
      devices,
      deploymentId
    });
  });

export const abortDeployment = deploymentId => (dispatch, getState) =>
  GeneralApi.put(`${deploymentsApiUrl}/deployments/${deploymentId}/status`, { status: 'aborted' })
    .then(() => {
      const state = getState();
      let status = 'pending';
      let index = state.deployments.byStatus.pending.deploymentIds.findIndex(id => id === deploymentId);
      if (index < 0) {
        status = 'inprogress';
        index = state.deployments.byStatus.inprogress.deploymentIds.findIndex(id => id === deploymentId);
      }
      const deploymentIds = [
        ...state.deployments.byStatus[status].deploymentIds.slice(0, index),
        ...state.deployments.byStatus[status].deploymentIds.slice(index)
      ];
      const deployments = deploymentIds.reduce((accu, id) => {
        accu[id] = state.deployments.byId[id];
        return accu;
      }, {});
      const total = Math.max(state.deployments.byStatus[status].total - 1, 0);
      return Promise.all([
        dispatch({ type: DeploymentConstants[`RECEIVE_${status.toUpperCase()}_DEPLOYMENTS`], deployments, deploymentIds, status, total }),
        dispatch({
          type: DeploymentConstants.REMOVE_DEPLOYMENT,
          deploymentId
        }),
        dispatch(setSnackbar('The deployment was successfully aborted'))
      ]);
    })
    .catch(err => {
      console.log(err);
      return Promise.all([
        dispatch(setSnackbar(preformatWithRequestID(err.response, `There was wan error while aborting the deployment: ${err.response.data.error || ''}`))),
        Promise.reject(err)
      ]);
    });

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
