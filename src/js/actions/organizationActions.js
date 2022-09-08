import Cookies from 'universal-cookie';

import Api, { apiUrl, headerNames } from '../api/general-api';
import { SORTING_OPTIONS } from '../constants/appConstants';
import { DEVICE_LIST_DEFAULTS } from '../constants/deviceConstants';
import OrganizationConstants from '../constants/organizationConstants';
import { deepCompare } from '../helpers';
import { getTenantCapabilities } from '../selectors';
import { commonErrorFallback, commonErrorHandler, setSnackbar } from './appActions';
import { iotManagerBaseURL } from './deviceActions';

const cookies = new Cookies();
export const auditLogsApiUrl = `${apiUrl.v1}/auditlogs`;
export const tenantadmApiUrlv1 = `${apiUrl.v1}/tenantadm`;
export const tenantadmApiUrlv2 = `${apiUrl.v2}/tenantadm`;
export const samlIdpApiUrlv1 = `${apiUrl.v1}/useradm/sso/idp/metadata`;
export const samlSpApiUrlv1 = `${apiUrl.v1}/useradm/sso/sp/metadata`;

const { page: defaultPage, perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;

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

const prepareAuditlogQuery = ({ startDate, endDate, user: userFilter, type, detail: detailFilter, sort = {} }) => {
  const userId = userFilter?.id || userFilter;
  const detail = detailFilter?.id || detailFilter;
  const createdAfter = endDate ? `&created_after=${Math.round(Date.parse(startDate) / 1000)}` : '';
  const createdBefore = startDate ? `&created_before=${Math.round(Date.parse(endDate) / 1000)}` : '';
  const typeSearch = type ? `&object_type=${type.value}`.toLowerCase() : '';
  const userSearch = userId ? `&actor_id=${userId}` : '';
  const objectSearch = type && detail ? `&${type.queryParameter}=${encodeURIComponent(detail)}` : '';
  const { direction = SORTING_OPTIONS.desc } = sort;
  return `${createdAfter}${createdBefore}${userSearch}${typeSearch}${objectSearch}&sort=${direction}`;
};

export const getAuditLogs = selectionState => (dispatch, getState) => {
  const { page, perPage } = selectionState;
  const { hasAuditlogs } = getTenantCapabilities(getState());
  if (!hasAuditlogs) {
    return Promise.resolve();
  }
  return Api.get(`${auditLogsApiUrl}/logs?page=${page}&per_page=${perPage}${prepareAuditlogQuery(selectionState)}`)
    .then(res => {
      let total = res.headers[headerNames.total];
      total = Number(total || res.data.length);
      return Promise.resolve(dispatch({ type: OrganizationConstants.RECEIVE_AUDIT_LOGS, events: res.data, total }));
    })
    .catch(err => commonErrorHandler(err, `There was an error retrieving audit logs:`, dispatch));
};

export const getAuditLogsCsvLink = () => (dispatch, getState) =>
  Promise.resolve(`${auditLogsApiUrl}/logs/export?limit=20000${prepareAuditlogQuery(getState().organization.auditlog.selectionState)}`);

export const setAuditlogsState = selectionState => (dispatch, getState) => {
  const currentState = getState().organization.auditlog.selectionState;
  let nextState = {
    ...currentState,
    ...selectionState,
    sort: { ...currentState.sort, ...selectionState.sort }
  };
  let tasks = [];
  // eslint-disable-next-line no-unused-vars
  const { isLoading: currentLoading, selectedIssue: currentIssue, ...currentRequestState } = currentState;
  // eslint-disable-next-line no-unused-vars
  const { isLoading: selectionLoading, selectedIssue: selectionIssue, ...selectionRequestState } = nextState;
  if (!deepCompare(currentRequestState, selectionRequestState)) {
    nextState.isLoading = true;
    tasks.push(dispatch(getAuditLogs(nextState)).finally(() => dispatch(setAuditlogsState({ isLoading: false }))));
  }
  tasks.push(dispatch({ type: OrganizationConstants.SET_AUDITLOG_STATE, state: nextState }));
  return Promise.all(tasks);
};

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

export const createIntegration = integration => dispatch => {
  // eslint-disable-next-line no-unused-vars
  const { credentials, id, provider, ...remainder } = integration;
  return Api.post(`${iotManagerBaseURL}/integrations`, { provider, credentials, ...remainder })
    .catch(err => commonErrorHandler(err, 'There was an error creating the integration', dispatch, commonErrorFallback))
    .then(() => Promise.all([dispatch(setSnackbar('The integration was set up successfully')), dispatch(getIntegrations())]));
};

export const changeIntegration = integration => dispatch =>
  Api.put(`${iotManagerBaseURL}/integrations/${integration.id}/credentials`, integration.credentials)
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

export const getWebhookEvents =
  (config = {}) =>
  dispatch => {
    const { page = defaultPage, perPage = defaultPerPage } = config;
    return Api.get(`${iotManagerBaseURL}/events?page=${page}&per_page=${perPage}`)
      .catch(err => commonErrorHandler(err, 'There was an error retrieving activity for this integration', dispatch, commonErrorFallback))
      .then(({ data }) => Promise.resolve(dispatch({ type: OrganizationConstants.RECEIVE_WEBHOOK_EVENTS, value: data })));
  };

const samlConfigActions = {
  create: { success: 'stored', error: 'storing' },
  edit: { success: 'updated', error: 'updating' },
  read: { success: '', error: 'retrieving' },
  remove: { success: 'removed', error: 'removing' }
};

const samlConfigActionErrorHandler = (err, type) => dispatch =>
  commonErrorHandler(err, `There was an error ${samlConfigActions[type].error} the SAML configuration.`, dispatch, commonErrorFallback);

const samlConfigActionSuccessHandler = type => dispatch => dispatch(setSnackbar(`The SAML configuration was ${samlConfigActions[type].success} successfully`));

export const storeSamlConfig = config => dispatch =>
  Api.post(samlIdpApiUrlv1, config, { headers: { 'Content-Type': 'application/samlmetadata+xml', Accept: 'application/json' } })
    .catch(err => dispatch(samlConfigActionErrorHandler(err, 'create')))
    .then(() => Promise.all([dispatch(samlConfigActionSuccessHandler('create')), dispatch(getSamlConfigs())]));

export const changeSamlConfig =
  ({ id, config }) =>
  dispatch =>
    Api.put(`${samlIdpApiUrlv1}/${id}`, config, { headers: { 'Content-Type': 'application/samlmetadata+xml', Accept: 'application/json' } })
      .catch(err => dispatch(samlConfigActionErrorHandler(err, 'edit')))
      .then(() => Promise.all([dispatch(samlConfigActionSuccessHandler('edit')), dispatch(getSamlConfigs())]));

export const deleteSamlConfig =
  ({ id }) =>
  (dispatch, getState) =>
    Api.delete(`${samlIdpApiUrlv1}/${id}`)
      .catch(err => dispatch(samlConfigActionErrorHandler(err, 'remove')))
      .then(() => {
        const configs = getState().organization.samlConfigs.filter(item => id !== item.id);
        return Promise.all([
          dispatch(samlConfigActionSuccessHandler('remove')),
          dispatch({ type: OrganizationConstants.RECEIVE_SAML_CONFIGS, value: configs })
        ]);
      });

const getSamlConfigById = config => dispatch =>
  Api.get(`${samlSpApiUrlv1}/${config.id}`)
    .catch(err => dispatch(samlConfigActionErrorHandler(err, 'read')))
    .then(({ data }) => Promise.resolve({ ...config, config: data }));

export const getSamlConfigs = () => dispatch =>
  Api.get(samlIdpApiUrlv1)
    .catch(err => commonErrorHandler(err, 'There was an error retrieving SAML configurations', dispatch, commonErrorFallback))
    .then(({ data }) =>
      Promise.all(data.map(config => Promise.resolve(dispatch(getSamlConfigById(config))))).then(configs => {
        return dispatch({ type: OrganizationConstants.RECEIVE_SAML_CONFIGS, value: configs });
      })
    );
