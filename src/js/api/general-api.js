import axios from 'axios';

import { getToken, logout } from '../auth';

export const headerNames = {
  link: 'link',
  location: 'location',
  total: 'x-total-count'
};

const unauthorizedRedirect = error => (error.response.status === 401 ? logout() : null);

axios.interceptors.response.use(res => res, unauthorizedRedirect);
export const authenticatedRequest = axios.create({ timeout: 10000 });
authenticatedRequest.interceptors.response.use(res => res, unauthorizedRedirect);
authenticatedRequest.interceptors.request.use(
  config => ({ ...config, headers: { ...config.headers, Authorization: `Bearer ${getToken()}` } }),
  error => Promise.reject(error)
);

const errorHandler = error => {
  if (error.response && error.response.status == 403) {
    error.response.data.error = error.response.data.error.message;
  }
  return Promise.reject({ error, res: error.response });
};

const Api = {
  get: url => authenticatedRequest.get(url).catch(errorHandler),
  delete: (url, data) => authenticatedRequest.request({ method: 'delete', url, data }).catch(errorHandler),
  patch: (url, data) => authenticatedRequest.patch(url, data).catch(errorHandler),
  post: (url, data) => authenticatedRequest.post(url, data).catch(errorHandler),
  postUnauthorized: (url, data) => axios.post(url, data).catch(errorHandler),
  put: (url, data) => authenticatedRequest.put(url, data).catch(errorHandler),
  upload: (url, formData, progress) => authenticatedRequest.post(url, formData, { onUploadProgress: progress }).catch(errorHandler)
};

export default Api;
