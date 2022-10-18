import axios from 'axios';

import { getToken } from '../auth';
import { commonRequestConfig } from './general-api';

const Api = {
  postLogin: (url, userData) => {
    let body = {};
    if (userData.hasOwnProperty('token2fa')) {
      body = { token2fa: userData.token2fa };
    }
    return axios
      .post(url, body, { ...commonRequestConfig, auth: { username: userData.email, password: userData.password } })
      .then(res => ({ text: res.data, code: res.status }));
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
