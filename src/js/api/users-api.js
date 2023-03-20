import axios from 'axios';

import { getToken } from '../auth';
import { commonRequestConfig } from './general-api';

const Api = {
  postLogin: (url, { email: username, password, ...body }) =>
    axios.post(url, body, { ...commonRequestConfig, auth: { username, password } }).then(res => ({ text: res.data, code: res.status })),
  putVerifyTFA: (url, userData) => {
    let body = {};
    if (userData.hasOwnProperty('token2fa')) {
      body = { token2fa: userData.token2fa };
    }
    return axios.put(url, body, { ...commonRequestConfig, headers: { ...commonRequestConfig.headers, Authorization: `Bearer ${getToken()}` } });
  }
};

export default Api;
