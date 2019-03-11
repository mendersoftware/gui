import AppConstants from '../constants/app-constants';
import AppDispatcher from '../dispatchers/app-dispatcher';
import ArtifactsApi from '../api/artifacts-api';
import DeploymentsApi from '../api/deployments-api';
import DevicesApi from '../api/devices-api';
import GeneralApi from '../api/general-api';
import UsersApi from '../api/users-api';
import parse from 'parse-link-header';

var rootUrl = 'https://localhost:443';
const apiUrl = `${rootUrl}/api/management/v1`;
const apiUrlV2 = `${rootUrl}/api/management/v2`;
const deploymentsApiUrl = `${apiUrl}/deployments`;
const deviceAuthV2 = `${apiUrlV2}/devauth`;
const inventoryApiUrl = `${apiUrl}/inventory`;
const useradmApiUrl = `${apiUrl}/useradm`;
const tenantadmUrl = `${apiUrl}/tenantadm`;
const hostedLinks = 'https://s3.amazonaws.com/hosted-mender-artifacts-onboarding/';

// default per page until pagination and counting integrated
const default_per_page = 20;
const default_page = 1;

const AppActions = {
  /*
   * Device inventory functions
   */
  selectGroup: group => {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SELECT_GROUP,
      group: group
    });
  },

  addDeviceToGroup: (group, device) => {
    return DevicesApi.put(`${inventoryApiUrl}/devices/${device}/group`, { group });
  },

  removeDeviceFromGroup: (device, group) => {
    return DevicesApi.delete(`${inventoryApiUrl}/devices/${device}/group/${group}`);
  },

  addGroup: (group, idx) => {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.ADD_GROUP,
      group: group,
      index: idx
    });
  },

  /* Groups */
  getGroups: () =>
    DevicesApi.get(`${inventoryApiUrl}/groups`).then(res => {
      AppDispatcher.handleViewAction({
        actionType: AppConstants.RECEIVE_GROUPS,
        groups: res.body
      });
      return Promise.resolve(res.body);
    }),

  getGroupDevices: (group, page = default_page, per_page = default_per_page) => {
    var forGroup = group ? `&group=${group}` : '&has_group=false';
    return DevicesApi.get(`${inventoryApiUrl}/devices?per_page=${per_page}&page=${page}${forGroup}`);
  },

  setGroupDevices: devices => {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.RECEIVE_GROUP_DEVICES,
      devices: devices
    });
  },

  setFilterAttributes: attrs =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_FILTER_ATTRIBUTES,
      attrs: attrs
    }),

  getDeviceById: id => DevicesApi.get(`${inventoryApiUrl}/devices/${id}`).then(res => res.body),

  getDevices: (page = default_page, per_page = default_per_page, search_term) => {
    // get devices from inventory
    var search = search_term ? `&${search_term}` : '';
    return DevicesApi.get(`${inventoryApiUrl}/devices?per_page=${per_page}&page=${page}${search}`).then(res => res.body);
  },
  getAllDevices: () => {
    const getAllDevices = (per_page = 200, page = 1, devices = []) =>
      DevicesApi.get(`${inventoryApiUrl}/devices?per_page=${per_page}&page=${page}`).then(res => {
        var links = parse(res.headers['link']);
        devices.push(...res.body);
        if (links.next) {
          return getAllDevices(per_page, page + 1, devices);
        }
        return Promise.resolve(devices);
      });
    return getAllDevices();
  },
  getNumberOfDevicesInGroup: function(group) {
    var forGroup = group ? `&group=${group}` : '&has_group=false';
    return DevicesApi.get(`${inventoryApiUrl}/devices?per_page=1&page=1${forGroup}`).then(res => Promise.resolve(Number(res.headers['x-total-count'])));
  },
  getAllDevicesInGroup: function(group) {
    var forGroup = group ? `&group=${group}` : '&has_group=false';
    const getDeviceCount = (per_page = 200, page = 1, devices = []) =>
      DevicesApi.get(`${inventoryApiUrl}/devices?per_page=${per_page}&page=${page}${forGroup}`).then(function(res) {
        var links = parse(res.headers['link']);
        devices.push(...res.body);
        if (links.next) {
          return getDeviceCount(per_page, page + 1, devices);
        }
        return Promise.resolve(devices);
      });
    return getDeviceCount();
  },

  /* 
    Device Auth + admission 
  */

  getDeviceCount: status => {
    var filter = status ? `?status=${status}` : '';

    return DevicesApi.get(`${deviceAuthV2}/devices/count${filter}`).then(res => {
      switch (status) {
      case 'pending':
        AppDispatcher.handleViewAction({
          actionType: AppConstants.SET_PENDING_DEVICES,
          count: res.body.count
        });
        break;
      case 'accepted':
        AppDispatcher.handleViewAction({
          actionType: AppConstants.SET_ACCEPTED_DEVICES,
          count: res.body.count
        });
        break;
      case 'rejected':
        AppDispatcher.handleViewAction({
          actionType: AppConstants.SET_REJECTED_DEVICES,
          count: res.body.count
        });
        break;
      case 'preauthorized':
        AppDispatcher.handleViewAction({
          actionType: AppConstants.SET_PREAUTH_DEVICES,
          count: res.body.count
        });
        break;
      default:
        AppDispatcher.handleViewAction({
          actionType: AppConstants.SET_TOTAL_DEVICES,
          count: res.body.count
        });
      }
      return Promise.resolve(res.body.count);
    });
  },

  getDeviceLimit: () =>
    DevicesApi.get(`${deviceAuthV2}/limits/max_devices`).then(res => {
      AppDispatcher.handleViewAction({
        actionType: AppConstants.SET_DEVICE_LIMIT,
        limit: res.body.limit
      });
      return Promise.resolve(res.body.limit);
    }),

  getDevicesByStatus: (status, page = default_page, per_page = default_per_page) => {
    var dev_status = status ? `status=${status}` : '';
    return DevicesApi.get(`${deviceAuthV2}/devices?${dev_status}&per_page=${per_page}&page=${page}`).then(response => response.body);
  },

  getAllDevicesByStatus: status => {
    const getAllDevices = (per_page = 200, page = 1, devices = []) =>
      DevicesApi.get(`${deviceAuthV2}/devices?status=${status}&per_page=${per_page}&page=${page}`).then(res => {
        var links = parse(res.headers['link']);
        devices.push(...res.body);
        if (links.next) {
          return getAllDevices(per_page, page + 1, devices);
        }
        return Promise.resolve(devices);
      });
    return getAllDevices();
  },

  getDeviceAuth: id => DevicesApi.get(`${deviceAuthV2}/devices/${id}`).then(res => res.body),

  updateDeviceAuth: (device_id, auth_id, status) => DevicesApi.put(`${deviceAuthV2}/devices/${device_id}/auth/${auth_id}/status`, { status: status }),

  deleteAuthset: (device_id, auth_id) => DevicesApi.delete(`${deviceAuthV2}/devices/${device_id}/auth/${auth_id}`),

  preauthDevice: authset => {
    console.log(authset);
    return DevicesApi.post(`${deviceAuthV2}/devices`, authset);
  },

  decommissionDevice: id => DevicesApi.delete(`${deviceAuthV2}/devices/${id}`),

  /* 
    General 
  */
  setSnackbar: (message, duration, action) =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_SNACKBAR,
      message: message,
      duration: duration,
      action: action
    }),

  /* 
    User management 
  */
  loginUser: userData =>
    UsersApi.postLogin(`${useradmApiUrl}/auth/login`, userData)
      .then(res => res.text)
      .catch(err => {
        if (err.error.code && err.error.code !== 200) {
          return Promise.reject(err);
        }
      }),

  getUserList: () => UsersApi.get(`${useradmApiUrl}/users`),

  getUser: id => UsersApi.get(`${useradmApiUrl}/users/${id}`),

  createUser: userData => UsersApi.post(`${useradmApiUrl}/users`, userData),

  removeUser: userId => UsersApi.delete(`${useradmApiUrl}/users/${userId}`),

  editUser: (userId, userData) => UsersApi.put(`${useradmApiUrl}/users/${userId}`, userData),

  setCurrentUser: user =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_CURRENT_USER,
      user: user
    }),

  /* 
    Tenant management + Hosted Mender
  */
  getUserOrganization: () =>
    GeneralApi.get(`${tenantadmUrl}/user/tenant`).then(res => {
      AppDispatcher.handleViewAction({
        actionType: AppConstants.SET_ORGANIZATION,
        organization: res.body
      });
      return Promise.resolve(res.body);
    }),

  getHostedLinks: id => GeneralApi.getNoauth(`${hostedLinks}${id}/links.json`).then(res => JSON.parse(res.text)),

  /* 
    Global settings 
  */
  getGlobalSettings: () =>
    GeneralApi.get(`${useradmApiUrl}/settings`).then(res => {
      AppDispatcher.handleViewAction({
        actionType: AppConstants.SET_GLOBAL_SETTINGS,
        settings: res.body
      });
      return Promise.resolve(res.body);
    }),

  saveGlobalSettings: settings =>
    UsersApi.post(`${useradmApiUrl}/settings`, settings).then(() => {
      AppDispatcher.handleViewAction({
        actionType: AppConstants.SET_GLOBAL_SETTINGS,
        settings: settings
      });
      return Promise.resolve();
    }),

  /*
    Onboarding
  */
  setShowHelptips: val =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_SHOW_HELP,
      show: val
    }),

  /* Artifacts */
  getArtifacts: () =>
    ArtifactsApi.get(`${deploymentsApiUrl}/artifacts`).then(artifacts => {
      AppDispatcher.handleViewAction({
        actionType: AppConstants.RECEIVE_ARTIFACTS,
        artifacts: artifacts
      });
      return Promise.resolve(artifacts);
    }),

  uploadArtifact: (meta, file, progress) => {
    var formData = new FormData();
    formData.append('size', file.size);
    formData.append('description', meta.description);
    formData.append('artifact', file);
    return ArtifactsApi.postFormData(`${deploymentsApiUrl}/artifacts`, formData, e => progress(e.percent));
  },

  setUploadInProgress: bool =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.UPLOAD_PROGRESS,
      inprogress: bool
    }),

  editArtifact: (id, body) => ArtifactsApi.putJSON(`${deploymentsApiUrl}/artifacts/${id}`, body),

  removeArtifact: id => ArtifactsApi.delete(`${deploymentsApiUrl}/artifacts/${id}`),

  setDeploymentArtifact: artifact =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_DEPLOYMENT_ARTIFACT,
      artifact: artifact
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
