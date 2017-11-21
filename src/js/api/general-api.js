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
}

module.exports = Api;
