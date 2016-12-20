var AppDispatcher = require('../dispatchers/app-dispatcher');
var AppConstants = require('../constants/app-constants');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;  // from device

var CHANGE_EVENT = "change";

var _artifactsRepo = [];
var _currentGroup = null;
var _deploymentArtifact = null;
var _currentGroupDevices = [];
var _totalNumberDevices;
var _selectedDevices = [];
var _filters = [{key:'', value:''}];
var _attributes = {
  id: "Name"
};
var _snackbar = {
  open: false,
  message: ""
};


var _groups = []


/* Temp local devices */

var _alldevices = [];
var _pending = [];

var _health = {
  total: 0,
  alive: 0,
  down: 0
}


function _selectGroup(group) {
  _selectedDevices = [];
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

function _matchFilters(device) {
  /*
  * Match device attributes against _filters, return true or false
  */
  var match = true;
  for (var i=0; i<_filters.length; i++) {
    if (_filters[i].key && _filters[i].value) {
      if (device[_filters[i].key] instanceof Array) {
        // array
         if (device[_filters[i].key].join(', ').toLowerCase().indexOf(_filters[i].value.toLowerCase()) == -1) {
          match = false;
        }
      } else {
        // string
        if (device[_filters[i].key].toLowerCase().indexOf(_filters[i].value.toLowerCase()) == -1) {
          match = false;
        }
      }
    }
  }
  return match;
}


function _selectDevices(device) {
  _selectedDevices = [];
  if (device === "all") {
    for (var i=0; i<_currentGroupDevices.length; i++) {
      _currentGroupDevices[i].selected = true;
      _selectedDevices.push(_currentGroupDevices[i].id);
    }
  } else if (device === "none") {
    for (var i=0; i<_currentGroupDevices.length; i++) {
      _currentGroupDevices[i].selected = false;
    }
  } else {
    for (var i=0; i<_currentGroupDevices.length; i++) {
      if (device.id === _currentGroupDevices[i].id) {
        _currentGroupDevices[i].selected = !_currentGroupDevices[i].selected;
      }
      if (_currentGroupDevices[i].selected) _selectedDevices.push(_currentGroupDevices[i].id);
    }
  }
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

function _authorizeDevices(devices) {
  // for each device, get name, make sure none in _alldevices with name, if ok then push to _alldevices

  for (var i=0; i<devices.length; i++) {
    var idx = findWithAttr(_alldevices, 'name', devices[i].name);
    if (idx === undefined) {
      devices[i].groups.push(1);
      _alldevices.push(devices[i]);
      _groups[0].devices.push(devices[i].id);
    } else {
      // id already exists - error
      _setSnackbar("Error: A device with this ID already exists");
    }
  }
  _selectGroup(_currentGroup);
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


// Deployments
var _deploymentsInProgress = [];
var _pastDeployments = []
var _schedule = [];
var _events = [];

var _allDeployments = [];
var _selectedDeployment = {};

//_al deployments.sort(startTimeSort);


var _activityLog = [
];

function _getPastDeployments() {
  return _pastDeployments;
}

function _getDeploymentsInProgress() {
  return _deploymentsInProgress;
}

function _getProgressStatus(id) {
  var deployment = _allDeployments[findWithAttr(_allDeployments, "id", id)];
  var progress = {complete:0, failed: 0, pending: 0};
  for (var key in deployment.devices) {
    progress[deployment.devices[key].status.toLowerCase()]++;
  }
  return progress;
}

function _getScheduledDeployments(time) {
  var schedule = [];
  for (var i=0;i<_allDeployments.length;i++) {
    if (_allDeployments[i].start_time>time) {
      schedule.push(_allDeployments[i]);
    }
  }
  schedule.sort(startTimeSortAscend);
  return schedule;
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

  var newCombine = newList.success.concat(newList.pending, newList.downloading, newList.installing, newList.rebooting, newList.failure, newList.aborted, newList['already-installed'], newList.noartifact);
  return newCombine;
}


function _removeDeployment(id) {
  var idx = findWithAttr(_allDeployments, 'id', id);
  _allDeployments.splice(idx,1);
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


/*
* API STARTS HERE
*/
function setArtifacts(artifacts) {
  if (artifacts) {
     _artifactsRepo = artifacts;
  }
  _artifactsRepo.sort(customSort(1, "modified"));
}



function setDeployments(deployments) {
  if (deployments) {
     _allDeployments = deployments;
  }
  _allDeployments.sort(startTimeSort);
}

function setActiveDeployments(deployments) {
  _deploymentsInProgress = deployments;
  _deploymentsInProgress.sort(startTimeSort);
}

function setPastDeployments(deployments) {
  _pastDeployments = deployments;
  _pastDeployments.sort(startTimeSort);
}

function setSelectedDeployment(deployment) {
  if (deployment) {
    _selectedDeployment = deployment;
  }
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
  _snackbar = {open: show, message: message};
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

  matchFilters: function(item) {
     /*
    * Return true or false for device matching _filters
    */
    return _matchFilters(item);
  },

  getSelectedDevices: function() {
    /*
    * Return list of selected devices
    */
    return _selectedDevices
  },

  getArtifactsRepo: function() {
    /*
    * Return list of saved artifacts objects
    */
    return discoverDevices(_artifactsRepo);
  },

  getSoftwareArtifact: function(attr, val) {
    /*
    * Return single artifact by attr
    */
    return _artifactsRepo[findWithAttr(_artifactsRepo, attr, val)];
  },

  getPastDeployments: function() {
    /*
    * Return list of deployments before date
    */
    return _getPastDeployments()
  },

  getSingleDeployment: function(attr, val) {
    var index = findWithAttr(_allDeployments, attr, val);
    return _allDeployments[index];
  },

  getSelectedDeployment: function() {
    /*
    * Return current selected deployment
    */
    return _selectedDeployment
  },

  getDeploymentsInProgress: function() {
    /*
    * Return list of deployments in progress based on date
    */
    return _getDeploymentsInProgress()
  },

  getProgressStatus: function(id) {
    /*
    * Return progress stats for a single deployment
    */
    return _getProgressStatus(id);
  },

  getScheduledDeployments: function(date) {
    /*
    * Return list of deployments scheduled after date
    */
    return _getScheduledDeployments(date)
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

  getActivity: function() {
    /*
    * Return activity log
    */
    return _activityLog
  },

  getSnackbar: function() {
    return _snackbar
  },

  dispatcherIndex: AppDispatcher.register(function(payload) {
    var action = payload.action;
    switch(action.actionType) {
      case AppConstants.SELECT_GROUP:
        _selectGroup(payload.action.group);
        break;
      case AppConstants.SELECT_DEVICES:
        _selectDevices(payload.action.device);
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
      case AppConstants.UPDATE_FILTERS:
         updateFilters(payload.action.filters);
        break;
      case AppConstants.UPDATE_DEVICE_TAGS:
         updateDeviceTags(payload.action.id, payload.action.tags);
        break;
      case AppConstants.REMOVE_DEPLOYMENT:
        _removeDeployment(payload.action.id);
        break;
      case AppConstants.SORT_TABLE:
        _sortTable(payload.action.table, payload.action.column, payload.action.direction);
        break;

      case AppConstants.SET_SNACKBAR:
        _setSnackbar(payload.action.message, payload.action.duration);
        break;

      /* API */
      case AppConstants.RECEIVE_ARTIFACTS:
        setArtifacts(payload.action.artifacts);
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
      case AppConstants.SINGLE_DEPLOYMENT:
        setSelectedDeployment(payload.action.deployment);
        break;

      /* API */
      case AppConstants.RECEIVE_ALL_DEVICES:
        setDevices(payload.action.devices);
        break;

      case AppConstants.SET_TOTAL_DEVICES:
        setTotalDevices(payload.action.total);
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
