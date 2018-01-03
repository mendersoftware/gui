var AppDispatcher = require('../dispatchers/app-dispatcher');
var AppConstants = require('../constants/app-constants');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;  // from device

var CHANGE_EVENT = "change";

var _artifactsRepo = [];
var _currentGroup = null;
var _deploymentArtifact = null;
var _currentGroupDevices = [];
var _totalNumberDevices, _totalPendingDevices, _totalAcceptedDevices, _deviceLimit, _numberInProgress;
var _filters = [{key:'', value:''}];
var _attributes = {
  id: "ID"
};
var _snackbar = {
  open: false,
  message: ""
};
var _currentUser = {};
var _hasMultitenancy = true;
var _organization = {};
var _showHelptips = null;
var _groups = [];
var _uploadInProgress = false;


/* Temp local devices */

var _alldevices = [];
var _pending = [];

var _health = {
  total: 0,
  alive: 0,
  down: 0
}


function _selectGroup(group) {
  _filters = [{key:'', value:''}];
  _currentGroup = group;
}


function _addNewGroup(group, devices, type) {
  var tmpGroup = group;
  for (var i=0;i<devices.length;i++) {
    tmpGroup.devices.push(devices[i].id);
  }
  tmpGroup.id = _groups.length+1;
  tmpGroup.type = type ? type : 'public';
  _groups.push(tmpGroup);
  _selectGroup(_groups[_groups.length]-1);
}

function _getDeviceById(deviceId) {
  var index = findWithAttr(_alldevices, "id", deviceId);
  return _alldevices[index];
}


function updateDeviceTags(id, tags) {
  var index = findWithAttr(_alldevices, "id", id);
  _alldevices[index].tags = tags;
}

function  updateFilters(filters) {
  _filters = filters;
}

function _matchFilters(device, filters) {
  /*
  * Match device attributes against _filters, return true or false
  */
  var match = true;
  var gotFilters = filters || _filters;
  for (var i=0; i<gotFilters.length; i++) {
    if (gotFilters[i].key && gotFilters[i].value) {
      if (device[gotFilters[i].key] instanceof Array) {
        // array
         if (device[gotFilters[i].key].join(', ').toLowerCase().indexOf(gotFilters[i].value.toLowerCase()) == -1) {
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

  for (var i=0;i<devices.length;i++) {
    var device = devices[i];
    var attrs = {};
    // get device type from within attributes
    if (device.attributes) {
      for (var x=0;x<device.attributes.length;x++) {
        attrs[device.attributes[x].name] = device.attributes[x].value;
      }
      
      for (var y=0;y<device_types.length;y++) {
        if (device_types[y] === attrs.device_type) {
          filtered.push(device);
          break;
        }
      }
    }
  }

  return filtered;
}

function _addToGroup(group, devices) {
  var tmpGroup = group;
  var idx = findWithAttr(_groups, 'id', tmpGroup);
  if (idx != undefined) {
    for (var i=0; i<devices.length;i++) {
      if (tmpGroup.devices.indexOf(devices[i].id)===-1) {
        tmpGroup.devices.push(devices[i].id);
      }
      else {
        tmpGroup.devices.splice(tmpGroup.devices.indexOf(devices[i].id),1);
      }
    }
    _groups[idx] = tmpGroup;

    // reset filters
    _filters = [{key:'', value:''}];

    // TODO - delete if empty group?

  } else {
    // New group
    _addNewGroup(group, devices, 'public');
    // TODO - go through devices and add group
  }
}

function _removeGroup(groupId) {
  var idx = findWithAttr(_groups, "id", groupId);
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

  for (var i=0; i<_alldevices.length; i++) {
    if (typeof(unique[_alldevices[i].artifact_name]) == "undefined") {
      unique[_alldevices[i].artifact_name] = 0;
    }
    unique[_alldevices[i].artifact_name]++;
  }

  if (array.length) {
    for (var val in unique) {
      var idx = findWithAttr(array, 'name', val);
      if (idx!==undefined) { array[idx]['devices'] = unique[val] }
    }
  }
  return array;
}

function _uploadArtifact(artifact) {
  if (artifact.id) {
    _artifactsRepo[findWithAttr(_artifactsRepo, "id", artifact.id)] = artifact;
  } else {
    artifact.id = _artifactsRepo.length+1;
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
var _schedule = [];
var _events = [];

var _hasDeployments = false;

//_al deployments.sort(startTimeSort);


var _activityLog = [
];

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
    "aborted": [],
    "already-installed": [],
    "downloading": [],
    "failure": [],
    "installing": [],
    "noartifact": [],
    "pending": [],
    "rebooting": [],
    "success": []
  };

  for (var i = 0; i<devices.length; i++) {
    newList[devices[i].status].push(devices[i]);
  }

  var newCombine = newList.success.concat(newList.downloading, newList.installing, newList.rebooting, newList.failure, newList.aborted, newList['already-installed'], newList.noartifact, newList.pending);
  return newCombine;
}

function _sortTable(array, column, direction) {
  switch(array) {
    case "_artifactsRepo":
      _artifactsRepo.sort(customSort(direction, column));
      break;
    case "_currentGroupDevices":
      _currentGroupDevices.sort(customSort(direction, column));
      break;
    case "_pendingDevices":
      _pending.sort(customSort(direction, column));
      break;
  }
}


function findWithAttr(array, attr, value) {
  for(var i = 0; i<array.length; i++) {
    if(array[i][attr] === value) {
      return i;
    }
  }
}

function collectWithAttr(array, attr, value) {
  var newArr = [];
   for(var i = 0; i<array.length; i++) {
    if(array[i][attr].toString() === value.toString()) {
      newArr.push(array[i]);
    }
  }
  return newArr;
}

function customSort(direction, field) {
  return function(a, b) {
    if (a[field] > b[field])
       return direction ? -1 : 1;
    if (a[field] < b[field])
      return direction ? 1 : -1;
    return 0;
  };
}

function statusSort(a,b) {
  return (a.status > b.status) - (a.status < b.status);
}

function startTimeSort(a,b) {
  return (b.created > a.created) - (b.created < a.created);
}
function startTimeSortAscend(a,b) {
  return (a.created < b.created) - (a.created > b.created);
}

function _collateArtifacts() {
  var newArray = [];
  for (var i=0;i<_artifactsRepo.length;i++) {
    var x = findWithAttr(newArray, "name", _artifactsRepo[i].name);
    if (typeof x !== "undefined") {
      newArray[x].device_types_compatible = newArray[x].device_types_compatible.concat(_artifactsRepo[i].device_types_compatible.filter(function(item) {
          return newArray[x].device_types_compatible.indexOf(item)<0;
        }
      ));
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
  _artifactsRepo.sort(customSort(1, "modified"));
}


function setHasDeployments(deployments) {
  _hasDeployments = (deployments == null || deployments.length === 0) ? false : true;
}

function setActiveDeployments(deployments, next) {
  _deploymentsInProgress = deployments;
  _deploymentsInProgress.sort(startTimeSort);
  if (deployments.length){setHasDeployments(deployments)}
}

function setInProgressCount(count) {
  _numberInProgress = count;
}

function setPastDeployments(deployments) {
  _pastDeployments = deployments;
  _pastDeployments.sort(startTimeSort);
  if (deployments.length){setHasDeployments(deployments)}
}


function setPendingDeployments(deployments) {
  _pendingDeployments = deployments;
  _pendingDeployments.sort(startTimeSort);
  if (deployments.length){setHasDeployments(deployments)}
}


function setDevices(devices) {
  if (devices) {
    setHealth(devices);
    var newDevices = {};
    devices.forEach(function(element, index) {
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
function setDeviceLimit(limit) {
  _deviceLimit = limit;
}

function setGroupDevices(devices) {
  _currentGroupDevices = [];
  devices.forEach(function(element, index) {
     _currentGroupDevices[index] = element;
  });
}

function setPendingDevices(devices) {
  if (devices) {
    var newDevices = {};
    devices.forEach(function(element, index) {
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

function setHealth(devices) {
  if (devices.accepted) {
    var health = {};
    devices.accepted.forEach(function(element, index) {
      health[element.status] = newDevices[element.status] || [];
      health[element.status].push(element);
    });
  }
}


function _setSnackbar(message, duration) {
  var show = message ? true : false; 
  _snackbar = {open: show, message: message, maxWidth: "900px"};
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

var AppStore = assign(EventEmitter.prototype, {
  emitChange: function() {
    this.emit(CHANGE_EVENT)
  },

  changeListener: function(callback) {
    this.on(CHANGE_EVENT, callback)
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  getGroups: function() {
    /*
    * Return list of groups
    */
    return _groups
  },

  getSingleGroup: function(attr, val) {
    return _groups[findWithAttr(_groups, attr, val)];
  },

  getSelectedGroup: function() {
    /*
    * Return group object for current group selection
    */
    return _currentGroup
  },

  getDeploymentArtifact: function() {
    // for use when switching tab from artifacts to create a deployment
    return _deploymentArtifact;
  },


  getAllDevices: function() {
    /*
    * Return list of devices by current selected group
    */
    return _alldevices
  },

  getGroupDevices: function() {
    /*
    * Return list of devices by current selected group
    */
    return _currentGroupDevices
  },

  getSingleDevice: function(id) {
    /*
    * Return single device by id
    */
    return _alldevices[findWithAttr(_alldevices, 'id', id)]
  },

  getAttributes: function() {
    /*
    * Return set of filters for list of devices
    */
    return _attributes
  },

  getFilters: function() {
    /*
    * Return set of filters for list of devices
    */
    return _filters
  },

  matchFilters: function(item, filters) {
     /*
    * Return true or false for device matching _filters
    */
    return _matchFilters(item, filters);
  },

  getArtifactsRepo: function() {
    /*
    * Return list of saved artifacts objects
    */
    return discoverDevices(_artifactsRepo);
  },

  getCollatedArtifacts: function() {
    /*
    * return list of artifacts where duplicate names are collated with device compatibility lists combined
    */
    return _collateArtifacts();
  },

  getSoftwareArtifact: function(attr, val) {
    /*
    * Return single artifact by attr
    */
    return _artifactsRepo[findWithAttr(_artifactsRepo, attr, val)];
  },

  getPastDeployments: function() {
    /*
    * Return list of finished deployments 
    */
    return _getPastDeployments()
  },

  getPendingDeployments: function() {
    /*
    * Return list of pending deployments
    */
    return _getPendingDeployments()
  },

  getDeploymentsInProgress: function() {
    /*
    * Return list of deployments in progress based on date
    */
    return _getDeploymentsInProgress()
  },

  getNumberInProgress: function() {
    /*
    * return only number in progress for top bar
    */
    return _numberInProgress
  },


  getHasDeployments: function() {
    /*
    * Return boolean whether or not any deployments exist at all
    */
    return _getHasDeployments()
  },

  getEventLog: function() {
    /*
    * Return list of event objects from log
    */
    return _events
  },

  filterDevicesByType: function(devices, device_types) {
    /*
    * Return list of devices given group and device_type
    */
    return _filterDevicesByType(devices, device_types)
  },

  getOrderedDeploymentDevices: function(devices) {
    return _sortDeploymentDevices(devices);
  },

  getHealth: function() {
    return _health
  },

  getPendingDevices: function() {
    return _getPendingDevices()
  },

  getTotalDevices: function() {
    return _totalNumberDevices
  },
  getTotalPendingDevices: function() {
    return _totalPendingDevices
  },
  getTotalAcceptedDevices: function() {
    return _totalAcceptedDevices
  },
  getDeviceLimit: function() {
    return _deviceLimit
  },

  getActivity: function() {
    /*
    * Return activity log
    */
    return _activityLog
  },

  getSnackbar: function() {
    return _snackbar
  },

  getCurrentUser: function() {
    return _currentUser;
  },

  hasMultitenancy: function() {
    // return boolean rather than organization details
    return _hasMultitenancy;
  },

  getOrganization: function() {
    return _organization;
  },

  showHelptips: function() {
    return _showHelptips;
  },

  getUploadInProgress: function() {
    return _uploadInProgress;
  },

  dispatcherIndex: AppDispatcher.register(function(payload) {
    var action = payload.action;
    switch(action.actionType) {
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
      case AppConstants.UPLOAD_ARTIFACT:
        _uploadArtifact(payload.action.artifact);
        break;
      case AppConstants.UPLOAD_PROGRESS:
        _uploadProgress(payload.action.inprogress);
        break;
      case AppConstants.UPDATE_FILTERS:
         updateFilters(payload.action.filters);
        break;
      case AppConstants.UPDATE_DEVICE_TAGS:
         updateDeviceTags(payload.action.id, payload.action.tags);
        break;
      case AppConstants.SORT_TABLE:
        _sortTable(payload.action.table, payload.action.column, payload.action.direction);
        break;

      case AppConstants.SET_SNACKBAR:
        _setSnackbar(payload.action.message, payload.action.duration);
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

    }
    
    AppStore.emitChange();
    return true;
  })

});

module.exports = AppStore;
