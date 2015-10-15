var AppDispatcher = require('../dispatchers/app-dispatcher');
var AppConstants = require('../constants/app-constants');
var assign = require('react/lib/Object.assign');
var EventEmitter = require('events').EventEmitter;  // from node

var CHANGE_EVENT = "change";

var _currentGroup = [];
var _currentNodes = [];
var _selectedNodes = [];

/* TEMP LOCAL GROUPS */
var _groups = [
  {
    id: 1,
    name: "All",
    nodes: [1,2,3,4,5,6,7,8]
  },
  {
    id: 2,
    name: "Development",
    nodes: [1,2,3]
  },
  {
    id: 3,
    name: "Test",
    nodes: [4,5,6]
  },
  {
    id: 4,
    name: "Production",
    nodes: [7,8]
  }
]


/* Temp local nodes */

var _allnodes = [
  {
    'id': 1,
    'name': 'Node001',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.1',
    'groups': [1,2]
  },
  {
    'id': 2,
    'name': 'Node002',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.1',
    'groups': [1,2]
  },
  {
    'id': 3,
    'name': 'Node003',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.1',
    'groups': [1,2]
  },
  {
    'id': 4,
    'name': 'Node004',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.1',
    'groups': [1,3]
  },
  {
    'id': 5,
    'name': 'Node005',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Down',
    'software_version': 'Version 1.1',
    'groups': [1,3]
  },
  {
    'id': 6,
    'name': 'Node006',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Down',
    'software_version': 'Version 1.1',
    'groups': [1,3]
  },
  {
    'id': 7,
    'name': 'Node007',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.1',
    'groups': [1,4]
  },
  {
    'id': 8,
    'name': 'Node008',
    'model':"Acme Model 1",
    'arch': 'armv7',
    'status': 'Up',
    'software_version': 'Version 1.1',
    'groups': [1,4]
  },
];

_selectGroup(_groups[0].id);

function _selectGroup(id) {
  _selectedNodes = [];
  //console.log(id, _groups);
  if (id) {
    _currentGroup = _getGroupById(id);
    _getCurrentNodes(_currentGroup.id);
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

function _addNewGroup(group, nodes) {
  var tmpGroup = group;
  for (var i=0;i<nodes.length;i++) {
    tmpGroup.nodes.push(nodes[i].id);
  }
  tmpGroup.id = _groups.length+1;
  var idnew = _groups.length+1;
  _groups.push(tmpGroup);
  _selectGroup(_groups.length);
}

function _getNodeById(nodeId) {
  for (var i=0; i<_allnodes.length;i++) {
    if (_allnodes[i].id === nodeId) {
      return _allnodes[i];
    }
  }
  return;
}

function _getCurrentNodes(groupId) {
  _currentNodes = [];
  var nodelist = _getGroupById(groupId).nodes;
  for (var i=0; i<nodelist.length; i++) {
    _currentNodes.push(_getNodeById(nodelist[i]));
  }
  _sortNodes();
}

function _sortNodes() {
  _currentNodes.sort(statusSort);
}


function _selectNodes(nodePositions) {
  _selectedNodes = [];
  for (var i=0; i<nodePositions.length; i++) {
   _selectedNodes.push(_currentNodes[nodePositions[i]]);
  }
}

function _addToGroup(group, nodes) {
  var tmpGroup = group;

  if (tmpGroup.id) {
    for (var i=0; i<nodes.length;i++) {
      if (tmpGroup.nodes.indexOf(nodes[i].id)===-1) {
        tmpGroup.nodes.push(nodes[i].id);
      }
      else {
        tmpGroup.nodes.splice(tmpGroup.nodes.indexOf(nodes[i].id),1);
      }
    }

    var idx = findWithAttr(_groups, 'id', tmpGroup.id);
    _groups[idx] = tmpGroup;
    _getCurrentNodes(tmpGroup.id);

    // TODO - delete if empty group?

  } else if (nodes.length) {
    // New group
    _addNewGroup(group, nodes);
    // TODO - go through nodes and add group
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

  for (var i=0; i<_allnodes.length; i++) {
    if (typeof(unique[_allnodes[i].software_version]) == "undefined") {
      unique[_allnodes[i].software_version] = 0;
    }
    unique[_allnodes[i].software_version]++;
  }

  for (val in unique) {
    var idx = findWithAttr(_softwareRepo, 'name', val);
    var software = _softwareRepo[idx];
    software.nodes = unique[val];
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

  getNodes: function() {
    return _currentNodes
  },

  getSelectedNodes: function() {
    return _selectedNodes
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
        _selectNodes(payload.action.nodes);
        break;
      case AppConstants.ADD_TO_GROUP:
        _addToGroup(payload.action.group, payload.action.nodes);
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