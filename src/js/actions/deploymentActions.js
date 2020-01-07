import parse from 'parse-link-header';
import * as DeploymentConstants from '../constants/deploymentConstants';
import DeploymentsApi from '../api/deployments-api';
import { startTimeSort } from '../helpers';

const apiUrl = '/api/management/v1';
const deploymentsApiUrl = `${apiUrl}/deployments`;

// default per page until pagination and counting integrated
const default_per_page = 20;
const default_page = 1;

const transformDeployments = (deployments, deploymentsById) =>
  deployments.sort(startTimeSort).reduce(
    (accu, item) => {
      accu.deployments[item.id] = { ...deploymentsById[item.id], ...item };
      accu.deploymentIds.push(item.id);
      return accu;
    },
    { deployments: {}, deploymentIds: [] }
  );

/*Deployments */
// all deployments
export const getDeployments = (page = default_page, per_page = default_per_page) => (dispatch, getState) =>
  DeploymentsApi.get(`${deploymentsApiUrl}/deployments?page=${page}&per_page=${per_page}`).then(res => {
    const deploymentsByStatus = res.body.reduce(
      (accu, item) => {
        accu[item.status].push(item);
        return accu;
      },
      { finished: [], inprogress: [], pending: [] }
    );
    return Promise.all(
      Object.entries(deploymentsByStatus).map(([status, value]) => {
        const { deployments, deploymentIds } = transformDeployments(value, getState().deployments.byId);
        return dispatch({ type: DeploymentConstants[`RECEIVE_${status.toUpperCase()}_DEPLOYMENTS`], deployments, deploymentIds });
      })
    );
  });

export const getDeploymentsByStatus = (status, page = default_page, per_page = default_per_page, startDate, endDate, group) => (dispatch, getState) => {
  var created_after = startDate ? `&created_after=${startDate}` : '';
  var created_before = endDate ? `&created_before=${endDate}` : '';
  var search = group ? `&search=${group}` : '';
  return DeploymentsApi.get(
    `${deploymentsApiUrl}/deployments?status=${status}&per_page=${per_page}&page=${page}${created_after}${created_before}${search}`
  ).then(res => {
    const { deployments, deploymentIds } = transformDeployments(res.body, getState().deployments.byId);
    let tasks = [
      dispatch({ type: DeploymentConstants[`RECEIVE_${status.toUpperCase()}_DEPLOYMENTS`], deployments, deploymentIds, status }),
      dispatch({ type: DeploymentConstants[`SELECT_${status.toUpperCase()}_DEPLOYMENTS`], deploymentIds, status })
    ];
    tasks.push(...deploymentIds.map(deploymentId => dispatch(getSingleDeploymentStats(deploymentId))));
    return Promise.all(tasks);
  });
};

export const getDeploymentCount = (status, startDate, endDate, group) => (dispatch, getState) => {
  var created_after = startDate ? `&created_after=${startDate}` : '';
  var created_before = endDate ? `&created_before=${endDate}` : '';
  var search = group ? `&search=${group}` : '';
  const DeploymentCount = (page = 1, per_page = 500, deployments = []) =>
    DeploymentsApi.get(`${deploymentsApiUrl}/deployments?status=${status}&per_page=${per_page}&page=${page}${created_after}${created_before}${search}`).then(
      res => {
        var links = parse(res.headers['link']);
        deployments.push(...res.body);
        if (links.next) {
          page++;
          return DeploymentCount(page, per_page, deployments);
        }
        return Promise.resolve(deployments);
      }
    );

  return DeploymentCount().then(deploymentList => {
    const { deployments, deploymentIds } = transformDeployments(deploymentList, getState().deployments.byId);
    return dispatch({ type: DeploymentConstants[`RECEIVE_${status.toUpperCase()}_DEPLOYMENTS_COUNT`], deployments, deploymentIds, status });
  });
};

export const createDeployment = deployment => dispatch =>
  DeploymentsApi.post(`${deploymentsApiUrl}/deployments`, deployment).then(data => {
    const lastslashindex = data.location.lastIndexOf('/');
    const deploymentId = data.location.substring(lastslashindex + 1);
    return Promise.all([
      dispatch({
        type: DeploymentConstants.CREATE_DEPLOYMENT,
        deployment,
        deploymentId
      }),
      dispatch(getSingleDeployment(deploymentId))
    ]);
  });

export const getSingleDeployment = id => dispatch =>
  DeploymentsApi.get(`${deploymentsApiUrl}/deployments/${id}`).then(res =>
    dispatch({
      type: DeploymentConstants.RECEIVE_DEPLOYMENT,
      deployment: res.body
    })
  );

export const getSingleDeploymentStats = id => dispatch =>
  DeploymentsApi.get(`${deploymentsApiUrl}/deployments/${id}/statistics`).then(res =>
    dispatch({ type: DeploymentConstants.RECEIVE_DEPLOYMENT_STATS, stats: res.body, deploymentId: id })
  );

export const getSingleDeploymentDevices = id => dispatch =>
  DeploymentsApi.get(`${deploymentsApiUrl}/deployments/${id}/devices`).then(res => {
    const devices = res.body.reduce((accu, item) => {
      accu[item.id] = item;
      return accu;
    }, {});
    return dispatch({
      type: DeploymentConstants.RECEIVE_DEPLOYMENT_DEVICES,
      devices,
      deploymentId: id
    });
  });

export const getDeviceLog = (deploymentId, deviceId) => (dispatch, getState) =>
  DeploymentsApi.getText(`${deploymentsApiUrl}/deployments/${deploymentId}/devices/${deviceId}/log`).then(log => {
    const devices = getState().deployments.byId[deploymentId].devices;
    devices[deviceId].log = log;
    return dispatch({
      type: DeploymentConstants.RECEIVE_DEPLOYMENT_DEVICE_LOG,
      devices,
      deploymentId
    });
  });

export const abortDeployment = deploymentId => (dispatch, getState) =>
  DeploymentsApi.put(`${deploymentsApiUrl}/deployments/${deploymentId}/status`, { status: 'aborted' }).then(() => {
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
    return Promise.all([
      dispatch({ type: DeploymentConstants[`RECEIVE_${status.toUpperCase()}_DEPLOYMENTS`], deployments, deploymentIds, status }),
      dispatch({
        type: DeploymentConstants.REMOVE_DEPLOYMENT,
        deploymentId
      })
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
