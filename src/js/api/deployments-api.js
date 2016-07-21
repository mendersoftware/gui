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
  getText: function(url) {
    return new Promise(function (resolve, reject) {
      request
        .get(url)
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

}

module.exports = Api;