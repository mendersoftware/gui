import Cookies from 'universal-cookie';

import { setSnackbar } from './appActions';
import Api from '../api/general-api';
import OrganizationConstants from '../constants/organizationConstants';
import { preformatWithRequestID } from '../helpers';

const cookies = new Cookies();
const apiUrlv1 = '/api/management/v1';
const apiUrlv2 = '/api/management/v2';
const auditLogsApiUrl = `${apiUrlv1}/auditlogs`;
const tenantadmApiUrl = `${apiUrlv2}/tenantadm`;

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
      cookies.set('JWT', res.text, { maxAge: 900, sameSite: 'strict' });
      cookies.remove('oauth');
      cookies.remove('externalID');
      cookies.remove('email');
      return Promise.resolve(res);
    });

export const startUpgrade = tenantId => dispatch =>
  Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/upgrade/start`).catch(err => {
    dispatch(setSnackbar(preformatWithRequestID(err.response, err.response.data?.error.message), null, 'Copy to clipboard'));
    return Promise.reject(err);
  });
export const cancelUpgrade = tenantId => () => Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/upgrade/cancel`);
export const completeUpgrade = (tenantId, plan) => dispatch =>
  Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/upgrade/complete`, { plan: plan }).catch(err => {
    dispatch(setSnackbar(preformatWithRequestID(err.response, `There was an error upgrading your account. ${err.response.data.error}`)));
    return Promise.reject(err);
  });

export const getAuditLogs = (page, perPage, startDate, endDate, type, userId, sort = 'desc') => dispatch => {
  const created_after = startDate ? `&created_after=${Math.round(Date.parse(startDate) / 1000)}` : '';
  const created_before = endDate ? `&created_before=${Math.round(Date.parse(endDate) / 1000)}` : '';
  const typeSearch = type ? `&object_type=${type}` : '';
  const userSearch = type ? `&actor_id=${userId}` : '';
  return Api.get(`${auditLogsApiUrl}/logs?page=${page}&per_page=${perPage}${created_after}${created_before}${userSearch}${typeSearch}&sort=${sort}`)
    .then(({ data: events }) => {
      return Promise.resolve(dispatch({ type: OrganizationConstants.RECEIVE_AUDIT_LOGS, events }));
    })
    .catch(err => {
      dispatch(setSnackbar(preformatWithRequestID(err.response, err.response.data.error.message), null, 'Copy to clipboard'));
      return Promise.reject(err);
    });
};
