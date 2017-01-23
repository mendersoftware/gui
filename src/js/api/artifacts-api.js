var request = require('superagent-use')(require('superagent'));
var Promise = require('es6-promise').Promise;
var LocalStore = require('../stores/local-store');
import auth from '../auth';

request.use(auth.unauthorizedRedirect);

var Api = {
  get: function(url) {
    var token = LocalStore.getStorageItem("JWT");
    return new Promise(function (resolve, reject) {
      request
        .get(url)
        .authBearer(token)
        .end(function (err, res) {
          if (err || !res.ok) {
            reject();
          } else {
            resolve(res.body);
          }
        });
    });
  },
  postFormData: function(url, formData) {
    var token = LocalStore.getStorageItem("JWT");
    return new Promise(function (resolve, reject) {
      request
        .post(url)
        .authBearer(token)
        .send(formData)
        .end(function (err, res) {
          if (err || !res.ok) {
            var errorResponse = err.response ? JSON.parse(err.response.text) : {error:"There was an error uploading the artifact"};
            reject(errorResponse);
          } else {
            resolve(res.body);
          }
        });
    });
  },
  putJSON: function(url, data) {
    var token = LocalStore.getStorageItem("JWT");
    return new Promise(function (resolve, reject) {
      request
        .put(url)
        .authBearer(token)
        .set('Content-Type', 'application/json')
        .send(data)
        .end(function (err, res) {
          if (err || !res.ok) {
            reject();
          } else {
            var responsetext = "";
            if (res.text) {
              responsetext = JSON.parse(res.text);
            }
            resolve(responsetext);
          }
        });
    });
  }
}

module.exports = Api;