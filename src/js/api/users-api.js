import axios from 'axios';

import { getToken } from '../auth';
import { commonRequestConfig } from './general-api';

const Api = {
  postLogin: (url, userData) => {
    const { email: username, password, stayLoggedIn, ...remainder } = userData;
    let body = { stayLoggedIn };
    if (remainder.hasOwnProperty('token2fa')) {
      body = { stayLoggedIn, token2fa: remainder.token2fa };
    }
    return axios.post(url, body, { ...commonRequestConfig, auth: { username, password } }).then(res => ({ text: res.data, code: res.status }));
  },
  putVerifyTFA: (url, userData) => {
    let body = {};
    if (userData.hasOwnProperty('token2fa')) {
      body = { token2fa: userData.token2fa };
    }
    return axios.put(url, body, { ...commonRequestConfig, headers: { ...commonRequestConfig.headers, Authorization: `Bearer ${getToken()}` } });
  }
};

export default Api;
