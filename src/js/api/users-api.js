var request = require('superagent-use')(require('superagent'));
require('superagent-auth-bearer')(request);
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
        .end(function (err, res) {
          if (err || !res.ok) {
            reject(err);
          } else {
            resolve(res.body);
          }
        });
    });
  },
  postLogin: function(url, userData) {
    return new Promise(function (resolve, reject) {
      request
        .post(url)
        .auth(userData.email, userData.password)
        .end(function (err, res) {
          if (err.statusCode !== 200) {
            // successful raw response throws err, but with status code 200
            var errorResponse = err.response ? JSON.parse(err.response.text) : err;
            reject(errorResponse);
          } else {
            // get token as raw response
            var rawResponse = err.rawResponse;
            resolve(rawResponse);
          }
        });
    });
  },
  post: function(url, userData) {
    return new Promise(function (resolve, reject) {
      var token = cookie.load("JWT");
      request
        .post(url)
        .authBearer(token)
        .set('Content-Type', 'application/json')
        .send(userData)
        .end(function (err, res) {
          if (err || !res.ok) {
            reject(err);
          } else {
            resolve(res.header);
          }
        });
    });
  },
  put: function(url, userData) {
    return new Promise(function (resolve, reject) {
      var token = cookie.load("JWT");
      request
        .put(url)
        .authBearer(token)
        .set('Content-Type', 'application/json')
        .send(userData)
        .end(function (err, res) {
          if (err || !res.ok) {
            reject(err);
          } else {
            resolve(res.header);
          }
        });
    });
  },
  delete: function(url) {
    var token = cookie.load("JWT");
    return new Promise(function (resolve, reject) {
      request
        .del(url)
        .authBearer(token)
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