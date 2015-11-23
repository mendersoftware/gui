var AppConstants = require('../constants/app-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');


var AppActions = {
 
  selectGroup: function(groupId) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SELECT_GROUP,
      groupId: groupId
    })
  },

  selectDevices: function(deviceList) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SELECT_DEVICES,
      devices: deviceList
    })
  },

  addToGroup: function(group, deviceList) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.ADD_TO_GROUP,
      group: group,
      devices: deviceList
    })
  },

  uploadImage: function(image) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.UPLOAD_IMAGE,
      image: image
    })
  },
  
  saveSchedule: function(schedule, single) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SAVE_SCHEDULE,
      schedule: schedule,
      single: single
    })
  },

  removeUpdate: function(updateId) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.REMOVE_UPDATE,
      id: updateId
    })
  },

  updateFilters: function(filters) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.UPDATE_FILTERS,
      filters: filters
    })
  },

  sortTable: function(table, column, direction) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SORT_TABLE,
      table: table,
      column: column,
      direction: direction 
    })
  },
}

module.exports = AppActions;