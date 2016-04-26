var AppConstants = require('../constants/app-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var Api = require('../api/api');
var UpdatesApi = require('../api/updates-api');
var apiUrl = "http://private-9f43d-michaelatmender.apiary-mock.com/api/0.0.1/";
var updatesApiUrl = "http://private-9f43d-michaelatmender.apiary-mock.com/api/0.0.1/";


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

  removeGroup: function(groupId) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.REMOVE_GROUP,
      groupId: groupId
    })
  },

  addGroup: function(group, idx) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.ADD_GROUP,
      group: group,
      index: idx
    })
  },


  /* API */

  getImages: function() {
    Api
      .get(apiUrl+'images')
      .then(function(images) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_IMAGES,
          images: images
        });
      });
  },

  uploadImage: function(meta, callback) {
    Api
      .post(apiUrl+'images', meta)
      .then(function(data) {
        // inserted image meta data, got ID in return 
        callback(data.id);
      });
  },

  getUploadUri: function(id, callback) {
    Api
      .get(apiUrl + 'images/' + id + "/upload?expire=60")
      .then(function(data) {
        var uri = data.uri;
        callback(uri);
      });
  },
  
  doFileUpload: function(uri, image, callback) {
    // got upload uri, finish uploading file
    Api
      .putImage(uri, image)
      .then(function(data) {
        callback();
      });
  },

  editImage: function(image, callback) {
    var data = {description: image.description, name: image.name, model: image.model, image: image.tags};
    Api
      .putJSON(apiUrl + "images/" + image.id, data)
      .then(function(res) {
        callback();
      });
  },




  /* API */
  getUpdates: function() {
    UpdatesApi
      .get(updatesApiUrl+'deployments')
      .then(function(updates) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_UPDATES,
          updates: updates
        });
      });
  },
  createUpdate: function(update) {
    UpdatesApi
    .post(updatesApiUrl+'deployments', update)
      .then(function(data) {
        // inserted update data,
        callback(data);
      });
  },
  getSingleUpdate: function(id, callback) {
    UpdatesApi
      .get(updatesApiUrl+'deployments/'+id)
      .then(function(data) {
        callback(data);
      });
  },
  getSingleUpdateStats: function(id, callback) {
    UpdatesApi
      .get(updatesApiUrl+'deployments/'+id +'/statistics')
      .then(function(data) {
        callback(data);
      });
  },
  getSingleUpdateDevices: function(id, callback) {
    UpdatesApi
      .get(updatesApiUrl+'deployments/'+id +'/devices')
      .then(function(data) {
        callback(data);
      });
  },
  getDeviceLog: function(deploymentId, deviceId, callback) {
    UpdatesApi
      .getText(updatesApiUrl+'deployments/'+deploymentId +'/devices/'+deviceId +"/log")
      .then(function(data) {
        callback(data);
      });
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

  updateDeviceTags: function(id, tags) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.UPDATE_DEVICE_TAGS,
      id: id,
      tags: tags
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


setLocalStorage: function(key, value) {
  AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_LOCAL_STORAGE,
      key: key,
      value: value
    })
  }
}

module.exports = AppActions;