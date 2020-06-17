import Cookies from 'universal-cookie';
import { unauthorizedRedirect } from '../auth';
const cookies = new Cookies();
var request = require('superagent')
  .agent()
  .use(unauthorizedRedirect);

export const headerNames = {
  link: 'link',
  location: 'location',
  total: 'x-total-count'
};

const endHandler = (error, res, reject, resolve) => {
  if (error || !res.ok) {
    if (res && res.statusCode == 403) {
      res.body.error = res.body.error.message;
    }
    return reject({ error, res });
  }
  return resolve(res);
}

const Api = {
  get: url => {
    var token = cookies.get('JWT');
    return new Promise((resolve, reject) => {
      request
        .get(url)
        .auth(token, { type: 'bearer' })
        .timeout({
          response: 10000, // wait 10 seconds for server to start sending
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

  getNoauth: url => {
    return new Promise((resolve, reject) => {
      request
        .get(url)
        .timeout({
          response: 10000, // wait 10 seconds for server to start sending
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
  }
};

export default Api;
