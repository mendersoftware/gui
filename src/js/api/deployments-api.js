var request = require('superagent-use')(require('superagent'));
var Promise = require('es6-promise').Promise;
import cookie from 'react-cookie';
import auth from '../auth';

request.use(auth.unauthorizedRedirect);

var Api = {
  get: function(url) {
    var token = cookie.load("JWT");
    return new Promise(function (resolve, reject) {
      request
        .get(url)
        .authBearer(token)
        .timeout({
          response: 5000, // wait 5 seconds for server to start sending
          deadline: 60000, // allow one minute to finish loading
        })
        .end(function (err, res) {
          if (err || !res.ok) {
            reject(err);
          } else {
            resolve(res);
          }
        });
    });
  },
  getText: function(url) {
    var token = cookie.load("JWT");
    return new Promise(function (resolve, reject) {
      request
        .get(url)
        .authBearer(token)
        .set('Content-Type', 'application/text')
        .end(function (err, res) {
          if (err || !res.ok) {
            reject(err);
          } else {
            resolve(res.text);
          }
        });
    });
  },
  post: function(url, data) {
    var token = cookie.load("JWT");
    return new Promise(function (resolve, reject) {
      request
        .post(url)
        .authBearer(token)
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
    var token = cookie.load("JWT");
    return new Promise(function (resolve, reject) {
      request
        .put(url)
        .authBearer(token)
        .set('Content-Type', 'application/json')
        .send(data)
        .end(function (err, res) {
          if (err || !res.ok) {
            reject(err);
          } else {
            resolve(res.body);
          }
        });
    });
  },

}

module.exports = Api;