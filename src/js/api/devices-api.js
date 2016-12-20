var request = require('superagent');
var Promise = require('es6-promise').Promise;

var Api = {
  get: function(url) {
    return new Promise(function (resolve, reject) {
      request
        .get(url)
        .end(function (err, res) {
          if (err || !res.ok) {
            reject(err);
          } else {
            resolve(res);
          }
        });
    });
  },
  post: function(url, data) {
    return new Promise(function (resolve, reject) {
      request
        .post(url)
        .set('Content-Type', 'application/json')
        .send(data)
        .end(function (err, res) {
          if (err || !res.ok) {
            reject(err);
          } else {
            resolve(res.header);
          }
        });
    });
  },
  put: function(url, data) {
    return new Promise(function (resolve, reject) {
      request
        .put(url)
        .set('Content-Type', 'application/json')
        .send(data)
        .end(function (err, res) {
          if (err || !res.ok) {
            var responsetext = "";
            if (res.text) {
              responsetext = JSON.parse(res.text);
            }
            var msg = responsetext.error || err;
            reject(msg);
          } else {
            resolve(res.body);
          }
        });
    });
  },
  del: function(url) {
    return new Promise(function (resolve, reject) {
      request
        .del(url)
        .end(function (err, res) {
          if (err || !res.ok) {
            reject(err);
          } else {
            resolve(res.header);
          }
        });
    });
  },

}

module.exports = Api;