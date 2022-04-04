import { createSelector } from '@reduxjs/toolkit';

import { mapUserRolesToUiPermissions } from '../actions/userActions';
import { PLANS } from '../constants/appConstants';
import { DEVICE_ISSUE_OPTIONS, DEVICE_LIST_MAXIMUM_LENGTH } from '../constants/deviceConstants';
import { rolesByName, twoFAStates } from '../constants/userConstants';
import { getDemoDeviceAddress as getDemoDeviceAddressHelper } from '../helpers';

const getAppDocsVersion = state => state.app.docsVersion;
export const getFeatures = state => state.app.features;
const getRolesById = state => state.users.rolesById;
const getOrganization = state => state.organization.organization;
const getAcceptedDevices = state => state.devices.byStatus.accepted;
const getDevicesById = state => state.devices.byId;
const getSearchedDevices = state => state.app.searchState.deviceIds;
const getSelectedDevice = state => state.devices.selectedDevice;
const getListedDevices = state => state.devices.deviceList.deviceIds;
const getFilteringAttributes = state => state.devices.filteringAttributes;
const getDeviceLimit = state => state.devices.limit;
const getDevicesList = state => Object.values(state.devices.byId);
const getOnboarding = state => state.onboarding;
const getShowHelptips = state => state.users.showHelptips;
const getGlobalSettings = state => state.users.globalSettings;
const getIssueCountsByType = state => state.monitor.issueCounts.byType;

export const getCurrentUser = state => state.users.byId[state.users.currentUser] || {};
export const getUserSettings = state => state.users.globalSettings[state.users.currentUser] || {};

export const getHas2FA = createSelector(
  [getCurrentUser],
  currentUser => currentUser.hasOwnProperty('tfa_status') && currentUser.tfa_status === twoFAStates.enabled
);

export const getDemoDeviceAddress = createSelector([getDevicesList, getOnboarding], (devices, { approach, demoArtifactPort }) => {
  return getDemoDeviceAddressHelper(devices, approach, demoArtifactPort);
});

const listTypeDeviceIdMap = {
  deviceList: getListedDevices,
  search: getSearchedDevices,
  selectedDevice: state => [getSelectedDevice(state)]
};
export const getMappedDevicesList = createSelector([getDevicesById, (state, listType) => listTypeDeviceIdMap[listType](state)], (devicesById, deviceIds) => {
  let devices = deviceIds.slice(0, DEVICE_LIST_MAXIMUM_LENGTH);
  return devices.reduce((accu, deviceId) => {
    if (deviceId && devicesById[deviceId]) {
      accu.push({ auth_sets: [], ...devicesById[deviceId] });
    }
    return accu;
  }, []);
});

export const getIdAttribute = createSelector([getGlobalSettings], ({ id_attribute = {} }) => id_attribute);

export const getLimitMaxed = createSelector([getAcceptedDevices, getDeviceLimit], ({ total: acceptedDevices = 0 }, deviceLimit) =>
  Boolean(deviceLimit && deviceLimit <= acceptedDevices)
);

export const getFilterAttributes = createSelector(
  [getGlobalSettings, getFilteringAttributes],
  ({ previousFilters }, { identityAttributes, inventoryAttributes, tagAttributes }) => {
    const deviceNameAttribute = { key: 'name', value: 'Name', scope: 'tags', category: 'tags', priority: 1 };
    const deviceIdAttribute = { key: 'id', value: 'Device ID', scope: 'identity', category: 'identity', priority: 1 };
    const attributes = [
      ...previousFilters.map(item => ({
        ...item,
        value: deviceIdAttribute.key === item.key ? deviceIdAttribute.value : item.key,
        category: 'recently used',
        priority: 0
      })),
      deviceNameAttribute,
      deviceIdAttribute,
      ...identityAttributes.map(item => ({ key: item, value: item, scope: 'identity', category: 'identity', priority: 1 })),
      ...inventoryAttributes.map(item => ({ key: item, value: item, scope: 'inventory', category: 'inventory', priority: 2 })),
      ...tagAttributes.map(item => ({ key: item, value: item, scope: 'tags', category: 'tags', priority: 3 }))
    ];
    return attributes.filter((item, index, array) => array.findIndex(filter => filter.key === item.key && filter.scope === item.scope) == index);
  }
);

export const getOnboardingState = createSelector([getOnboarding, getShowHelptips], ({ complete, progress, showTips }, showHelptips) => ({
  complete,
  progress,
  showHelptips,
  showTips
}));

export const getDocsVersion = createSelector([getAppDocsVersion, getFeatures], (appDocsVersion, { isHosted }) => {
  // if hosted, use latest docs version
  const docsVersion = appDocsVersion ? `${appDocsVersion}/` : 'development/';
  return isHosted ? '' : docsVersion;
});

export const getIsEnterprise = createSelector(
  [getOrganization, getFeatures],
  ({ plan = PLANS.os.value }, { isEnterprise, isHosted }) => isEnterprise || (isHosted && plan === PLANS.enterprise.value)
);

export const getUserRoles = createSelector(
  [getCurrentUser, getRolesById, getIsEnterprise, getFeatures, getOrganization],
  (currentUser, rolesById, isEnterprise, { isHosted, hasMultitenancy }, { plan = PLANS.os.value }) => {
    const isAdmin = currentUser.roles?.length
      ? currentUser.roles.some(role => role === rolesByName.admin)
      : !(hasMultitenancy || isEnterprise || (isHosted && plan !== PLANS.os.value));
    const uiPermissions = isAdmin
      ? mapUserRolesToUiPermissions([rolesByName.admin], rolesById)
      : mapUserRolesToUiPermissions(currentUser.roles || [], rolesById);
    return { isAdmin, uiPermissions };
  }
);

export const getTenantCapabilities = createSelector(
  [getFeatures, getOrganization, getIsEnterprise],
  (
    { hasAuditlogs, hasDeviceConfig: isDeviceConfigEnabled, hasDeviceConnect: isDeviceConnectEnabled, hasMonitor: isMonitorEnabled, isHosted },
    { addons = [], plan },
    isEnterprise
  ) => {
    const hasDeviceConfig = isDeviceConfigEnabled && (!isHosted || addons.some(addon => addon.name === 'configure' && Boolean(addon.enabled)));
    const hasDeviceConnect = isDeviceConnectEnabled && (!isHosted || addons.some(addon => addon.name === 'troubleshoot' && Boolean(addon.enabled)));
    const hasMonitor = isMonitorEnabled && (!isHosted || addons.some(addon => addon.name === 'monitor' && Boolean(addon.enabled)));
    const hasFullFiltering = isEnterprise || plan === PLANS.professional.value;
    return { hasAuditlogs, hasDeviceConfig, hasDeviceConnect, hasFullFiltering, hasMonitor };
  }
);

export const getAvailableIssueOptionsByType = createSelector(
  [getFeatures, getTenantCapabilities, getIssueCountsByType],
  ({ hasReporting }, { hasFullFiltering }, issueCounts) =>
    Object.values(DEVICE_ISSUE_OPTIONS).reduce((accu, { key, needsFullFiltering, needsReporting, title }) => {
      if ((needsReporting && !hasReporting) || (needsFullFiltering && !hasFullFiltering)) {
        return accu;
      }
      accu[key] = { count: issueCounts[key].filtered, key, title };
      return accu;
    }, {})
);
