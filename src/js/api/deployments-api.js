var request = require('superagent');
var Promise = require('es6-promise').Promise;
var LocalStore = require('../stores/local-store');

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
  getText: function(url) {
    var token = LocalStore.getStorageItem("JWT");
    return new Promise(function (resolve, reject) {
      request
        .get(url)
        .authBearer(token)
        .set('Content-Type', 'application/text')
        .end(function (err, res) {
          if (err || !res.ok) {
            reject();
          } else {
            resolve(res.text);
          }
        });
    });
  },
  post: function(url, data) {
    var token = LocalStore.getStorageItem("JWT");
    return new Promise(function (resolve, reject) {
      request
        .post(url)
        .authBearer(token)
        .set('Content-Type', 'application/json')
        .send(data)
        .end(function (err, res) {
          if (err || !res.ok) {
            reject();
          } else {
            resolve(res.header);
          }
        });
    });
  },

}

module.exports = Api;