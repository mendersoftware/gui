import AppConstants from '../constants/app-constants';
import AppDispatcher from '../dispatchers/app-dispatcher';
import DeploymentsApi from '../api/deployments-api';
import parse from 'parse-link-header';

const apiUrl = '/api/management/v1';
const deploymentsApiUrl = `${apiUrl}/deployments`;

// default per page until pagination and counting integrated
const default_per_page = 20;
const default_page = 1;

const AppActions = {
  /* 
    General 
  */
  setSnackbar: (message, duration, action, component, onClick, onClose) =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_SNACKBAR,
      message: message,
      duration: duration,
      action: action,
      children: component,
      onClick: onClick,
      onClose: onClose
    }),

  setDeploymentRelease: release =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_DEPLOYMENT_RELEASE,
      release
    }),

  /*Deployments */
  // all deployments
  getDeployments: (page = default_page, per_page = default_per_page) =>
    DeploymentsApi.get(`${deploymentsApiUrl}/deployments?page=${page}&per_page=${per_page}`).then(res => {
      var deployments = res.body;
      AppDispatcher.handleViewAction({
        actionType: AppConstants.RECEIVE_DEPLOYMENTS,
        deployments
      });
      return Promise.resolve(deployments);
    }),

  getDeploymentsInProgress: (page = default_page, per_page = default_per_page) =>
    DeploymentsApi.get(`${deploymentsApiUrl}/deployments?status=inprogress&page=${page}&per_page=${per_page}`).then(res => {
      var deployments = res.body;
      AppDispatcher.handleViewAction({
        actionType: AppConstants.RECEIVE_ACTIVE_DEPLOYMENTS,
        deployments
      });
      return Promise.resolve(deployments);
    }),

  getPastDeployments: (page = default_page, per_page = default_per_page, startDate, endDate, group) => {
    var created_after = startDate ? `&created_after=${startDate}` : '';
    var created_before = endDate ? `&created_before=${endDate}` : '';
    var search = group ? `&search=${group}` : '';

    return DeploymentsApi.get(
      `${deploymentsApiUrl}/deployments?status=finished&per_page=${per_page}&page=${page}${created_after}${created_before}${search}`
    ).then(res => {
      var deployments = res.body;
      AppDispatcher.handleViewAction({
        actionType: AppConstants.RECEIVE_PAST_DEPLOYMENTS,
        deployments
      });
      return Promise.resolve(deployments);
    });
  },

  getDeploymentsWithStats: deployments =>
    Promise.all(
      deployments.map(deployment =>
        // have to call inventory each time - accepted list can change order so must refresh inventory too
        AppActions.getSingleDeploymentStats(deployment.id).then(stats => {
          deployment.stats = stats;
          AppDispatcher.handleViewAction({
            actionType: AppConstants.RECEIVE_PAST_DEPLOYMENTS,
            deployments
          });
          return Promise.resolve(deployment);
        })
      )
    ),

  getPendingDeployments: (page = default_page, per_page = default_per_page) =>
    DeploymentsApi.get(`${deploymentsApiUrl}/deployments?status=pending&page=${page}&per_page=${per_page}`).then(res => {
      var deployments = res.body;
      AppDispatcher.handleViewAction({
        actionType: AppConstants.RECEIVE_PENDING_DEPLOYMENTS,
        deployments: deployments
      });
      var links = parse(res.headers['link']);
      return Promise.resolve({ deployments, links });
    }),
  getDeploymentCount: (status, startDate, endDate, group) => {
    var created_after = startDate ? `&created_after=${startDate}` : '';
    var created_before = endDate ? `&created_before=${endDate}` : '';
    var search = group ? `&search=${group}` : '';
    const DeploymentCount = (page = 1, per_page = 500, count = 0) =>
      DeploymentsApi.get(`${deploymentsApiUrl}/deployments?status=${status}&per_page=${per_page}&page=${page}${created_after}${created_before}${search}`).then(
        res => {
          var links = parse(res.headers['link']);
          count += res.body.length;
          if (links.next) {
            page++;
            return DeploymentCount(page, per_page, count);
          }
          return Promise.resolve(count);
        }
      );

    return DeploymentCount().then(count => {
      if (status === 'inprogress') {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.INPROGRESS_COUNT,
          count: count
        });
      }
      return Promise.resolve(count);
    });
  },
  createDeployment: deployment => DeploymentsApi.post(`${deploymentsApiUrl}/deployments`, deployment).then(data => data.location),

  getSingleDeployment: id => DeploymentsApi.get(`${deploymentsApiUrl}/deployments/${id}`).then(res => res.body),

  getSingleDeploymentStats: id => DeploymentsApi.get(`${deploymentsApiUrl}/deployments/${id}/statistics`).then(res => res.body),

  getSingleDeploymentDevices: id => DeploymentsApi.get(`${deploymentsApiUrl}/deployments/${id}/devices`).then(res => res.body),

  getDeviceLog: (deploymentId, deviceId) => DeploymentsApi.getText(`${deploymentsApiUrl}/deployments/${deploymentId}/devices/${deviceId}/log`),

  abortDeployment: deploymentId => DeploymentsApi.put(`${deploymentsApiUrl}/deployments/${deploymentId}/status`, { status: 'aborted' }),

  sortTable: (table, column, direction) =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SORT_TABLE,
      table: table,
      column: column,
      direction: direction
    }),

  setLocalStorage: (key, value) =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_LOCAL_STORAGE,
      key: key,
      value: value
    })
};

export default AppActions;
