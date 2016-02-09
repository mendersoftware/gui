var request = require('superagent');
var Promise = require('es6-promise').Promise;

var username = "admin";
var password = "admin";

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
            resolve(JSON.parse(res.text));
          }
        });
    });
  },
  putImage: function(url, image) {
    return new Promise(function (resolve, reject) {
      request
        .put(url)
        .set("Content-Type", "application/octet-stream")
        .send(image)
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
  },
  putJSON: function(url, data) {
    return new Promise(function (resolve, reject) {
      request
        .put(url)
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