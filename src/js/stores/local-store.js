/*
* Store for localStorage
*
*/
var AppDispatcher = require('../dispatchers/app-dispatcher');
var AppConstants = require('../constants/app-constants');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;  // from device

var CHANGE_EVENT = "change";


function _setStorage(key, value) {
  localStorage.setItem(key, value);
}

function _getStorageItem(key) {
  return localStorage.getItem(key);
}

var LocalStore = assign(EventEmitter.prototype, {
  emitChange: function() {
    this.emit(CHANGE_EVENT)
  },

  getStorageItem: function(key) {
    return _getStorageItem(key);
  },

  changeListener: function(callback) {
    this.on(CHANGE_EVENT, callback)
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  dispatcherIndex: AppDispatcher.register(function(payload) {
    var action = payload.action;
    switch(action.actionType) {
      case AppConstants.SET_LOCAL_STORAGE:
        _setStorage(payload.action.key, payload.action.value);
        break;
    }
    
    LocalStore.emitChange();
    return true;
  })

});

module.exports = LocalStore;
