var AppDispatcher = require('../dispatchers/app-dispatcher');
var AppConstants = require('../constants/app-constants');
var assign = require('react/lib/Object.assign');
var EventEmitter = require('events').EventEmitter;  // from device

var CHANGE_EVENT = "change";

var _softwareRepo = [];
var _currentGroup = [];
var _currentDevices = [];
var _selectedDevices = [];
var _filters = [{key:'', value:''}];
var _attributes = {
  name: "Name",
  model: "Device type",
  arch: "Architecture",
  status: "Status",
  software_version: "Current software",
  tags: "Tags"
}

/* TEMP LOCAL GROUPS */
var _groups = [
  {
    id: 1,
    name: "All devices",
    devices: [1,2,3,4,5,6,7],
    type: "public"
  },
  {
    id: 2,
    name: "Development",
    devices: [6],
    type: "public"
  },
  {
    id: 3,
    name: "Test",
    devices: [4,6],
    type: "public"

  },
  {
    id: 4,
    name: "Production",
    devices: [1,2,3],
    type: "public"
  },
]


/* Temp local devices */

var _alldevices = [
  {
    'id': 1,
    'name': '00a0c91e6-7dec-11d0-a765-f81d4faebf1',
    'model':"Raspberry Pi 3",
    'arch': 'ARMv8 Cortex-A53',
    'status': 'Up',
    'software_version': 'Application 0.0.1',
    'groups': [1,4],
    'tags': []
  },
  {
    'id': 2,
    'name': '00a0c91e6-7dec-11d0-a765-f81d4faebf2',
    'model':"Raspberry Pi 3",
    'arch': 'ARMv8 Cortex-A53',
    'status': 'Up',
    'software_version': 'Application 0.0.1',
    'groups': [1,4],
    'tags': []
  },
  {
    'id': 3,
    'name': '00a0c91e6-7dec-11d0-a765-f81d4faebf3',
    'model':"Raspberry Pi 3",
    'arch': 'ARMv8 Cortex-A53',
    'status': 'Up',
    'software_version': 'Application 0.0.1',
    'groups': [1,4],
    'tags': []
  },
  {
    'id': 4,
    'name': '00a0c91e6-7dec-11d0-a765-f81d4faebf4',
    'model':"Raspberry Pi 3",
    'arch': 'ARMv8 Cortex-A53',
    'status': 'Up',
    'software_version': 'Application 0.0.2',
    'groups': [1,2],
    'tags': []
  },
  {
    'id': 5,
    'name': '00a0c91e6-7dec-11d0-a765-f81d4faebf5',
    'model':"Raspberry Pi 3",
    'arch': 'ARMv8 Cortex-A53',
    'status': 'Up',
    'software_version': 'Application 0.0.2',
    'groups': [1,3],
    'tags': []
  },
  {
    'id': 6,
    'name': '00a0c91e6-7dec-11d0-a765-f81d4faebf6',
    'model':"Raspberry Pi 3",
    'arch': 'ARMv8 Cortex-A53',
    'status': 'Up',
    'software_version': 'Application 0.0.2',
    'groups': [1,3],
    'tags': []
  },
  {
    'id': 7,
    'name': '0dde3346-4dec-11d0-a765-f81d4faebf7',
    'model':"Raspberry Pi 2 Model B",
    'arch': 'ARMv7 Cortex-A7',
    'status': 'Down',
    'software_version': 'Application 0.0.1',
    'groups': [1],
    'tags': []
  },
];

_selectGroup(_groups[0].id);

function _selectGroup(id) {
  _selectedDevices = [];
  _filters = [{key:'', value:''}];
  if (id) {
    _currentGroup = _getGroupById(id);
    _getCurrentDevices(_currentGroup.id);
  }
}

function _getGroupById(id) {
  for (var i=0; i<_groups.length;i++) {
    if (_groups[i].id === id) {
      return _groups[i];
    }
  }
  return;
}

function _addNewGroup(group, devices, type) {
  var tmpGroup = group;
  for (var i=0;i<devices.length;i++) {
    tmpGroup.devices.push(devices[i].id);
  }
  tmpGroup.id = _groups.length+1;
  tmpGroup.type = type ? type : 'public';
  _groups.push(tmpGroup);
  _selectGroup(_groups.length);
}

function _getDeviceById(deviceId) {
  for (var i=0; i<_alldevices.length;i++) {
    if (_alldevices[i].id === deviceId) {
      return _alldevices[i];
    }
  }
  return;
}

function _getCurrentDevices(groupId) {
  _currentDevices = [];
  var devicelist = _getGroupById(groupId).devices;
  for (var i=0; i<devicelist.length; i++) {
    var device = _getDeviceById(devicelist[i]);
    if (_matchFilters(device)) {
       _currentDevices.push(device);
    }
  }
  _sortDevices();
}

function _sortDevices() {
  _currentDevices.sort(statusSort);
}

function _updateDeviceTags(id, tags) {
  var index = findWithAttr(_alldevices, "id", id);
  _alldevices[index].tags = tags;
}

function _updateFilters(filters) {
  _filters = filters;
  _getCurrentDevices(_currentGroup.id);
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


function _selectDevices(devicePositions) {
  _selectedDevices = [];
  for (var i=0; i<devicePositions.length; i++) {
   _selectedDevices.push(_currentDevices[devicePositions[i]]);
  }
}

function _getDevices(group, model) {
  // get group id from name

  var index = findWithAttr(_groups, 'name', group);
  var groupId = _groups[index].id;

  var devices = [];
  for (var i=0; i<_alldevices.length; i++) {
    if (_alldevices[i].model===model) {
      for (var x=0; x<_alldevices[i].groups.length;x++) {
        if (_alldevices[i].groups[x]===groupId) {
          devices.push(_alldevices[i]);
        }
      }
    }
  }
  return devices;
}

function _addToGroup(group, devices) {
  var tmpGroup = group;
  var idx = findWithAttr(_groups, 'id', tmpGroup.id);
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
    _getCurrentDevices(tmpGroup.id);

    // TODO - delete if empty group?

  } else {
    // New group
    _addNewGroup(group, devices, 'public');
    // TODO - go through devices and add group
  }
}

function _getDeviceHealth() {
  var health = {};
  var down = collectWithAttr(_alldevices, 'status', 'Down');
  var nogroup = collectWithAttr(_alldevices, 'groups', [1]);
  health.down = down.length;
  health.up = _alldevices.length - health.down;
  health.nogroup = nogroup.length;
  health.total = _alldevices.length;
  return health;
}


function discoverDevices(array) {
  var unique = {};

  for (var i=0; i<_alldevices.length; i++) {
    if (typeof(unique[_alldevices[i].software_version]) == "undefined") {
      unique[_alldevices[i].software_version] = 0;
    }
    unique[_alldevices[i].software_version]++;
  }

  if (array.length) {
    for (var val in unique) {
      var idx = findWithAttr(array, 'name', val);
      if (idx!==undefined) { array[idx]['devices'] = unique[val] }
    }
  }
  return array;
}

function _uploadImage(image) {
  if (image.id) {
    _softwareRepo[findWithAttr(_softwareRepo, "id", image.id)] = image;
  } else {
    image.id = _softwareRepo.length+1;
    _softwareRepo.push(image);
  }
}


// UPDATES
var _progress = [];
var _recent = []
var _schedule = [];
var _events = [];

var _allupdates = [];
var _selectedUpdate = {};

//_allupdates.sort(startTimeSort);


var _activityLog = [
  {
    summary: "User Admin deployed an update to all devices",
    details: "6 devices began updating to Application 0.0.2 at 2016-03-24 00:00",
    timestamp: 1458777600000,
    negative: false
  },
  {
    summary: "User Admin uploaded image Application 0.0.2",
    details: "Software image Application 0.0.2 was uploaded at 2016-03-22 15:13",
    timestamp: 1458659590000,
    negative: false
  },
  {
    summary: "User Admin cancelled an update to group Test",
    details: "Cancelled update to 2 devices in group Test to image Application 0.0.1 at 2016-03-21 09:30",
    timestamp: 1458552600000,
    negative: true
  },
];

function _getRecentUpdates(time) {
  var recent = [];
  for (var i=0;i<_allupdates.length;i++) {
    var created = new Date(_allupdates[i].created);
    var finished = new Date(_allupdates[i].finished);
    if (created<time && finished<time) {
      recent.push(_allupdates[i]);
    }
  }
  return recent;
}

function _getProgressUpdates(time) {
  var progress = [];
  for (var i=0;i<_allupdates.length;i++) {
    var created = new Date(_allupdates[i].created);
    var finished = new Date(_allupdates[i].finished);
    /*
    * CHANGE FOR MOCKING API
    */ 
    if (created<=time && finished>time) {
      progress.push(_allupdates[i]);
    }
  }
  return progress;
}

function _getProgressStatus(id) {
  var update = _allupdates[findWithAttr(_allupdates, "id", id)];
  var progress = {complete:0, failed: 0, pending: 0};
  for (var key in update.devices) {
    progress[update.devices[key].status.toLowerCase()]++;
  }
  return progress;
}

function _getScheduledUpdates(time) {
  var schedule = [];
  for (var i=0;i<_allupdates.length;i++) {
    if (_allupdates[i].start_time>time) {
      schedule.push(_allupdates[i]);
    }
  }
  schedule.sort(startTimeSortAscend);
  return schedule;
}

function _saveSchedule(schedule, single) {
  var tmp = {};
  tmp.id = schedule.id || _allupdates.length+1;
  tmp.group = schedule.group.name;
  tmp.model = "Acme Model 1";
  // whether single device or group
  tmp.devices = !single ? _getDevices(tmp.group, tmp.model) : collectWithAttr(_alldevices, 'name', tmp.group);
  tmp.software_version = schedule.image.name;
  tmp.start_time = schedule.start_time;
  tmp.end_time = schedule.end_time;
  var index = findWithAttr(_allupdates, 'id', tmp.id);
  index != undefined ? _allupdates[index] = tmp : _allupdates.push(tmp);
}

function _removeUpdate(id) {
  var idx = findWithAttr(_allupdates, 'id', id);
  _allupdates.splice(idx,1);
}


function _sortTable(array, column, direction) {
  switch(array) {
    case "_softwareRepo":
      _softwareRepo.sort(customSort(direction, column));
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
  return (b.start_time > a.start_time) - (b.start_time < a.start_time);
}
function startTimeSortAscend(a,b) {
  return (a.start_time > b.start_time) - (a.start_time < b.start_time);
}



/*
* API STARTS HERE
*/
function setImages(images) {
  if (images) {
     _softwareRepo = images;
  }
  _softwareRepo.sort(customSort(1, "modified"));
}



function setUpdates(updates) {
  if (updates) {
     _allupdates = updates;
  }
  _allupdates.sort(startTimeSort);
}

function setSelectedUpdate(update) {
  if (update) {
    _selectedUpdate = update;
  }
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


  getAllDevices: function() {
    /*
    * Return list of devices by current selected group
    */
    return _alldevices
  },

  getDevices: function() {
    /*
    * Return list of devices by current selected group
    */
    return _currentDevices
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

  getSelectedDevices: function() {
    /*
    * Return list of selected devices
    */
    return _selectedDevices
  },

  getSoftwareRepo: function() {
    /*
    * Return list of saved software objects
    */
    return discoverDevices(_softwareRepo);
  },

  getSoftwareImage: function(attr, val) {
    /*
    * Return single image by attr
    */
    return _softwareRepo[findWithAttr(_softwareRepo, attr, val)];
  },

  getRecentUpdates: function(date) {
    /*
    * Return list of updates before date
    */
    return _getRecentUpdates(date)
  },

  getSingleUpdate: function(attr, val) {
    var index = findWithAttr(_allupdates, attr, val);
    return _allupdates[index];
  },

  getSelectedUpdate: function() {
    /*
    * Return current selected update
    */
    return _selectedUpdate
  },

  getProgressUpdates: function(date) {
    /*
    * Return list of updates in progress based on date
    */
    return _getProgressUpdates(date)
  },

  getProgressStatus: function(id) {
    /*
    * Return progress stats for a single update
    */
    return _getProgressStatus(id);
  },

  getScheduledUpdates: function(date) {
    /*
    * Return list of updates scheduled after date
    */
    return _getScheduledUpdates(date)
  }, 

  getEventLog: function() {
    /*
    * Return list of event objects from log
    */
    return _events
  },

  getDevicesFromParams: function(group, model) {
    /*
    * Return list of devices given group and model
    */
    return _getDevices(group, model)
  },

  getHealth: function() {
    return _getDeviceHealth()
  },

  getActivity: function() {
    /*
    * Return activity log
    */
    return _activityLog
  },

  dispatcherIndex: AppDispatcher.register(function(payload) {
    var action = payload.action;
    switch(action.actionType) {
      case AppConstants.SELECT_GROUP:
        _selectGroup(payload.action.groupId);
        break;
      case AppConstants.SELECT_DEVICES:
        _selectDevices(payload.action.devices);
        break;
      case AppConstants.ADD_TO_GROUP:
        _addToGroup(payload.action.group, payload.action.devices);
        break;
      case AppConstants.UPLOAD_IMAGE:
        _uploadImage(payload.action.image);
        break;
      case AppConstants.SAVE_SCHEDULE:
        _saveSchedule(payload.action.schedule, payload.action.single);
        break;
      case AppConstants.UPDATE_FILTERS:
        _updateFilters(payload.action.filters);
        break;
      case AppConstants.UPDATE_DEVICE_TAGS:
        _updateDeviceTags(payload.action.id, payload.action.tags);
        break;
      case AppConstants.REMOVE_UPDATE:
        _removeUpdate(payload.action.id);
        break;
      case AppConstants.SORT_TABLE:
        _sortTable(payload.action.table, payload.action.column, payload.action.direction);
        break;

      /* API */
      case AppConstants.RECEIVE_IMAGES:
        setImages(payload.action.images);
        break;

      /* API */
      case AppConstants.RECEIVE_UPDATES:
        setUpdates(payload.action.updates);
        break;
       case AppConstants.SINGLE_UPDATE:
        setSelectedUpdate(payload.action.update);
        break;
    }
    
    AppStore.emitChange();
    return true;
  })

});

module.exports = AppStore;
