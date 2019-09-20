var request = require('superagent-use')(require('superagent'));
import cookie from 'react-cookie';
import { unauthorizedRedirect } from '../auth';

request.use(unauthorizedRedirect);

const Api = {
  get: url => {
    var token = cookie.load('JWT');
    return new Promise((resolve, reject) => {
      request
        .get(url)
        .authBearer(token)
        .timeout({
          response: 10000, // wait 10 seconds for server to start sending
          deadline: 60000 // allow one minute to finish loading
        })
        .end((err, res) => {
          if (err || !res.ok) {
            reject({ error: err, res: res });
          } else {
            resolve(res.body);
          }
        });
    });
  },
  postFormData: (url, formData, progress) => {
    var token = cookie.load('JWT');
    return new Promise((resolve, reject) => {
      request
        .post(url)
        .authBearer(token)
        .send(formData)
        .on('progress', progress)
        .end((err, res) => {
          if (err || !res.ok) {
            var errorResponse = err.response ? JSON.parse(err.response.text) : { error: 'There was an error uploading the artifact' };
            reject({ error: errorResponse, res: res });
          } else {
            resolve(res.body);
          }
        });
    });
  },
  putJSON: (url, data) => {
    var token = cookie.load('JWT');
    return new Promise((resolve, reject) => {
      request
        .put(url)
        .authBearer(token)
        .set('Content-Type', 'application/json')
        .send(data)
        .end((err, res) => {
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
  delete: url => {
    var token = cookie.load('JWT');
    return new Promise((resolve, reject) => {
      request
        .del(url)
        .authBearer(token)
        .end((err, res) => {
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

export default Api;
