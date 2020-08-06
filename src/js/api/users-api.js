import Cookies from 'universal-cookie';
import * as request from 'axios';

const cookies = new Cookies();

const errorHandler = err =>
  Promise.reject({ error: { text: err.response ? JSON.parse(err.response.text) : err, code: err.response.status }, res: err.response });

const Api = {
  postLogin: (url, userData) => {
    let body = {};
    if (userData.hasOwnProperty('token2fa')) {
      body = { token2fa: userData.token2fa };
    }
    return request
      .post(url, body, { auth: { username: userData.email, password: userData.password } })
      .then(res => ({ text: res.data, code: res.status }))
      .catch(errorHandler);
  },
  putVerifyTFA: (url, userData) => {
    var token = cookies.get('JWT');
    let body = {};
    if (userData.hasOwnProperty('token2fa')) {
      body = { token2fa: userData.token2fa };
    }
    return request
      .put(url, body, { headers: { Authentication: `Bearer ${token}` } })
      .then(res => ({ text: res.data, code: res.status }))
      .catch(errorHandler);
  }
};

export default Api;
