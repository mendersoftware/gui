var AppConstants = require('../constants/app-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var Api = require('../api/api');
var UpdatesApi = require('../api/updates-api');
var apiUrl = "http://54.229.121.179:8080/api/0.0.1/";
var updatesApiUrl = "http://private-f72329-deploymenttest.apiary-mock.com/api/0.0.1/";


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



  
  saveSchedule: function(schedule, single) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SAVE_SCHEDULE,
      schedule: schedule,
      single: single
    })
  },




  /* API */
  getUpdates: function() {
    UpdatesApi
      .get(updatesApiUrl+'deployments/')
      .then(function(updates) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_UPDATES,
          updates: updates
        });
      });
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
}

module.exports = AppActions;