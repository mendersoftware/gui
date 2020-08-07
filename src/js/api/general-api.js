import axios from 'axios';

import { getToken, logout } from '../auth';

export const headerNames = {
  link: 'link',
  location: 'location',
  total: 'x-total-count'
};

const unauthorizedRedirect = error => {
  if (error.response.status === 401) {
    logout();
  }
  return Promise.reject(error);
};

export const commonRequestConfig = { timeout: 10000, headers: { 'Content-Type': 'application/json' } };

export const authenticatedRequest = axios.create(commonRequestConfig);
authenticatedRequest.interceptors.response.use(res => res, unauthorizedRedirect);
authenticatedRequest.interceptors.request.use(
  config => ({ ...config, headers: { ...config.headers, Authorization: `Bearer ${getToken()}` } }),
  error => Promise.reject(error)
);

const errorHandler = error => {
  if (error.response && error.response.status == 403) {
    error.response.data.error = error.response.data.error.message;
  }
  return Promise.reject(error);
};

const Api = {
  get: url => authenticatedRequest.get(url).catch(errorHandler),
  delete: (url, data) => authenticatedRequest.request({ method: 'delete', url, data }).catch(errorHandler),
  patch: (url, data) => authenticatedRequest.patch(url, data).catch(errorHandler),
  post: (url, data) => authenticatedRequest.post(url, data).catch(errorHandler),
  postUnauthorized: (url, data) => axios.post(url, data, commonRequestConfig).catch(errorHandler),
  put: (url, data) => authenticatedRequest.put(url, data).catch(errorHandler),
  upload: (url, formData, progress) => authenticatedRequest.post(url, formData, { onUploadProgress: progress, timeout: 0 }).catch(errorHandler)
};

export default Api;
