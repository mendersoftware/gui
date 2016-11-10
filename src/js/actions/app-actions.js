var AppConstants = require('../constants/app-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var ImagesApi = require('../api/images-api');
var DeploymentsApi = require('../api/deployments-api');
var DevicesApi = require('../api/devices-api');
var rootUrl = "https://localhost:8080";
var apiUrl = rootUrl + "/api/integrations/0.1"
var deploymentsApiUrl = apiUrl + "/deployments";
var devicesApiUrl = apiUrl + "/admission";
var inventoryApiUrl = apiUrl + "/inventory";

var parse = require('parse-link-header');

// default per page until pagination and counting integrated
var default_per_page = 20;
var default_page = 1;


var AppActions = {
 
  selectGroup: function(group) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SELECT_GROUP,
      group: group
    })
  },

  selectDevices: function(device) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SELECT_DEVICES,
      device: device
    })
  },

  addDeviceToGroup: function(group, device, callback) {
    DevicesApi
      .put(inventoryApiUrl+"/devices/" + device + "/group", {"group":group})
      .then(function(result) {
        callback.success(result);
      })
      .catch(function(err) {
        callback.error(err);
      })
  },

  removeDeviceFromGroup: function(device, group, callback) {
    DevicesApi
      .del(inventoryApiUrl+"/devices/" + device + "/group/" + group)
      .then(function(result) {
        callback.success(result);
      })
      .catch(function(err) {
        callback.error(err);
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
      .then(function(res) {
         AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_GROUPS,
          groups: res.body
        });
        callback.success(res.body);
      })
      .catch(function(err) {
        callback.error(err);
      });
  },

  getGroupDevices: function(group, callback, page, per_page) {
    var page = page || default_page;
    var per_page = per_page || default_per_page;
    DevicesApi
      .get(inventoryApiUrl+"/groups/" + group +"/devices?per_page="+per_page + "&page="+page)
      .then(function(res) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_GROUP_DEVICES,
          devices: res.body
        });
        callback.success(res.body);
      })
      .catch(function(err) {
        callback.error(err);
      });
  },

  getDevices: function(callback, page, per_page) {
    var page = page || default_page;
    var per_page = per_page || default_per_page;
    DevicesApi
      .get(inventoryApiUrl+"/devices?per_page="+per_page+"&page="+page)
      .then(function(res) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_ALL_DEVICES,
          devices: res.body
        });
        callback.success(res.body);
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
  getDevicesForAdmission: function (callback, page, per_page) {
    // only return pending devices
    var page = page || default_page;
    var per_page = per_page || default_per_page;
    DevicesApi
      .get(devicesApiUrl+"/devices?status=pending&per_page="+per_page+"&page="+page)
      .then(function(res) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_ADMISSION_DEVICES,
          devices: res.body
        });
        callback(res.body, parse(res.headers['link']));
      })
      .catch(function(err) {
        callback(err);
      })
  },
  getNumberOfDevicesForAdmission: function (callback) {
    var count = 0;
    var per_page = 5;
    var page = 1;
    function getDeviceCount() {
      DevicesApi
      .get(devicesApiUrl+"/devices?status=pending&per_page=" + per_page + "&page="+page)
      .then(function(res) {
        var links = parse(res.headers['link']);
        count += res.body.length;
        if (links.next) {
          page++;
          getDeviceCount();
        } else {
          callback(count);
        }
      })
      .catch(function(err) {
        this.callback(err);
      })
    };
    getDeviceCount();
  },
  getDeviceIdentity: function (id, callback) {
    DevicesApi
      .get(devicesApiUrl+"/devices/" + id)
      .then(function(devices) {
        callback.success(devices);
      })
      .catch(function(err) {
        callback.error(err);
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
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_IMAGES,
          images: images
        });
        callback.success(images);
      })
      .catch(function(err) {
        callback.error(err);
      });
  },

  uploadImage: function(meta, file, callback) {
    var formData = new FormData();
    formData.append('name', meta.name)
    formData.append('description', meta.description)
    formData.append('firmware', file)
    ImagesApi
      .postFormData(deploymentsApiUrl+'/images', formData)
      .then(function(data) {
        callback.success(data);
      })
      .catch(function(err) {
        callback.error(err);
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
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_DEPLOYMENTS,
          deployments: deployments
        });
        callback();
      })
      .catch(function(err) {
        callback(err);
      })
  },
  getDeploymentsInProgress: function(callback) {
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments?status=inprogress')
      .then(function(deployments) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_ACTIVE_DEPLOYMENTS,
          deployments: deployments
        });
        callback();
      })
      .catch(function(err) {
        callback(err);
      })
  },
  getPastDeployments: function(callback) {
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments?status=finished')
      .then(function(deployments) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_PAST_DEPLOYMENTS,
          deployments: deployments
        });
        callback();
      })
      .catch(function(err) {
        callback(err);
      })
  },
  createDeployment: function(deployment, callback) {
    DeploymentsApi
    .post(deploymentsApiUrl+'/deployments', deployment)
    .then(function(data) {
      callback.success(data.location);
    })
    .catch(function(err) {
      callback.error(err);
    })
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