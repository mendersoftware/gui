import Cookies from 'universal-cookie';
import { unauthorizedRedirect } from '../auth';
const cookies = new Cookies();
var request = require('superagent')
  .agent()
  .use(unauthorizedRedirect);

export const headerNames = {
  total: 'x-total-count'
};

const Api = {
  get: url => {
    var token = cookies.get('JWT');
    return new Promise((resolve, reject) => {
      request
        .get(url)
        .auth(token, { type: 'bearer' })
        .timeout({
          response: 30000, // wait 10 seconds for server to start sending
          deadline: 60000 // allow one minute to finish loading
        })
        .end((err, res) => {
          if (err || !res.ok) {
            reject({ error: err, res: res });
          } else {
            resolve(res);
          }
        });
    });
  },
  getText: url => {
    var token = cookies.get('JWT');
    return new Promise((resolve, reject) => {
      request
        .get(url)
        .auth(token, { type: 'bearer' })
        .set('Content-Type', 'application/text')
        .end((err, res) => {
          if (err || !res.ok) {
            reject({ error: err, res: res });
          } else {
            resolve(res.text);
          }
        });
    });
  },
  post: (url, data) => {
    var token = cookies.get('JWT');
    return new Promise((resolve, reject) => {
      request
        .post(url)
        .auth(token, { type: 'bearer' })
        .set('Content-Type', 'application/json')
        .send(data)
        .end((err, res) => {
          if (err || !res.ok) {
            reject({ error: err, res: res });
          } else {
            resolve(res.header);
          }
        });
    });
  },
  put: (url, data) => {
    var token = cookies.get('JWT');
    return new Promise((resolve, reject) => {
      request
        .put(url)
        .auth(token, { type: 'bearer' })
        .set('Content-Type', 'application/json')
        .send(data)
        .end((err, res) => {
          if (err || !res.ok) {
            reject({ error: err, res: res });
          } else {
            resolve(res.body);
          }
        });
    });
  }
};

export default Api;
