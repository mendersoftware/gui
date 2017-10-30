var request = require('superagent-use')(require('superagent'));
require('superagent-auth-bearer')(request);
var Promise = require('es6-promise').Promise;
import cookie from 'react-cookie';
import { unauthorizedRedirect } from '../auth';

request.use(unauthorizedRedirect);

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
        .set('Content-Type', 'application/jwt')
        .end(function (err, res) {
          if ( err || !res.ok) {
            var errorResponse = {
              text: err.response ? JSON.parse(err.response.text) : err,
              code: err.status
             };
            reject(errorResponse);
          } else {
            var response = {
              text: res.text,
              code: res.status
            };
            resolve(response);
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