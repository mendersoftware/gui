var AppDispatcher = require('../dispatchers/app-dispatcher');
var AppConstants = require('../constants/app-constants');
var assign = require('react/lib/Object.assign');
var EventEmitter = require('events').EventEmitter;  // from device

var CHANGE_EVENT = "change";

var _currentGroup = [];
var _currentDevices = [];
var _selectedDevices = [];
var _filters = [{key:'', value:''}];
var _attributes = {
  name: "Name",
  model: "Device type",
  arch: "Architecture",
  status: "Status",
  software_version: "Current software"
}

/* TEMP LOCAL GROUPS */
var _groups = [
  {
    id: 1,
    name: "All",
    devices: [1,2,3,4,5,6,7,8],
    type: "public"
  },
  {
    id: 2,
    name: "Development",
    devices: [1,2,3],
    type: "public"
  },
  {
    id: 3,
    name: "Test",
    devices: [4,5,6],
    type: "public"

  },
  {
    id: 4,
    name: "Production",
    devices: [7,8],
    type: "public"
  }
]


/* Temp local devices */

var _alldevices = [
  {
    'id': 1,
    'name': 'Device001',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.1',
    'groups': [1,2]
  },
  {
    'id': 2,
    'name': 'Device002',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.1',
    'groups': [1,2]
  },
  {
    'id': 3,
    'name': 'Device003',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.1',
    'groups': [1,2]
  },
  {
    'id': 4,
    'name': 'Device004',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.0',
    'groups': [1,3]
  },
  {
    'id': 5,
    'name': 'Device005',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Down',
    'software_version': 'Version 1.0',
    'groups': [1,3]
  },
  {
    'id': 6,
    'name': 'Device006',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Down',
    'software_version': 'Version 0.3',
    'groups': [1,3]
  },
  {
    'id': 7,
    'name': 'Device007',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.0',
    'groups': [1,4]
  },
  {
    'id': 8,
    'name': 'Device008',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.0',
    'groups': [1,4]
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
      if (device[_filters[i].key].toLowerCase().indexOf(_filters[i].value.toLowerCase()) == -1) {
        match = false;
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
  if (idx) {
    for (var i=0; i<devices.length;i++) {
      if (tmpGroup.devices.indexOf(devices[i].id)===-1) {
        tmpGroup.devices.push(devices[i].id);
      }
      else {
        tmpGroup.devices.splice(tmpGroup.devices.indexOf(devices[i].id),1);
      }
    }

    var idx = findWithAttr(_groups, 'id', tmpGroup.id);
    _groups[idx] = tmpGroup;

    // reset filters
    _filters = [{key:'', value:''}];
    _getCurrentDevices(tmpGroup.id);

    // TODO - delete if empty group?

  } else if (devices.length) {
    // New group
    _addNewGroup(group, devices, 'public');
    // TODO - go through devices and add group
  }
}

function _getDeviceHealth() {
  var health = {};
  var down = collectWithAttr(_alldevices, 'status', 'Down');
  health.down = down.length;
  health.up = _alldevices.length - health.down;
  return health;
}



// SOFTWARE
var _softwareInstalled = [];
var _softwareRepo = [
  {
    id: 1,
    name: "Version 0.2",
    model: "Acme Model 1",
    description: "Version 0.2 Beta"
  },
  {
    id: 2,
    name: "Version 0.3",
    model: "Acme Model 1",
    description: "Version 0.3 fixes bug #44 in Beta"
  },
  {
    id: 3,
    name: "Version 1.0",
    model: "Acme Model 1",
    description: "Version 1.0 stable release for Acme Model 1"
  },
  {
    id: 4,
    name: "Version 1.1",
    model: "Acme Model 1",
    description: "Version 1.1 fixes bug #243 for Acme Model 1"
  },
  {
    id: 5,
    name: "Version 1.2",
    model: "Acme Model 1",
    description: "1.2 optimization"
  },
];
discoverSoftware();

function discoverSoftware() {
  _softwareInstalled = []
  var unique = {};

  for (var i=0; i<_alldevices.length; i++) {
    if (typeof(unique[_alldevices[i].software_version]) == "undefined") {
      unique[_alldevices[i].software_version] = 0;
    }
    unique[_alldevices[i].software_version]++;
  }

  for (val in unique) {
    var idx = findWithAttr(_softwareRepo, 'name', val);
    var software = _softwareRepo[idx];
    software.devices = unique[val];
    _softwareInstalled.push(software);
  }
}

function _uploadImage(image) {
  image.id = _softwareRepo.length+1;
  _softwareRepo.push(image);
}



// UPDATES
var _progress = [];
var _recent = []
var _schedule = [];
var _events = [];

var _allupdates = [
  {
    id: 1,
    group: "Test",
    model: "Acme Model 1",
    software_version: "Version 1.1",
    start_time: 1447383576000,
    end_time: 1447387176000,
    status: null,
    devices: [
     {
        id:4,
        name:"Device004",
        model:"Acme Model 1",
        last_software_version:"Version 1.0",
        software_version:"Version 1.0",
        start_time:null,
        end_time:null,
        status:"Skipped"
      },
      {
        id:5,
        name:"Device005",
        model:"Acme Model 1",
        last_software_version:"Version 1.0",
        software_version:"Version 1.o",
        start_time:null,
        end_time:null,
        status: "Skipped"
      },
      {
        id:6,
        name:"Device006",
        model:"Acme Model 1",
        last_software_version:"Version 0.3",
        software_version:"Version 1.0",
        start_time:null,
        end_time: null,
        status: "Pending"
      }
    ]
  },
  {
    id: 2,
    group: "Development",
    model: "Acme Model 1",
    software_version: "Version 1.2",
    start_time: 1447297176000,
    end_time: 1447300776000,
    status: null,
    devices: [
      {
        id:1,
        name:"Device001",
        model:"Acme Model 1",
        last_software_version:"Version 1.1",
        software_version:"Version 1.2",
        start_time:null,
        end_time:null,
        status:"Pending"
      },
      {
        id:2,
        name:"Device002",
        model:"Acme Model 1",
        last_software_version:"Version 1.1",
        software_version:"Version 1.2",
        start_time:1447297176000,
        end_time:1444708776000,
        status:"Pending"
      },
      {
        id:3,
        name:"Device003",
        model:"Acme Model 1",
        last_software_version:"Version 1.1",
        software_version:"Version 1.2",
        start_time:null,
        end_time: null,
        status:"Pending"
      }
    ]
  },
  {
    id: 3,
    group: "Production",
    model: "Acme Model 1",
    software_version: "Version 1.0",
    start_time: 1445309976000,
    end_time: 1445396376000,
    status: "Complete",
    devices: [
      {
        id:7,
        name:"Device007",
        model:"Acme Model 1",
        last_software_version:"Version 0.3",
        software_version:"Version 1.0",
        start_time:1445309976000,
        end_time:1445396376000,
        status:"Complete"
      },
      {
        id:8,
        name:"Device008",
        model:"Acme Model 1",
        last_software_version:"Version 0.3",
        software_version:"Version 1.0",
        start_time:1445309976000,
        end_time:1445396376000,
        status:"Complete"
      },
    ]
  },
  {
    id: 4,
    group: "Test",
    model: "Acme Model 1",
    software_version: "Version 0.3",
    start_time: 1444705176000,
    end_time: 1444708776000,
    status: "Complete",
    devices: [
     {
        id:4,
        name:"Device004",
        model:"Acme Model 1",
        last_software_version:"Version 0.2",
        software_version:"Version 0.3",
        start_time:1444705176000,
        end_time:1444708776000,
        status:"Complete"
      },
      {
        id:5,
        name:"Device005",
        model:"Acme Model 1",
        last_software_version:"Version 0.2",
        software_version:"Version 0.3",
        start_time:1444705176000,
        end_time:1444708776000,
        status:"Complete"
      },
      {
        id:6,
        name:"Device006",
        model:"Acme Model 1",
        last_software_version:"Version 0.3",
        software_version:"Version 0.3",
        start_time:1444705176000,
        end_time: 1444708776000,
        status:"Complete"
      }
    ]
  },
  {
    id: 5,
    group: "Test",
    model: "Acme Model 1",
    software_version: "Version 1.0",
    start_time: 1444708776000,
    end_time: 1444709971000,
    status: "Failed",
    devices: [
      {
        id:4,
        name:"Device004",
        model:"Acme Model 1",
        last_software_version:"Version 0.3",
        software_version:"Version 1.0",
        start_time:1444708776000,
        end_time:1444709971000,
        status:"Complete"
      },
      {
        id:5,
        name:"Device005",
        model:"Acme Model 1",
        last_software_version:"Version 0.3",
        software_version:"Version 1.0",
        start_time:1444708776000,
        end_time:1444709971000,
        status:"Complete"
      },
      {
        id:6,
        name:"Device006",
        model:"Acme Model 1",
        last_software_version:"Version 0.3",
        software_version:"Version 0.3",
        start_time:1444708776000,
        end_time: 1444709971000,
        status:"Failed"
      }
    ]
  },
];
_allupdates.sort(startTimeSort);

function _getRecentUpdates(time) {

  var recent = [];
  for (var i=0;i<_allupdates.length;i++) {
    if (_allupdates[i].start_time<time && _allupdates[i].end_time<time) {
      recent.push(_allupdates[i]);
    }
  }
  return recent;
}

function _getProgressUpdates(time) {
  var progress = [];
  for (var i=0;i<_allupdates.length;i++) {
    if (_allupdates[i].start_time<=time && _allupdates[i].end_time>time) {
      progress.push(_allupdates[i]);
    }
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
    if(array[i][attr] === value) {
      newArr.push(array[i]);
    }
  }
  return newArr;
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

var AppStore = assign(EventEmitter.prototype, {
  emitChange: function() {
    this.emit(CHANGE_EVENT)
  },

  changeListener: function(callback) {
    this.on(CHANGE_EVENT, callback)
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

  getSoftwareInstalled: function() {
    /*
    * Return list of software installed on devices
    */
    return _softwareInstalled
  },

  getSoftwareRepo: function() {
    /*
    * Return list of saved software objects
    */
    return _softwareRepo
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

  getProgressUpdates: function(date) {
    /*
    * Return list of updates in progress based on date
    */
    return _getProgressUpdates(date)
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
      case AppConstants.REMOVE_UPDATE:
        _removeUpdate(payload.action.id);
        break;
    }
    
    AppStore.emitChange();
    return true;
  })

});

module.exports = AppStore;