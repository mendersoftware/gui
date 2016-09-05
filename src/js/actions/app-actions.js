var AppConstants = require('../constants/app-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var ImagesApi = require('../api/images-api');
var DeploymentsApi = require('../api/deployments-api');
var DevicesApi = require('../api/devices-api');
var rootUrl = "https://192.168.99.100";
var apiUrl = rootUrl + "/api/integrations/0.1"
var deploymentsApiUrl = apiUrl + "/deployments";
var devicesApiUrl = apiUrl + "/admission";
var inventoryApiUrl = "http://private-6074118-menderinventory.apiary-mock.com";


var AppActions = {
 
  selectGroup: function(group) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SELECT_GROUP,
      group: group
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


  /* Groups */
  getGroups: function(callback) {
    DevicesApi
      .get(inventoryApiUrl+"/groups")
      .then(function(groups) {
         AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_GROUPS,
          groups: groups
        });
        callback.success(groups);
      })
      .catch(function(err) {
        callback.error(err);
      });
  },

  getGroupDevices: function(group, callback) {
    DevicesApi
      .get(inventoryApiUrl+"/groups/" + group +"/devices")
      .then(function(devices) {
        callback.success(devices);
      })
      .catch(function(err) {
        callback.error(err);
      });
  },

  getDevices: function(callback) {
    DevicesApi
      .get(inventoryApiUrl+"/devices")
      .then(function(devices) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_ALL_DEVICES,
          devices: devices
        });
        callback.success(devices); 
      })
      .catch(function(err) {
        callback.error(err);
      });
  },


  /* General */
  setSnackbar: function(message, duration) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_SNACKBAR,
      message: message,
      duration: duration
    })
  },


  /* Device Admission */
  getDevicesForAdmission: function (callback) {
    DevicesApi
      .get(devicesApiUrl+"/devices")
      .then(function(devices) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_ADMISSION_DEVICES,
          devices: devices
        });
        callback(devices);
      })
      .catch(function(err) {
        callback(err);
      })
  },

  acceptDevice: function (device, callback) {
    DevicesApi
      .put(devicesApiUrl+"/devices/"+device.id +"/status", {"status":"accepted"})
      .then(function(data) {
        callback.success(data);
      })
      .catch(function(err) {
        callback.error(err);
      });
  },
  rejectDevice: function (device, callback) {
    DevicesApi
      .put(devicesApiUrl+"/devices/"+device.id +"/status", {"status":"rejected"})
      .then(function(data) {
        callback.success(data);
      })
      .catch(function(err) {
        callback.error(err);
      });
  },




  /* Images */
  getImages: function(callback) {
    ImagesApi
      .get(deploymentsApiUrl+'/images')
      .then(function(images) {
        callback.success(images);
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_IMAGES,
          images: images
        });
      })
      .catch(function(err) {
        callback.error(err);
      });
  },

  uploadImage: function(meta, callback) {
    ImagesApi
      .post(deploymentsApiUrl+'/images', meta)
      .then(function(data) {
        // inserted image meta data, got ID in return 
        callback(data.location);
      });
  },

  getUploadUri: function(id_url, callback) {
    ImagesApi
      .get(id_url + "/upload?expire=60")
      .then(function(data) {
        var uri = data.uri;
        callback(uri);
      });
  },
  
  doFileUpload: function(uri, image, callback) {
    // got upload uri, finish uploading file
    ImagesApi
      .putImage(uri, image)
      .then(function(data) {
        callback();
      });
  },

  editImage: function(image, callback) {
    ImagesApi
      .putJSON(deploymentsApiUrl + "/images/" + image.id, image)
      .then(function(res) {
        callback();
      });
  },




  /*Deployments */
  getDeployments: function(callback) {
    // all deployments
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments')
      .then(function(deployments) {
        callback();
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_DEPLOYMENTS,
          deployments: deployments
        });
      })
      .catch(function(err) {
        callback(err);
      })
  },
  getDeploymentsInProgress: function(callback) {
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments?status=inprogress')
      .then(function(deployments) {
        callback();
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_ACTIVE_DEPLOYMENTS,
          deployments: deployments
        });
      })
      .catch(function(err) {
        callback(err);
      })
  },
  getPastDeployments: function(callback) {
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments?status=finished')
      .then(function(deployments) {
        callback();
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_PAST_DEPLOYMENTS,
          deployments: deployments
        });
      })
      .catch(function(err) {
        callback(err);
      })
  },
  createDeployment: function(deployment, callback) {
    DeploymentsApi
    .post(deploymentsApiUrl+'/deployments', deployment)
    .then(function(data) {
      callback(deploymentsApiUrl + data.location);
    });
  },
  getSingleDeployment: function(id, callback) {
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments/'+id)
      .then(function(data) {
        callback(data);
      });
  },
  getSingleDeploymentStats: function(id, callback) {
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments/'+id +'/statistics')
      .then(function(data) {
        callback(data);
      });
  },
  getSingleDeploymentDevices: function(id, callback) {
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments/'+id +'/devices')
      .then(function(data) {
        callback(data);
      });
  },
  getDeviceLog: function(deploymentId, deviceId, callback) {
    DeploymentsApi
      .getText(deploymentsApiUrl+'/deployments/'+deploymentId +'/devices/'+deviceId +"/log")
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