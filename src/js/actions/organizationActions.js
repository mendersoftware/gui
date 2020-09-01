import Cookies from 'universal-cookie';

import { setSnackbar } from './appActions';
import Api from '../api/general-api';
import { preformatWithRequestID } from '../helpers';

const cookies = new Cookies();
const apiUrl = '/api/management/v2';
const tenantadmApiUrl = `${apiUrl}/tenantadm`;

export const cancelRequest = (tenantId, reason) => dispatch =>
  Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/cancel`, { reason: reason }).then(() =>
    Promise.resolve(dispatch(setSnackbar('Deactivation request was sent successfully', 5000, '')))
  );

export const createOrganizationTrial = data => dispatch =>
  Api.postUnauthorized(`${tenantadmApiUrl}/tenants/trial`, data)
    .catch(err => {
      if (err.response.status >= 400 && err.response.status < 500) {
        dispatch(setSnackbar(err.response.data.error, 5000, ''));
        return Promise.reject(err);
      }
    })
    .then(res => {
      cookies.set('JWT', res.text, { maxAge: 900 });
      cookies.remove('oauth');
      cookies.remove('externalID');
      cookies.remove('email');
      return Promise.resolve(res);
    });

export const startUpgrade = tenantId => dispatch =>
  Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/upgrade/start`).catch(err => {
    dispatch(setSnackbar(preformatWithRequestID(err.response, err.response.data.error), null, 'Copy to clipboard'));
    return Promise.reject(err);
  });
export const cancelUpgrade = tenantId => () => Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/upgrade/cancel`);
export const completeUpgrade = (tenantId, plan) => dispatch =>
  Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/upgrade/complete`, { plan: plan }).catch(err => {
    dispatch(setSnackbar(preformatWithRequestID(err.response, `There was an error upgrading your account. ${err.response.data.error}`)));
    return Promise.reject(err);
  });
