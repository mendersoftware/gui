var AppConstants = require('../constants/app-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var Api = require('../api/api');
var DeploymentsApi = require('../api/deployments-api');
var apiUrl = "http://private-62004-deployment1.apiary-mock.com/";
var deploymentsApiUrl = "http://private-62004-deployment1.apiary-mock.com/";


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

  authorizeDevices: function (devices) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.AUTHORIZE_DEVICES,
      devices: devices
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
    var data = {description: image.description, name: image.name, device_type: image.device_type, image: image.tags};
    Api
      .putJSON(apiUrl + "images/" + image.id, data)
      .then(function(res) {
        callback();
      });
  },




  /* API */
  getDeployments: function() {
    DeploymentsApi
      .get(deploymentsApiUrl+'deployments')
      .then(function(deployments) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_DEPLOYMENTS,
          deployments: deployments
        });
      });
  },
  createDeployment: function(deployment) {
    DeploymentsApi
    .post(deploymentsApiUrl+'deployments', deployment)
      .then(function(data) {
        // inserted deployment data,
        callback(data);
      });
  },
  getSingleDeployment: function(id, callback) {
    DeploymentsApi
      .get(deploymentsApiUrl+'deployments/'+id)
      .then(function(data) {
        callback(data);
      });
  },
  getSingleDeploymentStats: function(id, callback) {
    DeploymentsApi
      .get(deploymentsApiUrl+'deployments/'+id +'/statistics')
      .then(function(data) {
        callback(data);
      });
  },
  getSingleDeploymentDevices: function(id, callback) {
    DeploymentsApi
      .get(deploymentsApiUrl+'deployments/'+id +'/devices')
      .then(function(data) {
        callback(data);
      });
  },
  getDeviceLog: function(deploymentId, deviceId, callback) {
    DeploymentsApi
      .getText(deploymentsApiUrl+'deployments/'+deploymentId +'/devices/'+deviceId +"/log")
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







  removeDeployment: function(deploymentId) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.REMOVE_DEPLOYMENT,
      id: deploymentId
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