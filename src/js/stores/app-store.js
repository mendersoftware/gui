import { EventEmitter } from 'events'; // from device

import AppDispatcher from '../dispatchers/app-dispatcher';
import AppConstants from '../constants/app-constants';
import { customSort } from '../helpers';

var CHANGE_EVENT = 'change';

var _artifactsRepo = [];
var _currentGroup = null;
var _deploymentArtifact = null;
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
var _hasMultitenancy = false;
var _organization = {};
var _showHelptips = null;
var _groups = [];
var _releasesRepo = [];
var _uploadInProgress = false;
var _MenderVersion = null;
var _globalSettings = {};

/* Temp local devices */

var _alldevices = [];
var _pending = [];

function _selectGroup(group) {
  _filters = [];
  _currentGroup = group;
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
  var idx = findWithAttr(_groups, 'id', tmpGroup);
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
  var idx = findWithAttr(_groups, 'id', groupId);
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

function _getPendingDevices() {
  return _pending || [];
}

function discoverDevices(array) {
  var unique = {};

  for (var i = 0; i < _alldevices.length; i++) {
    if (typeof unique[_alldevices[i].artifact_name] == 'undefined') {
      unique[_alldevices[i].artifact_name] = 0;
    }
    unique[_alldevices[i].artifact_name]++;
  }

  if (array.length) {
    for (var val in unique) {
      var idx = findWithAttr(array, 'name', val);
      if (idx !== undefined) {
        array[idx]['devices'] = unique[val];
      }
    }
  }
  return array;
}

function _uploadArtifact(artifact) {
  if (artifact.id) {
    _artifactsRepo[findWithAttr(_artifactsRepo, 'id', artifact.id)] = artifact;
  } else {
    artifact.id = _artifactsRepo.length + 1;
    _artifactsRepo.push(artifact);
  }
}

function _uploadProgress(bool) {
  _uploadInProgress = bool;
}

// Deployments
var _deploymentsInProgress = [];
var _pastDeployments = [];
var _pendingDeployments = [];
var _events = [];

var _hasDeployments = false;

//_al deployments.sort(startTimeSort);

var _activityLog = [];

function _getPastDeployments() {
  return _pastDeployments;
}

function _getPendingDeployments() {
  return _pendingDeployments;
}

function _getDeploymentsInProgress() {
  return _deploymentsInProgress;
}
function _getHasDeployments() {
  return _hasDeployments;
}

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

  var newCombine = newList.success.concat(
    newList.downloading,
    newList.installing,
    newList.rebooting,
    newList.failure,
    newList.decommissioned,
    newList.aborted,
    newList['already-installed'],
    newList.noartifact,
    newList.pending
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

function findWithAttr(array, attr, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i][attr] === value) {
      return i;
    }
  }
}

function startTimeSort(a, b) {
  return (b.created > a.created) - (b.created < a.created);
}

function _collateArtifacts() {
  var newArray = [];
  for (var i = 0; i < _artifactsRepo.length; i++) {
    var x = findWithAttr(newArray, 'name', _artifactsRepo[i].name);
    if (typeof x !== 'undefined') {
      newArray[x].device_types_compatible = newArray[x].device_types_compatible.concat(
        _artifactsRepo[i].device_types_compatible.filter(item => {
          return newArray[x].device_types_compatible.indexOf(item) < 0;
        })
      );
    } else {
      newArray.push(_artifactsRepo[i]);
    }
  }
  return newArray;
}

/*
 * API STARTS HERE
 */
function setArtifacts(artifacts) {
  if (artifacts) {
    _artifactsRepo = artifacts;
  }
  _artifactsRepo.sort(customSort(1, 'modified'));
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

function setPendingDevices(devices) {
  if (devices) {
    var newDevices = {};
    devices.forEach(element => {
      newDevices[element.status] = newDevices[element.status] || [];
      newDevices[element.status].push(element);
    });
    _pending = newDevices.pending || [];
  }
}

function setGroups(groups) {
  if (groups) {
    _groups = groups;
  }
}

function setDeploymentArtifact(artifact) {
  _deploymentArtifact = artifact;
}

function setGlobalSettings(settings) {
  _globalSettings = settings;
}

function _setSnackbar(message, duration, action) {
  var show = message ? true : false;
  _snackbar = { open: show, message: message, maxWidth: '900px', autoHideDuration: duration, action: action };
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

var AppStore = Object.assign(EventEmitter.prototype, {
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

  getSingleGroup: (attr, val) => _groups[findWithAttr(_groups, attr, val)],

  /*
   * Return group object for current group selection
   */
  getSelectedGroup: () => _currentGroup,

  // for use when switching tab from artifacts to create a deployment
  getDeploymentArtifact: () => _deploymentArtifact,

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
  getSingleDevice: id => _alldevices[findWithAttr(_alldevices, 'id', id)],

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
  getSoftwareArtifact: (attr, val) => _artifactsRepo[findWithAttr(_artifactsRepo, attr, val)],

  /*
   * Return list of saved release objects
   */
  getReleases: () => _releasesRepo,

  /*
   * Return list of finished deployments
   */
  getPastDeployments: () => _getPastDeployments(),

  /*
   * Return list of pending deployments
   */
  getPendingDeployments: () => _getPendingDeployments(),

  /*
   * Return list of deployments in progress based on date
   */
  getDeploymentsInProgress: () => _getDeploymentsInProgress(),

  /*
   * return only number in progress for top bar
   */
  getNumberInProgress: () => _numberInProgress,

  /*
   * Return boolean whether or not any deployments exist at all
   */
  getHasDeployments: () => _getHasDeployments(),

  /*
   * Return list of event objects from log
   */
  getEventLog: () => _events,

  /*
   * Return list of devices given group and device_type
   */
  filterDevicesByType: (devices, device_types) => _filterDevicesByType(devices, device_types),

  getOrderedDeploymentDevices: devices => _sortDeploymentDevices(devices),

  getPendingDevices: () => _getPendingDevices(),

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

  getOrganization: () => _organization,

  showHelptips: () => _showHelptips,

  getMenderVersion: function() {
    // return version number
    var version = '';
    if (_MenderVersion) {
      // if first character NaN, is master branch
      version = isNaN(_MenderVersion.charAt(0)) ? 'master' : _MenderVersion;
    }
    return version;
  },

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

  dispatcherIndex: AppDispatcher.register(payload => {
    var action = payload.action;
    switch (action.actionType) {
    case AppConstants.SELECT_GROUP:
      _selectGroup(payload.action.group);
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
      _setSnackbar(payload.action.message, payload.action.duration, payload.action.action);
      break;

    case AppConstants.SET_CURRENT_USER:
      _setCurrentUser(payload.action.user);
      break;

    case AppConstants.SET_ORGANIZATION:
      _setOrganization(payload.action.organization);
      break;

    case AppConstants.SET_SHOW_HELP:
      _setShowHelptips(payload.action.show);
      break;

      /* API */
    case AppConstants.RECEIVE_ARTIFACTS:
      setArtifacts(payload.action.artifacts);
      break;

      /* API */
    case AppConstants.RECEIVE_RELEASES:
      setReleases(payload.action.releases);
      break;

      /* API */
    case AppConstants.RECEIVE_DEPLOYMENTS:
      setHasDeployments(payload.action.deployments);
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
    case AppConstants.RECEIVE_ALL_DEVICES:
      setDevices(payload.action.devices);
      break;

    case AppConstants.SET_TOTAL_DEVICES:
      setTotalDevices(payload.action.count);
      break;

    case AppConstants.SET_PENDING_DEVICES:
      setTotalPendingDevices(payload.action.count);
      break;

    case AppConstants.SET_ACCEPTED_DEVICES:
      setTotalAcceptedDevices(payload.action.count);
      break;

    case AppConstants.SET_REJECTED_DEVICES:
      setTotalRejectedDevices(payload.action.count);
      break;

    case AppConstants.SET_PREAUTH_DEVICES:
      setTotalPreauthDevices(payload.action.count);
      break;

    case AppConstants.SET_DEVICE_LIMIT:
      setDeviceLimit(payload.action.limit);
      break;

      /* API */
    case AppConstants.RECEIVE_GROUP_DEVICES:
      setGroupDevices(payload.action.devices);
      break;

    case AppConstants.RECEIVE_ADMISSION_DEVICES:
      setPendingDevices(payload.action.devices);
      break;

    case AppConstants.RECEIVE_GROUPS:
      setGroups(payload.action.groups);
      break;

    case AppConstants.SET_DEPLOYMENT_ARTIFACT:
      setDeploymentArtifact(payload.action.artifact);
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
