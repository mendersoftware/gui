// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getCurrentSession, getTenantCapabilities } from '@store/selectors';
import { jwtDecode } from 'jwt-decode';
import hashString from 'md5';
import Cookies from 'universal-cookie';

import { actions, sliceName } from '.';
import { deepCompare } from '../../helpers';
import storeActions from '../actions';
import Api from '../api/general-api';
import { DEVICE_LIST_DEFAULTS, SORTING_OPTIONS, TIMEOUTS, deviceAuthV2, headerNames, iotManagerBaseURL, locations } from '../constants';
import { commonErrorFallback, commonErrorHandler } from '../store';
import { SSO_TYPES, auditLogsApiUrl, ssoIdpApiUrlv1, tenantadmApiUrlv1, tenantadmApiUrlv2 } from './constants';
import { getAuditlogState } from './selectors';

const cookies = new Cookies();
const { page: defaultPage, perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;

export const cancelRequest = createAsyncThunk(`${sliceName}/cancelRequest`, ({ tenantId, reason }, { dispatch }) =>
  Api.post(`${tenantadmApiUrlv2}/tenants/${tenantId}/cancel`, { reason }).then(() =>
    Promise.resolve(dispatch(storeActions.setSnackbar('Deactivation request was sent successfully', TIMEOUTS.fiveSeconds, '')))
  )
);

export const getTargetLocation = key => {
  if (devLocations.includes(window.location.hostname)) {
    return '';
  }
  let subdomainSections = window.location.hostname.substring(0, window.location.hostname.indexOf(locations.us.location)).split('.');
  subdomainSections = subdomainSections.splice(0, subdomainSections.length - 1);
  if (!subdomainSections.find(section => section === key)) {
    subdomainSections = key === locations.us.key ? subdomainSections.filter(section => !locations[section]) : [...subdomainSections, key];
    return `https://${[...subdomainSections, ...locations.us.location.split('.')].join('.')}`;
  }
  return `https://${window.location.hostname}`;
};

const devLocations = ['localhost', 'docker.mender.io'];
export const createOrganizationTrial = createAsyncThunk(`${sliceName}/createOrganizationTrial`, (data, { dispatch }) => {
  const { key } = locations[data.location];
  const targetLocation = getTargetLocation(key);
  const target = `${targetLocation}${tenantadmApiUrlv2}/tenants/trial`;
  return Api.postUnauthorized(target, data)
    .catch(err => {
      if (err.response.status >= 400 && err.response.status < 500) {
        dispatch(storeActions.setSnackbar(err.response.data.error, TIMEOUTS.fiveSeconds, ''));
        return Promise.reject(err);
      }
    })
    .then(({ headers }) => {
      cookies.remove('oauth');
      cookies.remove('externalID');
      cookies.remove('email');
      dispatch(storeActions.setFirstLoginAfterSignup(true));
      return new Promise(resolve =>
        setTimeout(() => {
          window.location.assign(`${targetLocation}${headers.location || ''}`);
          return resolve();
        }, TIMEOUTS.fiveSeconds)
      );
    });
});

export const startCardUpdate = createAsyncThunk(`${sliceName}/startCardUpdate`, (_, { dispatch }) =>
  Api.post(`${tenantadmApiUrlv2}/billing/card`)
    .then(({ data }) => {
      dispatch(actions.receiveSetupIntent(data.intent_id));
      return Promise.resolve(data.secret);
    })
    .catch(err => commonErrorHandler(err, `Updating the card failed:`, dispatch))
);

export const confirmCardUpdate = createAsyncThunk(`${sliceName}/confirmCardUpdate`, (_, { dispatch, getState }) =>
  Api.post(`${tenantadmApiUrlv2}/billing/card/${getState().organization.intentId}/confirm`)
    .then(() => Promise.all([dispatch(storeActions.setSnackbar('Payment card was updated successfully')), dispatch(actions.receiveSetupIntent(null))]))
    .catch(err => commonErrorHandler(err, `Updating the card failed:`, dispatch))
);

export const getCurrentCard = createAsyncThunk(`${sliceName}/getCurrentCard`, (_, { dispatch }) =>
  Api.get(`${tenantadmApiUrlv2}/billing`).then(res => {
    const { last4, exp_month, exp_year, brand } = res.data.card || {};
    return Promise.resolve(dispatch(actions.receiveCurrentCard({ brand, last4, expiration: { month: exp_month, year: exp_year } })));
  })
);

export const startUpgrade = createAsyncThunk(`${sliceName}/startUpgrade`, (tenantId, { dispatch }) =>
  Api.post(`${tenantadmApiUrlv2}/tenants/${tenantId}/upgrade/start`)
    .then(({ data }) => Promise.resolve(data.secret))
    .catch(err => commonErrorHandler(err, `There was an error upgrading your account:`, dispatch))
);

export const cancelUpgrade = createAsyncThunk(`${sliceName}/cancelUpgrade`, tenantId => Api.post(`${tenantadmApiUrlv2}/tenants/${tenantId}/upgrade/cancel`));

export const completeUpgrade = createAsyncThunk(`${sliceName}/completeUpgrade`, ({ tenantId, plan }, { dispatch }) =>
  Api.post(`${tenantadmApiUrlv2}/tenants/${tenantId}/upgrade/complete`, { plan })
    .catch(err => commonErrorHandler(err, `There was an error upgrading your account:`, dispatch))
    .then(() => Promise.resolve(dispatch(getUserOrganization())))
);

const prepareAuditlogQuery = ({ startDate, endDate, user: userFilter, type, detail: detailFilter, sort = {} }) => {
  const userId = userFilter?.id || userFilter;
  const detail = detailFilter?.id || detailFilter;
  const createdAfter = startDate ? `&created_after=${Math.round(Date.parse(startDate) / 1000)}` : '';
  const createdBefore = endDate ? `&created_before=${Math.round(Date.parse(endDate) / 1000)}` : '';
  const typeSearch = type ? `&object_type=${type.value}`.toLowerCase() : '';
  const userSearch = userId ? `&actor_id=${userId}` : '';
  const objectSearch = type && detail ? `&${type.queryParameter}=${encodeURIComponent(detail)}` : '';
  const { direction = SORTING_OPTIONS.desc } = sort;
  return `${createdAfter}${createdBefore}${userSearch}${typeSearch}${objectSearch}&sort=${direction}`;
};

export const getAuditLogs = createAsyncThunk(`${sliceName}/getAuditLogs`, (selectionState, { dispatch, getState }) => {
  const { page, perPage } = selectionState;
  const { hasAuditlogs } = getTenantCapabilities(getState());
  if (!hasAuditlogs) {
    return Promise.resolve();
  }
  return Api.get(`${auditLogsApiUrl}/logs?page=${page}&per_page=${perPage}${prepareAuditlogQuery(selectionState)}`)
    .then(({ data, headers }) => {
      let total = headers[headerNames.total];
      total = Number(total || data.length);
      return Promise.resolve(dispatch(actions.receiveAuditLogs({ events: data, total })));
    })
    .catch(err => commonErrorHandler(err, `There was an error retrieving audit logs:`, dispatch));
});

export const getAuditLogsCsvLink = createAsyncThunk(`${sliceName}/getAuditLogsCsvLink`, (_, { getState }) =>
  Promise.resolve(`${auditLogsApiUrl}/logs/export?limit=20000${prepareAuditlogQuery(getAuditlogState(getState()))}`)
);

export const setAuditlogsState = createAsyncThunk(`${sliceName}/setAuditlogsState`, (selectionState, { dispatch, getState }) => {
  const currentState = getAuditlogState(getState());
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
    tasks.push(dispatch(getAuditLogs(nextState)).finally(() => dispatch(actions.setAuditLogState({ isLoading: false }))));
  }
  tasks.push(dispatch(actions.setAuditLogState(nextState)));
  return Promise.all(tasks);
});

/*
  Tenant management + Hosted Mender
*/
export const tenantDataDivergedMessage = 'The system detected there is a change in your plan or purchased add-ons. Please log out and log in again';

export const getUserOrganization = createAsyncThunk(`${sliceName}/getUserOrganization`, (_, { dispatch, getState }) => {
  return Api.get(`${tenantadmApiUrlv1}/user/tenant`).then(res => {
    let tasks = [dispatch(actions.setOrganization(res.data))];
    const { addons, plan, trial } = res.data;
    const { token } = getCurrentSession(getState());
    const jwt = jwtDecode(token);
    const jwtData = { addons: jwt['mender.addons'], plan: jwt['mender.plan'], trial: jwt['mender.trial'] };
    if (!deepCompare({ addons, plan, trial }, jwtData)) {
      const hash = hashString(tenantDataDivergedMessage);
      cookies.remove(`${jwt.sub}${hash}`);
      tasks.push(dispatch(storeActions.setAnnouncement(tenantDataDivergedMessage)));
    }
    return Promise.all(tasks);
  });
});

export const sendSupportMessage = createAsyncThunk(`${sliceName}/sendSupportMessage`, (content, { dispatch }) =>
  Api.post(`${tenantadmApiUrlv2}/contact/support`, content)
    .catch(err => commonErrorHandler(err, 'There was an error sending your request', dispatch, commonErrorFallback))
    .then(() => Promise.resolve(dispatch(storeActions.setSnackbar('Your request was sent successfully', TIMEOUTS.fiveSeconds, ''))))
);

export const requestPlanChange = createAsyncThunk(`${sliceName}/requestPlanChange`, ({ content, tenantId }, { dispatch }) =>
  Api.post(`${tenantadmApiUrlv2}/tenants/${tenantId}/plan`, content)
    .catch(err => commonErrorHandler(err, 'There was an error sending your request', dispatch, commonErrorFallback))
    .then(() => Promise.resolve(dispatch(storeActions.setSnackbar('Your request was sent successfully', TIMEOUTS.fiveSeconds, ''))))
);

export const downloadLicenseReport = createAsyncThunk(`${sliceName}/downloadLicenseReport`, (_, { dispatch }) =>
  Api.get(`${deviceAuthV2}/reports/devices`)
    .catch(err => commonErrorHandler(err, 'There was an error downloading the report', dispatch, commonErrorFallback))
    .then(res => res.data)
);

// eslint-disable-next-line no-unused-vars
export const createIntegration = createAsyncThunk(`${sliceName}/createIntegration`, ({ id, ...integration }, { dispatch }) =>
  Api.post(`${iotManagerBaseURL}/integrations`, integration)
    .catch(err => commonErrorHandler(err, 'There was an error creating the integration', dispatch, commonErrorFallback))
    .then(() => Promise.all([dispatch(storeActions.setSnackbar('The integration was set up successfully')), dispatch(getIntegrations())]))
);

export const changeIntegration = createAsyncThunk(`${sliceName}/changeIntegration`, ({ id, credentials }, { dispatch }) =>
  Api.put(`${iotManagerBaseURL}/integrations/${id}/credentials`, credentials)
    .catch(err => commonErrorHandler(err, 'There was an error updating the integration', dispatch, commonErrorFallback))
    .then(() => Promise.all([dispatch(storeActions.setSnackbar('The integration was updated successfully')), dispatch(getIntegrations())]))
);

export const deleteIntegration = createAsyncThunk(`${sliceName}/deleteIntegration`, ({ id, provider }, { dispatch, getState }) =>
  Api.delete(`${iotManagerBaseURL}/integrations/${id}`, {})
    .catch(err => commonErrorHandler(err, 'There was an error removing the integration', dispatch, commonErrorFallback))
    .then(() => {
      const integrations = getState().organization.externalDeviceIntegrations.filter(item => provider !== item.provider);
      return Promise.all([
        dispatch(storeActions.setSnackbar('The integration was removed successfully')),
        dispatch(actions.receiveExternalDeviceIntegrations(integrations))
      ]);
    })
);

export const getIntegrations = createAsyncThunk(`${sliceName}/getIntegrations`, (_, { dispatch, getState }) =>
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
      return Promise.resolve(dispatch(actions.receiveExternalDeviceIntegrations(integrations)));
    })
);

export const getWebhookEvents = createAsyncThunk(`${sliceName}/getWebhookEvents`, (config = {}, { dispatch, getState }) => {
  const { isFollowUp, page = defaultPage, perPage = defaultPerPage } = config;
  return Api.get(`${iotManagerBaseURL}/events?page=${page}&per_page=${perPage}`)
    .catch(err => commonErrorHandler(err, 'There was an error retrieving activity for this integration', dispatch, commonErrorFallback))
    .then(({ data }) => {
      let tasks = [
        dispatch(
          actions.receiveWebhookEvents({
            value: isFollowUp ? getState().organization.webhooks.events : data,
            total: (page - 1) * perPage + data.length
          })
        )
      ];
      if (data.length >= perPage && !isFollowUp) {
        tasks.push(dispatch(getWebhookEvents({ isFollowUp: true, page: page + 1, perPage: 1 })));
      }
      return Promise.all(tasks);
    });
});

const ssoConfigActions = {
  create: { success: 'stored', error: 'storing' },
  edit: { success: 'updated', error: 'updating' },
  read: { success: '', error: 'retrieving' },
  remove: { success: 'removed', error: 'removing' },
  readMultiple: { success: '', error: 'retrieving' }
};

const ssoConfigActionErrorHandler = (err, type) => dispatch =>
  commonErrorHandler(err, `There was an error ${ssoConfigActions[type].error} the SSO configuration.`, dispatch, commonErrorFallback);

const ssoConfigActionSuccessHandler = type => dispatch =>
  dispatch(storeActions.setSnackbar(`The SSO configuration was ${ssoConfigActions[type].success} successfully`));

export const storeSsoConfig = createAsyncThunk(`${sliceName}/storeSsoConfig`, ({ config, contentType }, { dispatch }) =>
  Api.post(ssoIdpApiUrlv1, config, { headers: { 'Content-Type': contentType, Accept: 'application/json' } })
    .catch(err => dispatch(ssoConfigActionErrorHandler(err, 'create')))
    .then(() => Promise.all([dispatch(ssoConfigActionSuccessHandler('create')), dispatch(getSsoConfigs())]))
);

export const changeSsoConfig = createAsyncThunk(`${sliceName}/changeSsoConfig`, ({ config, contentType }, { dispatch }) =>
  Api.put(`${ssoIdpApiUrlv1}/${config.id}`, config, { headers: { 'Content-Type': contentType, Accept: 'application/json' } })
    .catch(err => dispatch(ssoConfigActionErrorHandler(err, 'edit')))
    .then(() => Promise.all([dispatch(ssoConfigActionSuccessHandler('edit')), dispatch(getSsoConfigs())]))
);

export const deleteSsoConfig = createAsyncThunk(`${sliceName}/deleteSsoConfig`, ({ id }, { dispatch, getState }) =>
  Api.delete(`${ssoIdpApiUrlv1}/${id}`)
    .catch(err => dispatch(ssoConfigActionErrorHandler(err, 'remove')))
    .then(() => {
      const configs = getState().organization.ssoConfigs.filter(item => id !== item.id);
      return Promise.all([dispatch(ssoConfigActionSuccessHandler('remove')), dispatch(actions.receiveSsoConfigs(configs))]);
    })
);

const getSsoConfigById = createAsyncThunk(`${sliceName}/getSsoConfigById`, (config, { dispatch }) =>
  Api.get(`${ssoIdpApiUrlv1}/${config.id}`)
    .catch(err => dispatch(ssoConfigActionErrorHandler(err, 'read')))
    .then(({ data, headers }) => {
      const sso = Object.values(SSO_TYPES).find(({ contentType }) => contentType === headers['content-type']);
      return sso ? Promise.resolve({ ...config, config: data, type: sso.id }) : Promise.reject('Unsupported SSO config content type.');
    })
);

export const getSsoConfigs = createAsyncThunk(`${sliceName}/getSsoConfigs`, (_, { dispatch }) =>
  Api.get(ssoIdpApiUrlv1)
    .catch(err => dispatch(ssoConfigActionErrorHandler(err, 'readMultiple')))
    .then(({ data }) =>
      Promise.all(data.map(config => Promise.resolve(dispatch(getSsoConfigById(config)))))
        .then(configs => dispatch(actions.receiveSsoConfigs(configs)))
        .catch(err => commonErrorHandler(err, err, dispatch, ''))
    )
);
