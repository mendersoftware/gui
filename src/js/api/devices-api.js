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
        .set('Content-Type', 'application/json')
        .send(data)
        .end(function (err, res) {
          console.log(res);
          if (err || !res.ok) {
            console.log("err", err, res);
            reject(JSON.parse(res.text));
          } else {
            console.log(" no error ");
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