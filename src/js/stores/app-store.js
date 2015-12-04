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
  software_version: "Current software",
  tags: "Tags"
}

/* TEMP LOCAL GROUPS */
var _groups = [
  {
    id: 1,
    name: "All devices",
    devices: [1,2,3,4,5,6,7,8,9,10,11],
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
  },
  {
    id: 5,
    name: "Wifi",
    devices: [9],
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
    'groups': [1,2],
    'tags': []
  },
  {
    'id': 2,
    'name': 'Device002',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.1',
    'groups': [1,2],
    'tags': []
  },
  {
    'id': 3,
    'name': 'Device003',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.1',
    'groups': [1,2],
    'tags': []
  },
  {
    'id': 4,
    'name': 'Device004',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.0',
    'groups': [1,3],
    'tags': []
  },
  {
    'id': 5,
    'name': 'Device005',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Down',
    'software_version': 'Version 1.0',
    'groups': [1,3],
    'tags': []
  },
  {
    'id': 6,
    'name': 'Device006',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Down',
    'software_version': 'Version 0.3',
    'groups': [1,3],
    'tags': []
  },
  {
    'id': 7,
    'name': 'Device007',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.0',
    'groups': [1,4],
    'tags': []
  },
  {
    'id': 8,
    'name': 'Device008',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.0',
    'groups': [1,4],
    'tags': []
  },
  {
    'id': 9,
    'name': 'Wifi001',
    'model':"Wifi Model 1",
    'arch': 'arm64',
    'status': 'Up',
    'software_version': 'Version 1.0 Wifi',
    'groups': [1,5],
    'tags': []
  },
  {
    'id': 10,
    'name': 'Wifi002',
    'model':"Wifi Model 1",
    'arch': 'arm64',
    'status': 'Up',
    'software_version': 'Version 1.0 Wifi',
    'groups': [1],
    'tags': []
  },
   {
    'id': 11,
    'name': 'Wifi003',
    'model':"Wifi Model 1",
    'arch': 'arm64',
    'status': 'Up',
    'software_version': 'Version 1.0 Wifi',
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
  return health;
}



// SOFTWARE
var _softwareRepo = [
  {
    id: 1,
    name: "Version 0.2",
    model: "Acme Model 1",
    description: "Version 0.2 Beta",
    build_date: 1442309576000,
    upload_date: 1443309976000,
    checksum: "ed0fd7cc588a60a582f94829c4c39686b8cf84f80e2c8914d7dbea947756d726",
    tags: ["Acme", "beta"],
    size: "15.2 MB",
    devices: 0
  },
  {
    id: 2,
    name: "Version 0.3",
    model: "Acme Model 1",
    description: "Version 0.3 fixes bug #44 in Beta",
    build_date: 1442311876000,
    upload_date: 1444309976000,
    checksum: "ad77f16744df3c874530fd0caad688a80b228244b5d2caeedab791f90a2db619",
    tags: ["Acme", "beta", "bugfix"],
    size: "15.4 MB",
    devices: 0
  },
  {
    id: 3,
    name: "Version 1.0",
    model: "Acme Model 1",
    description: "Version 1.0 stable release for Acme Model 1",
    build_date: 1444309991000,
    upload_date: 1445309334000,
    checksum: "d3f8001422abade2702130ac74349e0f77d139c6eb89842844c30712bb66e9b9",
    tags: ["Acme", "stable"],
    size: "18.8 MB",
    devices: 0
  },
  {
    id: 4,
    name: "Version 1.1",
    model: "Acme Model 1",
    description: "Version 1.1 fixes bug #243 for Acme Model 1",
    build_date: 1444909991000,
    upload_date: 1445409334000,
    checksum: "8020f6d69da4a0a9d2d7d4cd70307c4bacfa07bc5eb5ce1dc4b37de2b2ea5247",
    tags: ["Acme", "bugfix"],
    size: "18.9 MB",
    devices: 0
  },
  {
    id: 5,
    name: "Version 1.2",
    model: "Acme Model 1",
    description: "1.2 optimization",
    build_date: 1444939971000,
    upload_date: 1445429374000,
    checksum: "b411936863d0e245292bb81a60189c7ffd95dbd3723c718e2a1694f944bd91a3",
    tags: ["Acme"],
    size: "18.4 MB",
    devices: 0
  },
  {
    id: 6,
    name: "Version 1.0 Wifi",
    model: "Wifi Model 1",
    description: "Stable firmware for wireless models",
    build_date: 1444949934000,
    upload_date: 1445329472000,
    checksum: "b411936863d0e245292bb81a60189c7ffd95dbd3723c718e2a1694f944bd91a3",
    tags: ["stable", "wifi"],
    size: "10.3 MB",
    devices: 0
  },
];
discoverSoftware();

function discoverSoftware() {
  var unique = {};

  for (var i=0; i<_alldevices.length; i++) {
    if (typeof(unique[_alldevices[i].software_version]) == "undefined") {
      unique[_alldevices[i].software_version] = 0;
    }
    unique[_alldevices[i].software_version]++;
  }

  for (var val in unique) {
    var idx = findWithAttr(_softwareRepo, 'name', val);
    _softwareRepo[idx].devices = unique[val];
  }
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

var _allupdates = [
  {
    id: 1,
    group: "Test",
    model: "Acme Model 1",
    software_version: "Version 1.1",
    start_time: 1458493576000,
    end_time: 1458497176000,
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
    start_time: 1458507176000,
    end_time: 1458510776000,
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
  {
    id: 6,
    group: "Wifi",
    model: "Wifi Model 1",
    software_version: "Wifi Version 1.0",
    start_time: 1447708776000,
    end_time: 1450709971000,
    status: null,
    devices: [
      {
        id:9,
        name:"Wifi001",
        model:"Wifi Model 1",
        last_software_version:"Wifi Version Beta",
        software_version:"Wifi Version 1.0",
        start_time:1450708776000,
        end_time:1451709971000,
        status:"Pending"
      },
    ]
  },
  {
    id: 7,
    group: "Production",
    model: "Acme Model 1",
    software_version: "Version 1.1",
    start_time: 1447309976000,
    end_time: 1455396376000,
    status: "Pending",
    devices: [
      {
        id:7,
        name:"Device007",
        model:"Acme Model 1",
        last_software_version:"Version 1.0",
        software_version:"Version 1.1",
        start_time:1447309976000,
        end_time:1449309976000,
        status:"Complete"
      },
      {
        id:8,
        name:"Device008",
        model:"Acme Model 1",
        last_software_version:"Version 1.0",
        software_version:"Version 1.1",
        start_time:1447309976000,
        end_time:1455396376000,
        status:"Pending"
      },
    ]
  },
];
_allupdates.sort(startTimeSort);


var _activityLog = [
  {
    summary: "User Admin scheduled an update to group Wifi",
    details: "1 devices in group Wifi will be updated to Wifi Version 1 at 2015/11/26 04:06",
    timestamp: 1445708776000,
    negative: false
  },
  {
    summary: "User Admin uploaded image Version 1.2",
    details: "Software image Version 1.2 was uploaded at 2015/10/15 22:12",
    timestamp: 1444708776000,
    negative: false
  },
  {
    summary: "User Admin cancelled an update to group Test",
    details: "Cancelled update to 3 devices in group Test to software Version 1.1 at 2015/11/23 09:30",
    timestamp: 1443708776000,
    negative: true
  },
];

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

  getSingleUpdate: function(attr, val) {
    var index = findWithAttr(_allupdates, attr, val);
    return _allupdates[index];
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
      case AppConstants.REMOVE_UPDATE:
        _removeUpdate(payload.action.id);
        break;
      case AppConstants.SORT_TABLE:
        _sortTable(payload.action.table, payload.action.column, payload.action.direction)
    }
    
    AppStore.emitChange();
    return true;
  })

});

module.exports = AppStore;