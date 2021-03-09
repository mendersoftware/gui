import Cookies from 'universal-cookie';

import { commonErrorHandler, setSnackbar } from './appActions';
import Api, { headerNames } from '../api/general-api';
import OrganizationConstants from '../constants/organizationConstants';

const cookies = new Cookies();
const apiUrlv1 = '/api/management/v1';
const apiUrlv2 = '/api/management/v2';
export const auditLogsApiUrl = `${apiUrlv1}/auditlogs`;
export const tenantadmApiUrlv1 = `${apiUrlv1}/tenantadm`;
export const tenantadmApiUrlv2 = `${apiUrlv2}/tenantadm`;

export const cancelRequest = (tenantId, reason) => dispatch =>
  Api.post(`${tenantadmApiUrlv2}/tenants/${tenantId}/cancel`, { reason: reason }).then(() =>
    Promise.resolve(dispatch(setSnackbar('Deactivation request was sent successfully', 5000, '')))
  );

export const createOrganizationTrial = data => dispatch =>
  Api.postUnauthorized(`${tenantadmApiUrlv2}/tenants/trial`, data)
    .catch(err => {
      if (err.response.status >= 400 && err.response.status < 500) {
        dispatch(setSnackbar(err.response.data.error, 5000, ''));
        return Promise.reject(err);
      }
    })
    .then(res => {
      cookies.set('JWT', res.text, { maxAge: 900, sameSite: 'strict', path: '/' });
      cookies.remove('oauth');
      cookies.remove('externalID');
      cookies.remove('email');
      return Promise.resolve(res);
    });

export const startCardUpdate = () => dispatch =>
  Api.post(`${tenantadmApiUrlv2}/billing/card`)
    .then(res => {
      dispatch({
        type: OrganizationConstants.RECEIVE_SETUP_INTENT,
        intentId: res.data.intent_id
      });
      return Promise.resolve(res.data.secret);
    })
    .catch(err => commonErrorHandler(err, `Updating the card failed:`, dispatch));

export const confirmCardUpdate = () => (dispatch, getState) =>
  Api.post(`${tenantadmApiUrlv2}/billing/card/${getState().organization.intentId}/confirm`)
    .then(() =>
      Promise.all([
        dispatch(setSnackbar('Payment card was updated successfully')),
        dispatch({
          type: OrganizationConstants.RECEIVE_SETUP_INTENT,
          intentId: null
        })
      ])
    )
    .catch(err => commonErrorHandler(err, `Updating the card failed:`, dispatch));

export const getCurrentCard = () => dispatch =>
  Api.get(`${tenantadmApiUrlv2}/billing`).then(res => {
    const { last4, exp_month, exp_year, brand } = res.data.card || {};
    return Promise.resolve(
      dispatch({
        type: OrganizationConstants.RECEIVE_CURRENT_CARD,
        card: {
          brand,
          last4,
          expiration: { month: exp_month, year: exp_year }
        }
      })
    );
  });

export const startUpgrade = tenantId => dispatch =>
  Api.post(`${tenantadmApiUrlv2}/tenants/${tenantId}/upgrade/start`)
    .then(({ data }) => Promise.resolve(data.secret))
    .catch(err => commonErrorHandler(err, `There was an error upgrading your account:`, dispatch));

export const cancelUpgrade = tenantId => () => Api.post(`${tenantadmApiUrlv2}/tenants/${tenantId}/upgrade/cancel`);

export const completeUpgrade = (tenantId, plan) => dispatch =>
  Api.post(`${tenantadmApiUrlv2}/tenants/${tenantId}/upgrade/complete`, { plan: plan }).catch(err =>
    commonErrorHandler(err, `There was an error upgrading your account:`, dispatch)
  );

export const getAuditLogs = (page, perPage, startDate, endDate, userId, type, detail, sort = 'desc') => dispatch => {
  const createdAfter = startDate ? `&created_after=${Math.round(Date.parse(startDate) / 1000)}` : '';
  const createdBefore = endDate ? `&created_before=${Math.round(Date.parse(endDate) / 1000)}` : '';
  const typeSearch = type ? `&object_type=${type}` : '';
  const userSearch = userId ? `&actor_id=${userId}` : '';
  const queryParameter = type && detail ? OrganizationConstants.AUDIT_LOGS_TYPES.find(typeObject => typeObject.value === type).queryParameter : '';
  const objectSearch = detail ? `&${queryParameter}=${encodeURIComponent(detail)}` : '';
  return Api.get(
    `${auditLogsApiUrl}/logs?page=${page}&per_page=${perPage}${createdAfter}${createdBefore}${userSearch}${typeSearch}${objectSearch}&sort=${sort}`
  )
    .then(res => {
      const total = Number(res.headers[headerNames.total]);
      return Promise.resolve(dispatch({ type: OrganizationConstants.RECEIVE_AUDIT_LOGS, events: res.data, total }));
    })
    .catch(err => commonErrorHandler(err, `There was an error retrieving audit logs:`, dispatch));
};

export const getAuditLogsCsvLink = (startDate, endDate, userId, type, detail, sort = 'desc') => () => {
  const createdAfter = endDate ? `&created_after=${Math.round(Date.parse(endDate) / 1000)}` : '';
  const createdBefore = startDate ? `&created_before=${Math.round(Date.parse(startDate) / 1000)}` : '';
  const typeSearch = type ? `&object_type=${type}` : '';
  const userSearch = userId ? `&actor_id=${userId}` : '';
  const objectSearch = detail ? `&object_id=${encodeURIComponent(detail)}` : '';
  return Promise.resolve(`${auditLogsApiUrl}/logs/export?limit=20000${createdAfter}${createdBefore}${userSearch}${typeSearch}${objectSearch}&sort=${sort}`);
};

/*
  Tenant management + Hosted Mender
*/
export const getUserOrganization = () => dispatch =>
  Api.get(`${tenantadmApiUrlv1}/user/tenant`).then(res => Promise.resolve(dispatch({ type: OrganizationConstants.SET_ORGANIZATION, organization: res.data })));
