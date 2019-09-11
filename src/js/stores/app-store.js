import { EventEmitter } from 'events'; // from device

import AppDispatcher from '../dispatchers/app-dispatcher';
import AppConstants from '../constants/app-constants';
import { customSort, stringToBoolean } from '../helpers';

var CHANGE_EVENT = 'change';

var _artifactsRepo = [];
var _currentGroup = null;
var _currentDevice = null;
var _deploymentRelease = null;
var _currentGroupDevices = [];
var _totalNumberDevices, _totalPendingDevices, _totalAcceptedDevices, _totalRejectedDevices, _totalPreauthDevices, _deviceLimit, _numberInProgress;
_totalPendingDevices = _totalAcceptedDevices = 0;
var _filters = [];
var _attributes = {
  id: 'ID'
};
var _snackbar = {
  open: false,
  message: ''
};
var _currentUser = {};
var _hasMultitenancy = mender_environment && stringToBoolean(mender_environment.features.hasMultitenancy);
var _organization = {};
var _showHelptips = null;
var _showOnboardingTips = true;
var _showOnboardingTipsDialog = false;
var _showConnectDeviceDialog = false;
var _showCreateArtifactDialog = false;
var _onboardingComplete = !!_onboardingComplete || (mender_environment && mender_environment.disableOnboarding) || !!JSON.parse(window.localStorage.getItem('onboardingComplete'));
var _onboardingProgress = 0;
var _onboardingDeviceType = null;
var _onboardingApproach = null;
var _onboardingArtifactIncluded = null;
var _groups = [];
var _releasesRepo = [];
var _uploadInProgress = false;
const _MenderVersion = mender_environment && mender_environment.menderVersion ? mender_environment.menderVersion : 'master';
const _menderArtifactVersion = mender_environment && mender_environment.menderArtifactVersion ? mender_environment.menderArtifactVersion : 'master';
const _menderDebPackageVersion = mender_environment && mender_environment.menderDebPackageVersion ? mender_environment.menderDebPackageVersion : 'master';
var _demoArtifactPort = mender_environment && mender_environment.demoArtifactPort ? mender_environment.demoArtifactPort : 85;
var _globalSettings = {};

const _versionInformation = {
  Mender: mender_environment.menderVersion,
  'Mender-Artifact': mender_environment.menderArtifactVersion,
  'Meta-Mender': mender_environment.metaMenderVersion,
  Deployments: mender_environment.services.deploymentsVersion,
  Deviceauth: mender_environment.services.deviceauthVersion,
  Inventory: mender_environment.services.inventoryVersion
};

const _deploymentDeviceLimit = 5000;

/* Temp local devices */

var _alldevices = [];
var _accepted = [];
var _pending = [];
var _preauthorized = [];
var _rejected = [];

function _selectGroup(group) {
  _filters = [];
  _currentGroup = group;
}

function _selectDevice(device) {
  _currentDevice = device;
}

function _addNewGroup(group, devices, type) {
  var tmpGroup = group;
  for (var i = 0; i < devices.length; i++) {
    tmpGroup.devices.push(devices[i].id);
  }
  tmpGroup.id = _groups.length + 1;
  tmpGroup.type = type ? type : 'public';
  _groups.push(tmpGroup);
  _selectGroup(_groups[_groups.length] - 1);
}

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

function _filterDevicesByType(devices, device_types) {
  // from all devices, find if device type
  var filtered = [];

  for (var i = 0; i < devices.length; i++) {
    var device = devices[i];
    var attrs = {};
    // get device type from within attributes
    if (device.attributes) {
      for (var x = 0; x < device.attributes.length; x++) {
        attrs[device.attributes[x].name] = device.attributes[x].value;
      }

      for (var y = 0; y < device_types.length; y++) {
        if (device_types[y] === attrs.device_type) {
          filtered.push(device);
          break;
        }
      }
    }
  }

  return filtered;
}

function _setFilterAttributes(attrs) {
  // sets the available inventory attributes to be used in filtering devices
  for (var i = 0; i < attrs.length; i++) {
    _attributes[attrs[i].name] = attrs[i].name;
  }
  _attributes.id = 'ID';
}

function _addToGroup(group, devices) {
  var tmpGroup = group;
  const idx = _groups.findIndex(item => item.id === tmpGroup);
  if (idx != undefined) {
    for (var i = 0; i < devices.length; i++) {
      if (tmpGroup.devices.indexOf(devices[i].id) === -1) {
        tmpGroup.devices.push(devices[i].id);
      } else {
        tmpGroup.devices.splice(tmpGroup.devices.indexOf(devices[i].id), 1);
      }
    }
    _groups[idx] = tmpGroup;

    // reset filters
    _filters = [];

    // TODO - delete if empty group?
  } else {
    // New group
    _addNewGroup(group, devices, 'public');
    // TODO - go through devices and add group
  }
}

function _removeGroup(groupId) {
  const idx = _groups.findIndex(item => item.id === groupId);
  const group = _groups[idx];
  if (_currentGroup === group) {
    _selectGroup();
  }
  _groups.splice(idx, 1);
}

function _addGroup(group, idx) {
  if (idx !== undefined) {
    _groups.splice(idx, 0, group);
  }
}

function discoverDevices(array) {
  var unique = {};
  _alldevices.forEach(device => {
    if (typeof unique[device.artifact_name] == 'undefined') {
      unique[device.artifact_name] = 0;
    }
    unique[device.artifact_name]++;
  });

  if (array.length) {
    for (var val in unique) {
      const idx = array.findIndex(item => item.name === val);
      if (idx > -1) {
        array[idx]['devices'] = unique[val];
      }
    }
  }
  return array;
}

function _uploadArtifact(artifact) {
  if (artifact.id) {
    _artifactsRepo[_artifactsRepo.findIndex(item => item.id === artifact.id)] = artifact;
  } else {
    artifact.id = _artifactsRepo.length + 1;
    _artifactsRepo.push(artifact);
  }
}

function _uploadProgress(bool) {
  _uploadInProgress = bool;
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

function _collateArtifacts() {
  var newArray = [];
  _artifactsRepo.forEach(repo => {
    var x = newArray.findIndex(item => item.name === repo.name);
    if (x > -1) {
      newArray[x].device_types_compatible = newArray[x].device_types_compatible.concat(
        repo.device_types_compatible.filter(item => {
          return newArray[x].device_types_compatible.indexOf(item) < 0;
        })
      );
    } else {
      newArray.push(repo);
    }
  });
  return newArray;
}

const removeArtifact = id => {
  const index = _artifactsRepo.findIndex(item => item.id === id);
  const name = _artifactsRepo[index].name;
  _artifactsRepo.splice(index, 1);
  const releaseIndex = _releasesRepo.findIndex(item => item.Name === name);
  const releaseArtifactIndex = _releasesRepo[releaseIndex].Artifacts.findIndex(item => item.id === id);
  _releasesRepo[releaseIndex].Artifacts.splice(releaseArtifactIndex, 1);
  if (!_releasesRepo[releaseIndex].Artifacts.length) {
    _releasesRepo.splice(releaseIndex, 1);
  }
};

/*
 * API STARTS HERE
 */
function setArtifacts(artifacts) {
  if (artifacts) {
    _artifactsRepo = artifacts;
  }
  _artifactsRepo.sort(customSort(1, 'modified'));
}

function setArtifactUrl(id, url) {
  const artifact = AppStore.getSoftwareArtifact('id', id);
  artifact.url = url;
}

function setReleases(releases) {
  if (releases) {
    _releasesRepo = releases;
  }
  _releasesRepo.sort(customSort(1, 'name'));
}

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

function setDevices(devices) {
  if (devices) {
    var newDevices = {};
    devices.forEach(element => {
      newDevices[element.status] = newDevices[element.status] || [];
      newDevices[element.status].push(element);
    });
    _alldevices = devices;
    if (!_currentGroup) {
      // if "all devices" selected
      _currentGroupDevices = devices;
    }
  }
}

function setTotalDevices(count) {
  _totalNumberDevices = count;
}
function setTotalPendingDevices(count) {
  _totalPendingDevices = count;
}
function setTotalAcceptedDevices(count) {
  _totalAcceptedDevices = count;
}
function setTotalRejectedDevices(count) {
  _totalRejectedDevices = count;
}
function setTotalPreauthDevices(count) {
  _totalPreauthDevices = count;
}
function setDeviceLimit(limit) {
  _deviceLimit = limit;
}

function setGroupDevices(devices) {
  _currentGroupDevices = [];
  devices.forEach((element, index) => {
    _currentGroupDevices[index] = element;
  });
}

function setAcceptedDevices(devices) {
  _accepted = devices;
}

function setPendingDevices(devices) {
  _pending = devices;
}

function setPreauthDevices(devices) {
  _preauthorized = devices;
}

function setRejectedDevices(devices) {
  _rejected = devices;
}

function setGroups(groups) {
  if (groups) {
    _groups = groups;
  }
}

function setDeploymentRelease(release) {
  _deploymentRelease = release;
}

function setGlobalSettings(settings) {
  _globalSettings = settings;
}

function _setSnackbar(message, duration, action, children, onClick, onClose) {
  var show = message ? true : false;
  _snackbar = { open: show, message, maxWidth: '900px', autoHideDuration: duration, action, children, onClick, onClose };
}

function _setCurrentUser(user) {
  _currentUser = user;
}

function _setOrganization(org) {
  _organization = org;
}

function _setShowHelptips(val) {
  _showHelptips = val;
}

function _setShowOnboardingHelp(val) {
  _showOnboardingTips = val;
}
function _setShowOnboardingTipsDialog(val) {
  _showOnboardingTipsDialog = val;
}
function _setShowConnectDeviceDialog(val) {
  _showConnectDeviceDialog = val;
}
function _setShowCreateArtifactDialog(val) {
  _showCreateArtifactDialog = val;
}
function _setOnboardingProgress(val) {
  _onboardingProgress = val;
}

function _setOnboardingDeviceType(val) {
  _onboardingDeviceType = val;
}

function _setOnboardingApproach(val) {
  _onboardingApproach = val;
}

function _setOnboardingComplete(val) {
  _onboardingComplete = val;
}

function _setOnboardingArtifactIncluded(val) {
  if (_onboardingArtifactIncluded === null) {
    _onboardingArtifactIncluded = val;
  }
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

  /*
   * Return list of groups
   */
  getGroups: () => _groups,

  getSingleGroup: (attr, val) => _groups.find(item => item[attr] === val),

  /*
   * Return group object for current group selection
   */
  getSelectedGroup: () => _currentGroup,

  getSelectedDevice: () => _currentDevice,

  // for use when switching tab from artifacts to create a deployment
  getDeploymentRelease: () => _deploymentRelease,

  /*
   * Return list of devices by current selected group
   */
  getAllDevices: () => _alldevices,

  /*
   * Return list of devices by current selected group
   */
  getGroupDevices: () => _currentGroupDevices,

  /*
   * Return single device by id
   */
  getSingleDevice: id => _alldevices.find(item => item.id === id),

  /*
   * Return set of filters for list of devices
   */
  getFilterAttributes: () => _attributes,

  /*
   * Return set of filters for list of devices
   */
  getFilters: () => _filters,

  /*
   * Return true or false for device matching _filters
   */
  matchFilters: (item, filters) => _matchFilters(item, filters),

  /*
   * Return list of saved artifacts objects
   */
  getArtifactsRepo: () => discoverDevices(_artifactsRepo),

  /*
   * return list of artifacts where duplicate names are collated with device compatibility lists combined
   */
  getCollatedArtifacts: () => _collateArtifacts(),

  /*
   * Return single artifact by attr
   */
  getSoftwareArtifact: (attr, val) => _artifactsRepo.find(item => item[attr] === val),

  /*
   * Return list of saved release objects
   */
  getReleases: () => _releasesRepo,

  /*
   * Return single release with corresponding Artifacts
   */
  getRelease: name => _releasesRepo.find(item => item.Name === name),

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

  /*
   * Return list of devices given group and device_type
   */
  filterDevicesByType: (devices, device_types) => _filterDevicesByType(devices, device_types),

  getOrderedDeploymentDevices: devices => _sortDeploymentDevices(devices),

  getAcceptedDevices: () => _accepted || [],

  getPendingDevices: () => _pending || [],

  getPreauthorizedDevices: () => _preauthorized || [],

  getRejectedDevices: () => _rejected || [],

  getTotalDevices: () => _totalNumberDevices,

  getTotalPendingDevices: () => _totalPendingDevices,

  getTotalAcceptedDevices: () => _totalAcceptedDevices,

  getTotalRejectedDevices: () => _totalRejectedDevices,

  getTotalPreauthDevices: () => _totalPreauthDevices,

  getDeviceLimit: () => _deviceLimit,

  /*
   * Return activity log
   */
  getActivity: () => _activityLog,

  getSnackbar: () => _snackbar,

  getCurrentUser: () => _currentUser,

  // return boolean rather than organization details
  hasMultitenancy: () => _hasMultitenancy,

  getIsHosted: () => (mender_environment && stringToBoolean(mender_environment.features.isHosted)) || window.location.hostname === 'hosted.mender.io',

  getIsEnterprise: () => mender_environment && stringToBoolean(mender_environment.features.isEnterprise),

  getVersionInformation: () => _versionInformation,

  getOrganization: () => _organization,

  showHelptips: () => _showHelptips,

  getOnboardingComplete: () => _onboardingComplete,

  getOnboardingProgress: () => _onboardingProgress,

  getOnboardingDeviceType: () => _onboardingDeviceType,

  getOnboardingApproach: () => _onboardingApproach,

  getOnboardingArtifactIncluded: () => _onboardingArtifactIncluded,

  getShowOnboardingTips: () => _showOnboardingTips,

  getShowOnboardingTipsDialog: () => _showOnboardingTipsDialog,

  getShowConnectDeviceDialog: () => _showConnectDeviceDialog,

  getShowCreateArtifactDialog: () => _showCreateArtifactDialog,

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

  getUploadInProgress: () => _uploadInProgress,

  getGlobalSettings: () => _globalSettings,

  get2FARequired: () => _globalSettings.hasOwnProperty('2fa') && _globalSettings['2fa'] === 'enabled',

  getDeploymentDeviceLimit: () => _deploymentDeviceLimit,

  dispatcherIndex: AppDispatcher.register(payload => {
    var action = payload.action;
    switch (action.actionType) {
    case AppConstants.SELECT_GROUP:
      _selectGroup(payload.action.group);
      break;
    case AppConstants.SELECT_DEVICE:
      _selectDevice(payload.action.device);
      break;
    case AppConstants.ADD_TO_GROUP:
      _addToGroup(payload.action.group, payload.action.devices);
      break;
    case AppConstants.REMOVE_GROUP:
      _removeGroup(payload.action.groupId);
      break;
    case AppConstants.ADD_GROUP:
      _addGroup(payload.action.group, payload.action.index);
      break;
    case AppConstants.SET_FILTER_ATTRIBUTES:
      _setFilterAttributes(payload.action.attrs);
      break;
    case AppConstants.UPLOAD_ARTIFACT:
      _uploadArtifact(payload.action.artifact);
      break;
    case AppConstants.UPLOAD_PROGRESS:
      _uploadProgress(payload.action.inprogress);
      break;
    case AppConstants.SORT_TABLE:
      _sortTable(payload.action.table, payload.action.column, payload.action.direction);
      break;

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

    case AppConstants.SET_CURRENT_USER:
      _setCurrentUser(payload.action.user);
      break;

    case AppConstants.SET_ORGANIZATION:
      _setOrganization(payload.action.organization);
      break;

      /* Onboarding */
    case AppConstants.SET_SHOW_HELP:
      _setShowHelptips(payload.action.show);
      break;
    case AppConstants.SET_SHOW_ONBOARDING_HELP:
      _setShowOnboardingHelp(payload.action.show);
      break;
    case AppConstants.SET_ONBOARDING_COMPLETE:
      _setOnboardingComplete(payload.action.show);
      break;
    case AppConstants.SET_ONBOARDING_ARTIFACT_INCLUDED:
      _setOnboardingArtifactIncluded(payload.action.value);
      break;
    case AppConstants.SET_SHOW_ONBOARDING_HELP_DIALOG:
      _setShowOnboardingTipsDialog(payload.action.show);
      break;
    case AppConstants.SET_SHOW_CONNECT_DEVICE:
      _setShowConnectDeviceDialog(payload.action.show);
      break;
    case AppConstants.SET_SHOW_CREATE_ARTIFACT:
      _setShowCreateArtifactDialog(payload.action.show);
      break;
    case AppConstants.SET_ONBOARDING_PROGRESS:
      _setOnboardingProgress(payload.action.value);
      break;
    case AppConstants.SET_ONBOARDING_DEVICE_TYPE:
      _setOnboardingDeviceType(payload.action.value);
      break;
    case AppConstants.SET_ONBOARDING_APPROACH:
      _setOnboardingApproach(payload.action.value);
      break;

      /* API */
    case AppConstants.RECEIVE_ARTIFACTS:
      setArtifacts(payload.action.artifacts);
      break;
    case AppConstants.ARTIFACTS_SET_ARTIFACT_URL:
      setArtifactUrl(payload.action.id, payload.action.url);
      break;
    case AppConstants.ARTIFACTS_REMOVED_ARTIFACT:
      removeArtifact(payload.action.id);
      break;
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
    case AppConstants.RECEIVE_RELEASES:
      setReleases(payload.action.releases);
      break;

      /* API */
    case AppConstants.RECEIVE_ALL_DEVICES:
      setDevices(payload.action.devices);
      break;

    case AppConstants.SET_TOTAL_DEVICES:
      setTotalDevices(payload.action.count);
      break;

    case AppConstants.SET_PENDING_DEVICES_COUNT:
      setTotalPendingDevices(payload.action.count);
      break;

    case AppConstants.SET_ACCEPTED_DEVICES_COUNT:
      setTotalAcceptedDevices(payload.action.count);
      break;

    case AppConstants.SET_REJECTED_DEVICES_COUNT:
      setTotalRejectedDevices(payload.action.count);
      break;

    case AppConstants.SET_PREAUTH_DEVICES_COUNT:
      setTotalPreauthDevices(payload.action.count);
      break;

    case AppConstants.SET_ACCEPTED_DEVICES:
      setAcceptedDevices(payload.action.devices);
      break;

    case AppConstants.SET_PENDING_DEVICES:
      setPendingDevices(payload.action.devices);
      break;

    case AppConstants.SET_REJECTED_DEVICES:
      setRejectedDevices(payload.action.devices);
      break;

    case AppConstants.SET_PREAUTHORIZED_DEVICES:
      setPreauthDevices(payload.action.devices);
      break;

    case AppConstants.SET_DEVICE_LIMIT:
      setDeviceLimit(payload.action.limit);
      break;

      /* API */
    case AppConstants.RECEIVE_GROUP_DEVICES:
      setGroupDevices(payload.action.devices);
      break;

    case AppConstants.RECEIVE_GROUPS:
      setGroups(payload.action.groups);
      break;

    case AppConstants.SET_DEPLOYMENT_RELEASE:
      setDeploymentRelease(payload.action.release);
      break;

    case AppConstants.SET_GLOBAL_SETTINGS:
      setGlobalSettings(payload.action.settings);
      break;
    }

    AppStore.emitChange();
    return true;
  })
});

export default AppStore;
