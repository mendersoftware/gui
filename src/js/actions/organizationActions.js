import Api from '../api/general-api';

import { setSnackbar } from '../actions/appActions';
import { preformatWithRequestID } from '../helpers';

import * as UserConstants from '../constants/userConstants'
const apiUrl = '/api/management/v2';
const tenantadmApiUrl = `${apiUrl}/tenantadm`;

export const cancelRequest = (tenantId, reason) => () => Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/cancel`, { reason: reason });
export const createOrganizationTrial = data => () => Api.postForm(`${tenantadmApiUrl}/tenants/trial`, data);

export const startUpgrade = (tenantId) => dispatch => 
	Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/upgrade/start`)
	.then((data) => Promise.all([dispatch({ type: UserConstants.STRIPE_SECRET, value: data.secret }), dispatch(startUpgrade())]))
	.catch(err => Promise.all([Promise.reject(err), dispatch(setSnackbar(preformatWithRequestID(err.res, err.res.body.error), null, 'Copy to clipboard'))]));


export const cancelUpgrade = (tenantId) => () => Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/upgrade/cancel`);

export const completeUpgrade = (tenantId) => () => Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/upgrade/complete`);