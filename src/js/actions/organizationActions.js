import Api from '../api/general-api';

const apiUrl = '/api/management/v2';
const tenantadmApiUrl = `${apiUrl}/tenantadm`;

export const cancelRequest = (tenantId, reason) => () => Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/cancel`, { reason: reason });
export const createOrganizationTrial = data => () => Api.postForm(`${tenantadmApiUrl}/tenants/trial`, data);

export const startUpgrade = (tenantId) => () => Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/upgrade/start`);
export const cancelUpgrade = (tenantId) => () => Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/upgrade/cancel`);
export const completeUpgrade = (tenantId, plan) => () => Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/upgrade/complete`, { plan: plan });