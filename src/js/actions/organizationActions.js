import Cookies from 'universal-cookie';

import { setSnackbar } from './appActions';
import Api from '../api/general-api';

const cookies = new Cookies();
const apiUrl = '/api/management/v2';
const tenantadmApiUrl = `${apiUrl}/tenantadm`;

export const cancelRequest = (tenantId, reason) => () => Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/cancel`, { reason: reason });
export const createOrganizationTrial = data => dispatch =>
  Api.postUnauthorized(`${tenantadmApiUrl}/tenants/trial`, data)
    .catch(err => {
      if (err.response.status >= 400 && err.response.status < 500) {
        dispatch(setSnackbar(err.response.data.error, 5000, ''));
      }
    })
    .then(res => {
      cookies.set('JWT', res.text, { maxAge: 900 });
      cookies.remove('oauth');
      cookies.remove('externalID');
      cookies.remove('email');
      return Promise.resolve(res);
    });

export const startUpgrade = tenantId => () => Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/upgrade/start`);
export const cancelUpgrade = tenantId => () => Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/upgrade/cancel`);
export const completeUpgrade = (tenantId, plan) => () => Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/upgrade/complete`, { plan: plan });
