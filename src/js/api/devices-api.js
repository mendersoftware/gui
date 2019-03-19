var request = require('superagent-use')(require('superagent'));
var Promise = require('es6-promise').Promise;
require('superagent-auth-bearer')(request);
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
        .timeout({
          response: 10000, // wait 10 seconds for server to start sending
          deadline: 60000, // allow one minute to finish loading
        })
        .end(function (err, res) {
          if (err || !res.ok) {
            reject({"error": err, "res": res});
          } else {
            resolve(res);
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
            reject({"error": err, "res": res});
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
            var responsetext = "";
            if (res.text) {
              responsetext = JSON.parse(res.text);
            }
            var msg = responsetext.error || err;
            reject({"error": msg, "res": res});
          } else {
            resolve(res.body);
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
            reject({"error": err, "res": res});
          } else {
            resolve(res.header);
          }
        });
    });
  },

}

module.exports = Api;
