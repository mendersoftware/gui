var request = require('superagent-use')(require('superagent'));
var Promise = require('es6-promise').Promise;
import cookie from 'react-cookie';
import { unauthorizedRedirect } from '../auth';

request.use(unauthorizedRedirect);

var Api = {
  get: function(url) {
    var token = cookie.load('JWT');
    return new Promise(function(resolve, reject) {
      request
        .get(url)
        .authBearer(token)
        .timeout({
          response: 10000, // wait 10 seconds for server to start sending
          deadline: 60000 // allow one minute to finish loading
        })
        .end(function(err, res) {
          if (err || !res.ok) {
            reject({ error: err, res: res });
          } else {
            resolve(res.body);
          }
        });
    });
  },
  postFormData: function(url, formData, progress) {
    var token = cookie.load('JWT');
    return new Promise(function(resolve, reject) {
      request
        .post(url)
        .authBearer(token)
        .send(formData)
        .on('progress', progress)
        .end(function(err, res) {
          if (err || !res.ok) {
            var errorResponse = err.response ? JSON.parse(err.response.text) : { error: 'There was an error uploading the artifact' };
            reject({ error: errorResponse, res: res });
          } else {
            resolve(res.body);
          }
        });
    });
  },
  putJSON: function(url, data) {
    var token = cookie.load('JWT');
    return new Promise(function(resolve, reject) {
      request
        .put(url)
        .authBearer(token)
        .set('Content-Type', 'application/json')
        .send(data)
        .end(function(err, res) {
          if (err || !res.ok) {
            reject({ error: err, res: res });
          } else {
            var responsetext = '';
            if (res.text) {
              responsetext = JSON.parse(res.text);
            }
            resolve(responsetext);
          }
        });
    });
  },
  delete: function(url) {
    var token = cookie.load('JWT');
    return new Promise(function(resolve, reject) {
      request
        .del(url)
        .authBearer(token)
        .end(function(err, res) {
          if (err || !res.ok) {
            var errorResponse = err.response ? JSON.parse(err.response.text) : { error: 'There was an error removing the artifact' };
            reject({ error: errorResponse, res: res });
          } else {
            resolve(res.header);
          }
        });
    });
  }
};

module.exports = Api;
