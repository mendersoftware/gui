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
    const token = cookies.get('JWT');
    return new Promise((resolve, reject) => {
      request
        .get(url)
        .auth(token, { type: 'bearer' })
        .timeout({
          response: 10000, // wait 10 seconds for server to start sending
          deadline: 60000 // allow one minute to finish loading
        })
        .end((error, res) => endHandler(error, res, reject, resolve));
    });
  },
  delete: url => {
    const token = cookies.get('JWT');
    return new Promise((resolve, reject) =>
      request
        .del(url)
        .auth(token, { type: 'bearer' })
        .end((error, res) => endHandler(error, res, reject, resolve))
    );
  },
  post: (url, data) => {
    const token = cookies.get('JWT');
    return new Promise((resolve, reject) =>
      request
        .post(url)
        .auth(token, { type: 'bearer' })
        .set('Content-Type', 'application/json')
        .send(data)
        .end((error, res) => endHandler(error, res, reject, resolve))
    );
  },
  postUnauthorized: (url, data) =>
    new Promise((resolve, reject) =>
      request
        .post(url)
        .set('Content-Type', 'application/json')
        .send(data)
        .end((error, res) => endHandler(error, res, reject, resolve))
    ),
  put: (url, data) => {
    const token = cookies.get('JWT');
    return new Promise((resolve, reject) =>
      request
        .put(url)
        .auth(token, { type: 'bearer' })
        .set('Content-Type', 'application/json')
        .send(data)
        .end((error, res) => endHandler(error, res, reject, resolve))
    );
  },
  upload: (url, formData, progress) => {
    const token = cookies.get('JWT');
    return new Promise((resolve, reject) =>
      request
        .post(url)
        .auth(token, { type: 'bearer' })
        .send(formData)
        .on('progress', progress)
        .end((error, res) => endHandler(error, res, reject, resolve))
    );
  }
};

export default Api;
