import Cookies from 'universal-cookie';

import Api, { apiUrl, headerNames } from '../api/general-api';
import { SORTING_OPTIONS } from '../constants/appConstants';
import { EXTERNAL_PROVIDER } from '../constants/deviceConstants';
import OrganizationConstants from '../constants/organizationConstants';
import { getTenantCapabilities } from '../selectors';
import { commonErrorFallback, commonErrorHandler, setSnackbar } from './appActions';
import { iotManagerBaseURL } from './deviceActions';

const cookies = new Cookies();
export const auditLogsApiUrl = `${apiUrl.v1}/auditlogs`;
export const tenantadmApiUrlv1 = `${apiUrl.v1}/tenantadm`;
export const tenantadmApiUrlv2 = `${apiUrl.v2}/tenantadm`;

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
      if (res.text) {
        cookies.set('JWT', res.text, { maxAge: 900, sameSite: 'strict', secure: true, path: '/' });
      }
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
  Api.post(`${tenantadmApiUrlv2}/tenants/${tenantId}/upgrade/complete`, { plan })
    .catch(err => commonErrorHandler(err, `There was an error upgrading your account:`, dispatch))
    .then(() => Promise.resolve(dispatch(getUserOrganization())));

export const getAuditLogs =
  (page, perPage, startDate, endDate, userId, type, detail, sort = SORTING_OPTIONS.desc) =>
  (dispatch, getState) => {
    const { hasAuditlogs } = getTenantCapabilities(getState());
    if (!hasAuditlogs) {
      return Promise.resolve();
    }
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
        let total = res.headers[headerNames.total];
        total = Number(total || res.data.length);
        return Promise.resolve(dispatch({ type: OrganizationConstants.RECEIVE_AUDIT_LOGS, events: res.data, total }));
      })
      .catch(err => commonErrorHandler(err, `There was an error retrieving audit logs:`, dispatch));
  };

export const getAuditLogsCsvLink =
  (startDate, endDate, userId, type, detail, sort = SORTING_OPTIONS.desc) =>
  () => {
    const createdAfter = endDate ? `&created_after=${Math.round(Date.parse(startDate) / 1000)}` : '';
    const createdBefore = startDate ? `&created_before=${Math.round(Date.parse(endDate) / 1000)}` : '';
    const typeSearch = type ? `&object_type=${type}` : '';
    const userSearch = userId ? `&actor_id=${userId}` : '';
    const objectSearch = detail ? `&object_id=${encodeURIComponent(detail)}` : '';
    return Promise.resolve(`${auditLogsApiUrl}/logs/export?limit=20000${createdAfter}${createdBefore}${userSearch}${typeSearch}${objectSearch}&sort=${sort}`);
  };

export const setAuditlogsState = selectionState => (dispatch, getState) =>
  Promise.resolve(
    dispatch({ type: OrganizationConstants.SET_AUDITLOG_STATE, state: { ...getState().organization.auditlog.selectionState, ...selectionState } })
  );

/*
  Tenant management + Hosted Mender
*/
export const getUserOrganization = () => dispatch =>
  Api.get(`${tenantadmApiUrlv1}/user/tenant`).then(res => Promise.resolve(dispatch({ type: OrganizationConstants.SET_ORGANIZATION, organization: res.data })));

export const sendSupportMessage = content => dispatch =>
  Api.post(`${tenantadmApiUrlv2}/contact/support`, content)
    .catch(err => commonErrorHandler(err, 'There was an error sending your request', dispatch, commonErrorFallback))
    .then(() => Promise.resolve(dispatch(setSnackbar('Your request was sent successfully', 5000, ''))));

export const requestPlanChange = (tenantId, content) => dispatch =>
  Api.post(`${tenantadmApiUrlv2}/tenants/${tenantId}/plan`, content)
    .catch(err => commonErrorHandler(err, 'There was an error sending your request', dispatch, commonErrorFallback))
    .then(() => Promise.resolve(dispatch(setSnackbar('Your request was sent successfully', 5000, ''))));

export const createIntegration = integration => dispatch =>
  Api.post(`${iotManagerBaseURL}/integrations`, {
    provider: integration.provider,
    credentials: {
      type: EXTERNAL_PROVIDER[integration.provider].credentialsType,
      [EXTERNAL_PROVIDER[integration.provider].credentialsAttribute]: integration[EXTERNAL_PROVIDER[integration.provider].credentialsAttribute]
    }
  })
    .catch(err => commonErrorHandler(err, 'There was an error creating the integration', dispatch, commonErrorFallback))
    .then(() => Promise.all([dispatch(setSnackbar('The integration was set up successfully')), dispatch(getIntegrations())]));

export const changeIntegration = integration => dispatch =>
  Api.put(`${iotManagerBaseURL}/integrations/${integration.id}`, {
    provider: integration.provider,
    credentials: {
      type: EXTERNAL_PROVIDER[integration.provider].credentialsType,
      [EXTERNAL_PROVIDER[integration.provider].credentialsAttribute]: integration[EXTERNAL_PROVIDER[integration.provider].credentialsAttribute]
    }
  })
    .catch(err => commonErrorHandler(err, 'There was an error updating the integration', dispatch, commonErrorFallback))
    .then(() => Promise.all([dispatch(setSnackbar('The integration was updated successfully')), dispatch(getIntegrations())]));

export const deleteIntegration = integration => (dispatch, getState) =>
  Api.delete(`${iotManagerBaseURL}/integrations/${integration.id}`, {})
    .catch(err => commonErrorHandler(err, 'There was an error removing the integration', dispatch, commonErrorFallback))
    .then(() => {
      const integrations = getState().organization.externalDeviceIntegrations.filter(item => integration.provider !== item.provider);
      return Promise.all([
        dispatch(setSnackbar('The integration was removed successfully')),
        dispatch({ type: OrganizationConstants.RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS, value: integrations })
      ]);
    });

export const getIntegrations = () => (dispatch, getState) =>
  Api.get(`${iotManagerBaseURL}/integrations`)
    .catch(err => commonErrorHandler(err, 'There was an error retrieving the integration', dispatch, commonErrorFallback))
    .then(({ data }) => {
      const existingIntegrations = getState().organization.externalDeviceIntegrations;
      const integrations = data.reduce((accu, item) => {
        const existingIntegration = existingIntegrations.find(integration => item.id === integration.id) ?? {};
        const integration = { ...existingIntegration, ...item };
        accu.push(integration);
        return accu;
      }, []);
      return Promise.resolve(dispatch({ type: OrganizationConstants.RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS, value: integrations }));
    });
