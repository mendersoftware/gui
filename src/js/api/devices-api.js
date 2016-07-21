var request = require('superagent');
var Promise = require('es6-promise').Promise;

var Api = {
  get: function(url) {
    return new Promise(function (resolve, reject) {
      request
        .get(url)
        .end(function (err, res) {
          if (err || !res.ok) {
            reject();
          } else {
            resolve(res.body);
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
            reject();
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
        .withCredentials()
        .set('Content-Type', 'application/json')
        .send(data)
        .end(function (err, res) {
          if (err || !res.ok) {
            console.log(err);
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