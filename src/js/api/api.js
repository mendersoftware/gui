var request = require('superagent');
var Promise = require('es6-promise').Promise;

var Api = {
  get: function(url) {
    return new Promise(function (resolve, reject) {
      request
        .get(url)
        .end(function (err, res) {
          if (err || !res.ok) {
            console.log("error", res);
            reject();
          } else {
            console.log("api", res);
            resolve(res.body);
          }
        });
    });
  },
  post: function(url, data) {
    return new Promise(function (resolve, reject) {
      console.log(url);
      request
        .post(url)
        .set('Content-Type', 'application/json')
        .send(data)
        .end(function (err, res) {
          console.log(err, res);
          if (err || !res.ok) {
            reject();
          } else {
            resolve(JSON.parse(res.text));
          }
        });
    });
  }
}

module.exports = Api;