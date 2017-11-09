var AppConstants = require('../constants/app-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var ArtifactsApi = require('../api/artifacts-api');
var DeploymentsApi = require('../api/deployments-api');
var DevicesApi = require('../api/devices-api');
var GeneralApi = require('../api/general-api');
var UsersApi = require('../api/users-api');
var rootUrl = "https://localhost:443";
var apiUrl = rootUrl + "/api/management/v1"
var deploymentsApiUrl = apiUrl + "/deployments";
var devicesApiUrl = apiUrl + "/admission";
var devAuthApiUrl = apiUrl + "/devauth";
var inventoryApiUrl = apiUrl + "/inventory";
var useradmApiUrl = apiUrl + "/useradm";
var tenantadmUrl = apiUrl + "/tenantadm";

var parse = require('parse-link-header');

// default per page until pagination and counting integrated
var default_per_page = 20;
var default_adm_per_page = 20;
var default_deps_per_page = 5;
var default_page = 1;


var AppActions = {
 
  selectGroup: function(group) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SELECT_GROUP,
      group: group
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
      .delete(inventoryApiUrl+"/devices/" + device + "/group/" + group)
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
        callback.success(res.body, parse(res.headers['link']));
      })
      .catch(function(err) {
        callback.error(err);
      });
  },

  setGroupDevices: function(devices) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.RECEIVE_GROUP_DEVICES,
      devices: devices
    });
  },

  getDevices: function(callback, page, per_page, group, search_term, all) {
    var count = 0;
    var page = page || default_page;
    var per_page = per_page || default_per_page;
    var forGroup = group ? '/groups/' + group : "";
    var searchTerm = search_term ? "&"+search_term : "";
    var devices = [];
    function getDeviceList() {
      DevicesApi
        .get(inventoryApiUrl+forGroup+"/devices?per_page="+per_page+"&page="+page+searchTerm)
        .then(function(res) {
          var links = parse(res.headers['link']);
          count += res.body.length;
          devices = devices.concat(res.body);
          if (all && links.next) {
            page++;
            getDeviceList();
          } else {
            if (!group) {
              AppDispatcher.handleViewAction({
                actionType: AppConstants.RECEIVE_ALL_DEVICES,
                devices: devices
              });
            }
            callback.success(devices, parse(res.headers['link']));
          }
        })
        .catch(function(err) {
          callback.error(err);
        });
    };
    getDeviceList();
  },
  getDeviceById: function(id, callback) {
    DevicesApi
      .get(inventoryApiUrl+"/devices/"+id)
      .then(function(res) {
        callback.success(res.body);
      })
      .catch(function(err) {
        callback.error(err);
      });
  },
  getDeviceCount: function(callback, status) {
    var filter = status ? "?status="+status : '';

    DevicesApi
      .get(devAuthApiUrl+"/devices/count"+filter)
      .then(function(res) {
        switch (status) {
          case "pending":
            AppDispatcher.handleViewAction({
              actionType: AppConstants.SET_PENDING_DEVICES,
              count: res.body.count
            });
            break;
          case "accepted":
            AppDispatcher.handleViewAction({
              actionType: AppConstants.SET_ACCEPTED_DEVICES,
              count: res.body.count
            });
            break;
          default:
            AppDispatcher.handleViewAction({
              actionType: AppConstants.SET_TOTAL_DEVICES,
              count: res.body.count
            });
        }
        callback.success(res.body.count);
      })
      .catch(function(err) {
        callback.error(err);
      });
  },
  getDeviceLimit: function(callback) {
      DevicesApi
      .get(devAuthApiUrl+"/limits/max_devices")
      .then(function(res) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.SET_DEVICE_LIMIT,
          limit: res.count
        });

        callback.success(res.count);
      })
      .catch(function(err) {
        callback.error(err);
      });
  },


  getNumberOfDevicesInGroup: function (callback, group) {
    var count = 0;
    var per_page = 100;
    var page = 1;
    var forGroup = group ? '/groups/' + group : "";
    function getDeviceCount() {
      DevicesApi
      .get(inventoryApiUrl+forGroup+"/devices?per_page=" + per_page + "&page="+page)
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
        callback(err);
      })
    };
    getDeviceCount();
  },


  /* General */
  setSnackbar: function(message, duration) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_SNACKBAR,
      message: message,
      duration: duration
    })
  },



/* user management */

  loginUser: function(callback, userData) {
    UsersApi
      .postLogin(useradmApiUrl+"/auth/login", userData)
      .then(function(res) {
        callback.success(res.text);
      })
      .catch(function(err) {
        if (err.code && (err.code !== 200)) {
          callback.error(err.text);
        }
      })
  },

  getUserList: function(callback) {
    UsersApi
      .get(useradmApiUrl+"/users")
      .then(function(res) {
        callback.success(res);
      })
      .catch(function(err) {
        callback.error(err);
      })
  },


  getUser: function(id, callback) {
    UsersApi
      .get(useradmApiUrl+"/users/" + id)
      .then(function(res) {
        callback.success(res);
      })
      .catch(function(err) {
        callback.error(err);
      })
  },

  createUser: function(userData, callback) {
    UsersApi
      .post(useradmApiUrl+"/users", userData)
      .then(function(res) {
        callback.success(res);
      })
      .catch(function(err) {
        callback.error(err);
      })
  },

  removeUser: function(userId, callback) {
    UsersApi
      .delete(useradmApiUrl+"/users/"+userId)
      .then(function(res) {
        callback.success(res);
      })
      .catch(function(err) {
        callback.error(err);
      })
  },

  editUser: function(userId, userData, callback) {
    UsersApi
      .put(useradmApiUrl+"/users/"+userId, userData)
      .then(function(res) {
        callback.success(res);
      })
      .catch(function(err) {
        callback.error(err);
      })
  },

  setCurrentUser: function(user) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_CURRENT_USER,
      user: user
    });
  },


  /* Tenant management */
  getUserOrganization: function(callback) {
    GeneralApi
      .get(tenantadmUrl+"/user/tenant")
      .then(function(res) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.SET_MULTITENANCY,
          organization: res.body
        });
        callback.success(res.body);
      })
      .catch(function(err) {
        callback.error(err);
      })
  },



  // Onboarding
  setShowHelptips: function(val) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_SHOW_HELP,
      show: val
    });
  },

  /* Device Admission */
  getDevicesForAdmission: function (callback, page, per_page) {
    // only return pending devices
    var page = page || default_page;
    var per_page = per_page || default_adm_per_page;
    DevicesApi
      .get(devicesApiUrl+"/devices?status=pending&per_page="+per_page+"&page="+page)
      .then(function(res) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_ADMISSION_DEVICES,
          devices: res.body
        });
        callback.success(res.body, parse(res.headers['link']));
      })
      .catch(function(err) {
        callback.error(err);
      })
  },
  
  getDeviceIdentity: function (id, callback) {
    DevicesApi
      .get(devAuthApiUrl+"/devices/" + id)
      .then(function(res) {
        callback.success(res.body);
      })
      .catch(function(err) {
        callback.error(err);
      })
  },

  acceptDevice: function (device, callback) {
    // accept single device through dev admn api
    DevicesApi
      .put(devicesApiUrl+"/devices/"+device.id +"/status", {"status":"accepted"})
      .then(function(data) {
        callback.success(data);
      })
      .catch(function(err) {
        callback.error(err);
      });
  },
  reacceptDevice: function (device, callback) {
    // accept single device by changing status in dev auth api
    DevicesApi
      .put(devAuthApiUrl+"/devices/"+device.id + "/auth/" + device.auth_sets[0].id +"/status", {"status":"accepted"})
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
  blockDevice: function (device, callback) {
    DevicesApi
      .put(devAuthApiUrl+"/devices/"+device.id + "/auth/" + device.auth_sets[0].id +"/status", {"status":"rejected"})
      .then(function(data) {
        callback.success(data);
      })
      .catch(function(err) {
        callback.error(err);
      });
  },
  decommissionDevice: function(device, callback) {
    DevicesApi
      .delete(devAuthApiUrl+"/devices/"+device.id)
      .then(function(data) {
        callback.success(data);
      })
      .catch(function(err) {
        callback.error(err);
      });
  },




  /* Artifacts */
  getArtifacts: function(callback) {
    ArtifactsApi
      .get(deploymentsApiUrl+'/artifacts')
      .then(function(artifacts) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_ARTIFACTS,
          artifacts: artifacts
        });
        callback.success(artifacts);
      })
      .catch(function(err) {
        callback.error(err);
      });
  },

  uploadArtifact: function(meta, file, callback) {
    var formData = new FormData();
    formData.append('size', file.size)
    formData.append('description', meta.description)
    formData.append('artifact', file)
    ArtifactsApi
      .postFormData(deploymentsApiUrl+'/artifacts', formData, function(e) {
        callback.progress(e.percent);
      })
      .then(function(data) {
        callback.success(data);
      })
      .catch(function(err) {
        callback.error(err);
      });
  },

  setUploadInProgress: function(bool) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.UPLOAD_PROGRESS,
      inprogress: bool
    });
  },

  editArtifact: function(id, body, callback) {
    ArtifactsApi
      .putJSON(deploymentsApiUrl + "/artifacts/" + id, body)
      .then(function(data) {
        callback.success(data);
      })
      .catch(function(err) {
        callback.error(err);
      });
  },

  removeArtifact: function(id, callback) {
    ArtifactsApi
      .delete(deploymentsApiUrl+"/artifacts/"+id)
      .then(function() {
        callback.success();
      })
      .catch(function(err) {
        callback.error(err);
      })
  },

  setDeploymentArtifact: function(artifact) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_DEPLOYMENT_ARTIFACT,
      artifact: artifact
    });
  },




  /*Deployments */
  getDeployments: function(callback, page, per_page) {
    // all deployments
    var page = page || default_page;
    var per_page = per_page || default_per_page;
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments?page='+page+'&per_page='+per_page)
      .then(function(res) {
        var deployments = res.body;
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_DEPLOYMENTS,
          deployments: deployments
        });
        var links = parse(res.headers['link']);
        callback.success(res.body, links);
      })
      .catch(function(err) {
        callback.error(err);
      })
  },
  getDeploymentsInProgress: function(callback, page, per_page) {
    var page = page || default_page;
    var per_page = per_page || default_per_page;
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments?status=inprogress&page='+page+'&per_page='+per_page)
      .then(function(res) {
        var deployments = res.body;
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_ACTIVE_DEPLOYMENTS,
          deployments: deployments
        });
        var links = parse(res.headers['link']);
        callback.success(res.body, links);
      })
      .catch(function(err) {
        callback.error(err);
      })
  },
  getPastDeployments: function(callback, page, per_page) {
    var page = page || default_page;
    var per_page = per_page || default_deps_per_page;
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments?status=finished&per_page='+ per_page +'&page=' + page)
      .then(function(res) {
        var deployments = res.body;
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_PAST_DEPLOYMENTS,
          deployments: deployments
        });
        var links = parse(res.headers['link']);
        callback.success(res.body, links);
      })
      .catch(function(err) {
        callback.error(err);
      })
  },
  getPendingDeployments: function(callback, page, per_page) {
    var page = page || default_page;
    var per_page = per_page || default_per_page;
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments?status=pending&page='+page+'&per_page='+per_page)
      .then(function(res) {
        var deployments = res.body;
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_PENDING_DEPLOYMENTS,
          deployments: deployments
        });
        var links = parse(res.headers['link']);
        callback.success(res.body, links);
      })
      .catch(function(err) {
        callback.error(err);
      })
  },
  getDeploymentCount: function(status, callback) {
    var page = 1;
    var per_page = 100;
    var count = 0;
    function DeploymentCount() {
      DeploymentsApi
        .get(deploymentsApiUrl+'/deployments?status='+status+'&per_page='+per_page+'&page='+page)
        .then(function(res) {
          var links = parse(res.headers['link']);
          count += res.body.length;
          if (links.next) {
            page++;
            DeploymentCount();
          } else {
            callback(count);
          }
        })
        .catch(function(err) {
          console.log("err", err);
          callback(err);
        })
    };
    DeploymentCount();
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
      .then(function(res) {
        callback(res.body);
      });
  },
  getSingleDeploymentStats: function(id, callback) {
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments/'+id +'/statistics')
      .then(function(res) {
        callback(res.body);
      });
  },
  getSingleDeploymentDevices: function(id, callback) {
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments/'+id +'/devices')
      .then(function(res) {
        callback(res.body);
      });
  },
  getDeviceLog: function(deploymentId, deviceId, callback) {
    DeploymentsApi
      .getText(deploymentsApiUrl+'/deployments/'+deploymentId +'/devices/'+deviceId +"/log")
      .then(function(data) {
        callback(data);
      });
  },
  abortDeployment: function(deploymentId, callback) {
    DeploymentsApi
      .put(deploymentsApiUrl+'/deployments/'+deploymentId +'/status', {status: "aborted"})
      .then(function(data) {
        callback.success(data);
      })
      .catch(function(err) {
        callback.error(err);
      });
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