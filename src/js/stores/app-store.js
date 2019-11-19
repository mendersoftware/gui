import { EventEmitter } from 'events'; // from device

import AppDispatcher from '../dispatchers/app-dispatcher';
import AppConstants from '../constants/app-constants';
import { stringToBoolean } from '../helpers';

var CHANGE_EVENT = 'change';

var _deploymentRelease = null;
var _numberInProgress = 0;
var _filters = [];
var _snackbar = {
  open: false,
  message: ''
};
const _hostAddress = mender_environment && mender_environment.hostAddress ? mender_environment.hostAddress : null;
const _IntegrationVersion = mender_environment && mender_environment.integrationVersion ? mender_environment.integrationVersion : 'master';
const _MenderVersion = mender_environment && mender_environment.menderVersion ? mender_environment.menderVersion : 'master';
const _menderArtifactVersion = mender_environment && mender_environment.menderArtifactVersion ? mender_environment.menderArtifactVersion : 'master';
const _menderDebPackageVersion = mender_environment && mender_environment.menderDebPackageVersion ? mender_environment.menderDebPackageVersion : 'master';
var _demoArtifactPort = mender_environment && mender_environment.demoArtifactPort ? mender_environment.demoArtifactPort : 85;

const _versionInformation = {
  Integration: mender_environment.integrationVersion,
  'Mender-Client': mender_environment.menderVersion,
  'Mender-Artifact': mender_environment.menderArtifactVersion,
  'Meta-Mender': mender_environment.metaMenderVersion,
  Deployments: mender_environment.services.deploymentsVersion,
  Deviceauth: mender_environment.services.deviceauthVersion,
  Inventory: mender_environment.services.inventoryVersion,
  GUI: mender_environment.services.guiVersion || 'latest'
};

const _deploymentDeviceLimit = 5000;

function _matchFilters(device, filters) {
  /*
   * Match device attributes against _filters, return true or false
   */
  var match = true;
  var gotFilters = filters || _filters;
  for (var i = 0; i < gotFilters.length; i++) {
    if (gotFilters[i].key && gotFilters[i].value) {
      if (device[gotFilters[i].key] instanceof Array) {
        // array
        if (
          device[gotFilters[i].key]
            .join(', ')
            .toLowerCase()
            .indexOf(gotFilters[i].value.toLowerCase()) == -1
        ) {
          match = false;
        }
      } else {
        // string
        if (device[gotFilters[i].key].toLowerCase().indexOf(gotFilters[i].value.toLowerCase()) == -1) {
          match = false;
        }
      }
    }
  }
  return match;
}

// Deployments
var _deployments = [];
var _deploymentsInProgress = [];
var _pastDeployments = [];
var _pendingDeployments = [];
var _events = [];

var _hasDeployments = false;

//_al deployments.sort(startTimeSort);

var _activityLog = [];

function _sortDeploymentDevices(devices) {
  var newList = {
    aborted: [],
    decommissioned: [],
    'already-installed': [],
    downloading: [],
    failure: [],
    installing: [],
    noartifact: [],
    pending: [],
    rebooting: [],
    success: []
  };

  for (var i = 0; i < devices.length; i++) {
    newList[devices[i].status].push(devices[i]);
  }

  var newCombine = newList.failure.concat(
    newList.downloading,
    newList.installing,
    newList.rebooting,
    newList.pending,
    newList.success,
    newList.aborted,
    newList.noartifact,
    newList['already-installed'],
    newList.decommissioned
  );
  return newCombine;
}

function _sortTable(array, column, direction) {
  switch (array) {
  case '_artifactsRepo':
    _artifactsRepo.sort(customSort(direction, column));
    break;
  case '_currentGroupDevices':
    _currentGroupDevices.sort(customSort(direction, column));
    break;
  case '_pendingDevices':
    _pending.sort(customSort(direction, column));
    break;
  }
}

function startTimeSort(a, b) {
  return (b.created > a.created) - (b.created < a.created);
}

/*
 * API STARTS HERE
 */
function setHasDeployments(deployments) {
  _hasDeployments = deployments == null || deployments.length === 0 ? false : true;
}

function setDeployments(deployments) {
  _deployments = deployments;
  _deployments.sort(startTimeSort);
  if (deployments.length) {
    setHasDeployments(deployments);
  }
}

function setActiveDeployments(deployments) {
  _deploymentsInProgress = deployments;
  _deploymentsInProgress.sort(startTimeSort);
  if (deployments.length) {
    setHasDeployments(deployments);
  }
}

function setInProgressCount(count) {
  _numberInProgress = count;
}

function setPastDeployments(deployments) {
  _pastDeployments = deployments;
  _pastDeployments.sort(startTimeSort);
  if (deployments.length) {
    setHasDeployments(deployments);
  }
}

function setPendingDeployments(deployments) {
  _pendingDeployments = deployments;
  _pendingDeployments.sort(startTimeSort);
  if (deployments.length) {
    setHasDeployments(deployments);
  }
}

function setDeploymentRelease(release) {
  _deploymentRelease = release;
}

function _setSnackbar(message, duration, action, children, onClick, onClose) {
  var show = message ? true : false;
  _snackbar = { open: show, message, maxWidth: '900px', autoHideDuration: duration, action, children, onClick, onClose };
}

var AppStore = Object.assign({}, EventEmitter.prototype, {
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  changeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  // for use when switching tab from artifacts to create a deployment
  getDeploymentRelease: () => _deploymentRelease,

  /*
   * Return set of filters for list of devices
   */
  getFilters: () => _filters,

  /*
   * Return true or false for device matching _filters
   */
  matchFilters: (item, filters) => _matchFilters(item, filters),

  /*
   * Return list of finished deployments
   */
  getPastDeployments: () => _pastDeployments,

  /*
   * Return list of all deployments
   */
  getDeployments: () => _deployments,

  /*
   * Return list of pending deployments
   */
  getPendingDeployments: () => _pendingDeployments,

  /*
   * Return list of deployments in progress based on date
   */
  getDeploymentsInProgress: () => _deploymentsInProgress,

  /*
   * return only number in progress for top bar
   */
  getNumberInProgress: () => _numberInProgress,

  /*
   * Return boolean whether or not any deployments exist at all
   */
  getHasDeployments: () => _hasDeployments,

  /*
   * Return list of event objects from log
   */
  getEventLog: () => _events,

  getOrderedDeploymentDevices: devices => _sortDeploymentDevices(devices),

  /*
   * Return activity log
   */
  getActivity: () => _activityLog,

  getSnackbar: () => _snackbar,

  // return boolean rather than organization details
  hasMultitenancy: () => mender_environment && stringToBoolean(mender_environment.features.hasMultitenancy),

  getIsHosted: () => (mender_environment && stringToBoolean(mender_environment.features.isHosted)) || window.location.hostname === 'hosted.mender.io',

  getIsEnterprise: () => mender_environment && stringToBoolean(mender_environment.features.isEnterprise),

  getHostAddress: () => _hostAddress,

  getVersionInformation: () => _versionInformation,

  getIntegrationVersion: function() {
    // return version number
    var version = '';
    if (_IntegrationVersion) {
      // if first character NaN, is master branch
      version = isNaN(_IntegrationVersion.charAt(0)) ? 'master' : _IntegrationVersion;
    }
    return version;
  },

  getMenderVersion: function() {
    // return version number
    var version = '';
    if (_MenderVersion) {
      // if first character NaN, is master branch
      version = isNaN(_MenderVersion.charAt(0)) ? 'master' : _MenderVersion;
    }
    return version;
  },

  getMenderArtifactVersion: () => _menderArtifactVersion,

  getMenderDebPackageVersion: () => _menderDebPackageVersion,

  getDemoArtifactPort: () => _demoArtifactPort,

  getDocsVersion: function() {
    // return docs link friendly version
    var docsVersion = '';
    if (_MenderVersion && !isNaN(_MenderVersion.charAt(0))) {
      var splitArray = _MenderVersion.split('.').slice(0, 2);
      docsVersion = splitArray.join('.');
    }
    return docsVersion;
  },

  getDeploymentDeviceLimit: () => _deploymentDeviceLimit,

  dispatcherIndex: AppDispatcher.register(payload => {
    var action = payload.action;
    switch (action.actionType) {
    case AppConstants.SET_SNACKBAR:
      _setSnackbar(
        payload.action.message,
        payload.action.duration,
        payload.action.action,
        payload.action.children,
        payload.action.onClick,
        payload.action.onClose
      );
      break;

      /* API */
    case AppConstants.RECEIVE_DEPLOYMENTS:
      setDeployments(payload.action.deployments);
      break;
    case AppConstants.RECEIVE_ACTIVE_DEPLOYMENTS:
      setActiveDeployments(payload.action.deployments);
      break;
    case AppConstants.RECEIVE_PAST_DEPLOYMENTS:
      setPastDeployments(payload.action.deployments);
      break;
    case AppConstants.RECEIVE_PENDING_DEPLOYMENTS:
      setPendingDeployments(payload.action.deployments);
      break;
    case AppConstants.INPROGRESS_COUNT:
      setInProgressCount(payload.action.count);
      break;

      /* API */
    case AppConstants.SET_DEPLOYMENT_RELEASE:
      setDeploymentRelease(payload.action.release);
      break;
    }

    AppStore.emitChange();
    return true;
  })
});

export default AppStore;
