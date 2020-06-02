import Api from '../api/general-api';

const apiUrl = '/api/management/v2';
const tenantadmApiUrl = `${apiUrl}/tenantadm`;

export const cancelRequest = (tenantId, reason) => () => Api.post(`${tenantadmApiUrl}/tenants/${tenantId}/cancel`, { reason: reason });
