var AppDispatcher = require('../dispatchers/app-dispatcher');
var AppConstants = require('../constants/app-constants');
var assign = require('react/lib/Object.assign');
var EventEmitter = require('events').EventEmitter;  // from device

var CHANGE_EVENT = "change";

var _currentGroup = [];
var _currentDevices = [];
var _selectedDevices = [];

/* TEMP LOCAL GROUPS */
var _groups = [
  {
    id: 1,
    name: "All",
    devices: [1,2,3,4,5,6,7,8]
  },
  {
    id: 2,
    name: "Development",
    devices: [1,2,3]
  },
  {
    id: 3,
    name: "Test",
    devices: [4,5,6]
  },
  {
    id: 4,
    name: "Production",
    devices: [7,8]
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
    'software_version': 'Version 1.1',
    'groups': [1,3]
  },
  {
    'id': 5,
    'name': 'Device005',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Down',
    'software_version': 'Version 1.1',
    'groups': [1,3]
  },
  {
    'id': 6,
    'name': 'Device006',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Down',
    'software_version': 'Version 1.1',
    'groups': [1,3]
  },
  {
    'id': 7,
    'name': 'Device007',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.1',
    'groups': [1,4]
  },
  {
    'id': 8,
    'name': 'Device008',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.1',
    'groups': [1,4]
  },
];

_selectGroup(_groups[0].id);

function _selectGroup(id) {
  _selectedDevices = [];
  //console.log(id, _groups);
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

function _addNewGroup(group, devices) {
  var tmpGroup = group;
  for (var i=0;i<devices.length;i++) {
    tmpGroup.devices.push(devices[i].id);
  }
  tmpGroup.id = _groups.length+1;
  var idnew = _groups.length+1;
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
    _currentDevices.push(_getDeviceById(devicelist[i]));
  }
  _sortDevices();
}

function _sortDevices() {
  _currentDevices.sort(statusSort);
}


function _selectDevices(devicePositions) {
  _selectedDevices = [];
  for (var i=0; i<devicePositions.length; i++) {
   _selectedDevices.push(_currentDevices[devicePositions[i]]);
  }
}

function _addToGroup(group, devices) {
  var tmpGroup = group;

  if (tmpGroup.id) {
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
    _getCurrentDevices(tmpGroup.id);

    // TODO - delete if empty group?

  } else if (devices.length) {
    // New group
    _addNewGroup(group, devices);
    // TODO - go through devices and add group
  }
}




// SOFTWARE
var _softwareInstalled = [];
var _softwareRepo = [
  {
    id: 1,
    name: "Version 1.1",
    model: "Acme Model 1",
    description: "Version 1.1 fixes bug #243 for Acme Model 1"
  }
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
  console.log(_softwareRepo);
}





function findWithAttr(array, attr, value) {
  for(var i = 0; i < array.length; i += 1) {
    if(array[i][attr] === value) {
      return i;
    }
  }
}

function statusSort(a,b) {
  return (a.status > b.status) - (a.status < b.status);
}

var AppStore = assign(EventEmitter.prototype, {
  emitChange: function() {
    this.emit(CHANGE_EVENT)
  },

  changeListener: function(callback) {
    this.on(CHANGE_EVENT, callback)
  },

  getGroups: function() {
    return _groups
  },

  getSelectedGroup: function() {
    return _currentGroup
  },

  getDevices: function() {
    return _currentDevices
  },

  getSelectedDevices: function() {
    return _selectedDevices
  },


  getSoftwareInstalled: function() {
    return _softwareInstalled
  },

  getSoftwareRepo: function() {
    return _softwareRepo
  },

  dispatcherIndex: AppDispatcher.register(function(payload) {
    var action = payload.action;
    switch(action.actionType) {
      case AppConstants.SELECT_GROUP:
        _selectGroup(payload.action.groupId);
        break;
      case AppConstants.SELECT_NODES:
        _selectDevices(payload.action.devices);
        break;
      case AppConstants.ADD_TO_GROUP:
        _addToGroup(payload.action.group, payload.action.devices);
        break;
      case AppConstants.UPLOAD_IMAGE:
        _uploadImage(payload.action.image);
        break;
    }
    
    AppStore.emitChange();
    return true;
  })

});

module.exports = AppStore;