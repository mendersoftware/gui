var request = require('superagent-use')(require('superagent'));
require('superagent-auth-bearer')(request);
var Promise = require('es6-promise').Promise;
import auth from '../auth';

request.use(auth.unauthorizedRedirect);

var Api = {
  get: function(url) {
    return new Promise(function (resolve, reject) {
      request
        .get(url)
        .end(function (err, res) {
          if (err || !res.ok) {
            reject(err);
          } else {
            resolve(res.body);
          }
        });
    });
  },
  postWithToken: function(url, userData, token) {
    return new Promise(function (resolve, reject) {
      request
        .post(url)
        .authBearer(token)
        .send(userData)
        .end(function (err, res) {
          if (err || !res.ok) {
            var errorResponse = err.response ? JSON.parse(err.response.text) : {error:"Oops! Something went wrong"};
            reject(errorResponse);
          } else {
            resolve(res);
          }
        });
    });
  },
  postEmpty: function(url) {
    return new Promise(function (resolve, reject) {
      request
        .post(url)
        .send()
        .end(function (err, res) {
          // successfully returned token as raw response throws err rather than parsed response, so check for 200 status code
          if (err.statusCode !== 200) {
            reject(err);
          } else {
            var rawResponse = err.rawResponse;
            resolve(rawResponse);
          }
        });
    });
  },
  post: function(url, userData) {
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
}

module.exports = Api;