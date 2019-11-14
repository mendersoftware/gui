import AppConstants from '../constants/app-constants';
import AppDispatcher from '../dispatchers/app-dispatcher';
import DeploymentsApi from '../api/deployments-api';
import GeneralApi from '../api/general-api';
import UsersApi from '../api/users-api';
import parse from 'parse-link-header';
import { advanceOnboarding } from '../utils/onboardingmanager';

const apiUrl = '/api/management/v1';
const deploymentsApiUrl = `${apiUrl}/deployments`;
const useradmApiUrl = `${apiUrl}/useradm`;
const tenantadmUrl = `${apiUrl}/tenantadm`;
const hostedLinks = 'https://s3.amazonaws.com/hosted-mender-artifacts-onboarding/';

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

  /* 
    User management 
  */
  loginUser: userData => UsersApi.postLogin(`${useradmApiUrl}/auth/login`, userData).then(res => res.text),

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

  get2FAQRCode: () => UsersApi.get(`${useradmApiUrl}/2faqr`).then(res => res.qr),

  /* 
    Global settings 
  */
  getGlobalSettings: () =>
    UsersApi.get(`${useradmApiUrl}/settings`).then(res => {
      AppDispatcher.handleViewAction({
        actionType: AppConstants.SET_GLOBAL_SETTINGS,
        settings: res
      });
      return Promise.resolve(res);
    }),

  saveGlobalSettings: settings =>
    UsersApi.post(`${useradmApiUrl}/settings`, settings).then(() => {
      AppDispatcher.handleViewAction({
        actionType: AppConstants.SET_GLOBAL_SETTINGS,
        settings
      });
      return Promise.resolve(settings);
    }),

  /*
    Onboarding
  */
  setShowHelptips: val => {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_SHOW_HELP,
      show: val
    });
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_SHOW_ONBOARDING_HELP,
      show: val
    });
  },
  setShowOnboardingHelp: val =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_SHOW_ONBOARDING_HELP,
      show: val
    }),
  setOnboardingProgress: value =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_ONBOARDING_PROGRESS,
      value
    }),
  setOnboardingDeviceType: value =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_ONBOARDING_DEVICE_TYPE,
      value
    }),
  setOnboardingApproach: value =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_ONBOARDING_APPROACH,
      value
    }),
  setOnboardingArtifactIncluded: value =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_ONBOARDING_ARTIFACT_INCLUDED,
      value
    }),
  setShowDismissOnboardingTipsDialog: val =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_SHOW_ONBOARDING_HELP_DIALOG,
      show: val
    }),
  setOnboardingComplete: val => {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_ONBOARDING_COMPLETE,
      show: val
    });
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_SHOW_ONBOARDING_HELP,
      show: !val
    });
    if (val) {
      advanceOnboarding('onboarding-finished');
    }
  },
  setShowConnectingDialog: val =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_SHOW_CONNECT_DEVICE,
      show: val
    }),
  setShowCreateArtifactDialog: val =>
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_SHOW_CREATE_ARTIFACT,
      show: val
    }),
  setConnectingDialogProgressed: val => {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_CONNECT_DEVICE_PROGRESSED,
      progressed: val
    });
    if (val) {
      advanceOnboarding('devices-accepted-onboarding');
    }
  },

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
