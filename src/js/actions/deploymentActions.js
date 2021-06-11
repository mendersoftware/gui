import DeploymentConstants from '../constants/deploymentConstants';
import GeneralApi, { headerNames } from '../api/general-api';
import { commonErrorHandler, setSnackbar } from '../actions/appActions';
import { startTimeSort } from '../helpers';

const apiUrl = '/api/management/v1';
const apiUrlV2 = '/api/management/v2';
export const deploymentsApiUrl = `${apiUrl}/deployments`;
export const deploymentsApiUrlV2 = `${apiUrlV2}/deployments`;

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

const SORTING_DIRECTIONS = {
  asc: 'asc',
  desc: 'desc'
};

/*Deployments */
export const getDeploymentsByStatus = (
  status,
  page = default_page,
  per_page = default_per_page,
  startDate,
  endDate,
  group,
  type,
  shouldSelect = true,
  sort = SORTING_DIRECTIONS.desc
) => (dispatch, getState) => {
  const created_after = startDate ? `&created_after=${startDate}` : '';
  const created_before = endDate ? `&created_before=${endDate}` : '';
  const search = group ? `&search=${group}` : '';
  const typeFilter = type ? `&type=${type}` : '';
  return GeneralApi.get(
    `${deploymentsApiUrl}/deployments?status=${status}&per_page=${per_page}&page=${page}${created_after}${created_before}${search}${typeFilter}&sort=${sort}`
  ).then(res => {
    const { deployments, deploymentIds } = transformDeployments(res.data, getState().deployments.byId);
    let tasks = deploymentIds.reduce(
      (accu, deploymentId) => {
        accu.push(dispatch(getSingleDeploymentStats(deploymentId)));
        if (deployments[deploymentId].type === DeploymentConstants.DEPLOYMENT_TYPES.configuration) {
          accu.push(dispatch(getSingleDeployment(deploymentId)));
        }
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
  });
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
    .catch(err => commonErrorHandler(err, 'Error creating deployment.', dispatch))
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

export const getSingleDeploymentStats = id => dispatch =>
  GeneralApi.get(`${deploymentsApiUrl}/deployments/${id}/statistics`).then(res =>
    dispatch({ type: DeploymentConstants.RECEIVE_DEPLOYMENT_STATS, stats: res.data, deploymentId: id })
  );

export const getSingleDeployment = id => (dispatch, getState) =>
  Promise.all([GeneralApi.get(`${deploymentsApiUrl}/deployments/${id}`), GeneralApi.get(`${deploymentsApiUrl}/deployments/${id}/devices`)]).then(responses => {
    const [deploymentRes, deploymentDeviceListRes] = responses;
    const storedDeployment = getState().deployments.byId[id] || {};
    const deploymentDevices = storedDeployment.devices || {};
    const devices = deploymentDeviceListRes.data.reduce((accu, item) => {
      accu[item.id] = item;
      const log = (deploymentDevices[item.id] || {}).log;
      if (log) {
        accu[item.id].log = log;
      }
      return accu;
    }, {});
    return Promise.all([
      dispatch({
        type: DeploymentConstants.RECEIVE_DEPLOYMENT,
        deployment: {
          ...DeploymentConstants.deploymentPrototype,
          ...storedDeployment,
          ...deploymentRes.data,
          name: decodeURIComponent(deploymentRes.data.name),
          devices
        }
      }),
      dispatch(getSingleDeploymentStats(id))
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
        dispatch({ type: DeploymentConstants[`RECEIVE_${status.toUpperCase()}_DEPLOYMENTS`], deployments, deploymentIds, status, total }),
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
