import { createSelector } from '@reduxjs/toolkit';

import { attributeDuplicateFilter, getDemoDeviceAddress as getDemoDeviceAddressHelper } from '../helpers';
import {
  ALL_DEVICES,
  ATTRIBUTE_SCOPES,
  DEVICE_ISSUE_OPTIONS,
  DEVICE_LIST_MAXIMUM_LENGTH,
  PLANS,
  UNGROUPED_GROUP,
  defaultReports,
  inventoryApiUrlV2,
  onboardingSteps,
  reportingApiUrl,
  rolesByName,
  uiPermissionsById
} from './constants';
import {
  getAuditLogEntry,
  getCurrentUser,
  getDeploymentsById,
  getDeploymentsSelectionState,
  getDeviceById,
  getDevicesById,
  getFeatures,
  getFilteringAttributes,
  getGlobalSettings,
  getGroupsById,
  getIssueCountsByType,
  getListedDevices,
  getOnboarding,
  getOrganization,
  getReleasesById,
  getRolesById,
  getSearchedDevices,
  getSelectedDeploymentDeviceIds,
  getUserSettings
} from './selectors';
import { listItemMapper, mapUserRolesToUiPermissions } from './utils';

export const getIsEnterprise = createSelector(
  [getOrganization, getFeatures],
  ({ plan = PLANS.os.id }, { isEnterprise, isHosted }) => isEnterprise || (isHosted && plan === PLANS.enterprise.id)
);

export const getAttrsEndpoint = createSelector([getFeatures], ({ hasReporting }) =>
  hasReporting ? `${reportingApiUrl}/devices/search/attributes` : `${inventoryApiUrlV2}/filters/attributes`
);
export const getSearchEndpoint = createSelector([getFeatures], ({ hasReporting }) =>
  hasReporting ? `${reportingApiUrl}/devices/search` : `${inventoryApiUrlV2}/filters/search`
);

export const getUserRoles = createSelector(
  [getCurrentUser, getRolesById, getIsEnterprise, getFeatures, getOrganization],
  (currentUser, rolesById, isEnterprise, { isHosted, hasMultitenancy }, { plan = PLANS.os.id }) => {
    const isAdmin = currentUser.roles?.length
      ? currentUser.roles.some(role => role === rolesByName.admin)
      : !(hasMultitenancy || isEnterprise || (isHosted && plan !== PLANS.os.id));
    const uiPermissions = isAdmin
      ? mapUserRolesToUiPermissions([rolesByName.admin], rolesById)
      : mapUserRolesToUiPermissions(currentUser.roles || [], rolesById);
    return { isAdmin, uiPermissions };
  }
);

const hasPermission = (thing, permission) => Object.values(thing).some(permissions => permissions.includes(permission));

export const getUserCapabilities = createSelector([getUserRoles], ({ uiPermissions }) => {
  const canManageReleases = hasPermission(uiPermissions.releases, uiPermissionsById.manage.value);
  const canReadReleases = canManageReleases || hasPermission(uiPermissions.releases, uiPermissionsById.read.value);
  const canUploadReleases = canManageReleases || hasPermission(uiPermissions.releases, uiPermissionsById.upload.value);

  const canAuditlog = uiPermissions.auditlog.includes(uiPermissionsById.read.value);

  const canReadUsers = uiPermissions.userManagement.includes(uiPermissionsById.read.value);
  const canManageUsers = uiPermissions.userManagement.includes(uiPermissionsById.manage.value);

  const canReadDevices = hasPermission(uiPermissions.groups, uiPermissionsById.read.value);
  const canWriteDevices = Object.values(uiPermissions.groups).some(
    groupPermissions => groupPermissions.includes(uiPermissionsById.read.value) && groupPermissions.length > 1
  );
  const canTroubleshoot = hasPermission(uiPermissions.groups, uiPermissionsById.connect.value);
  const canManageDevices = hasPermission(uiPermissions.groups, uiPermissionsById.manage.value);
  const canConfigure = hasPermission(uiPermissions.groups, uiPermissionsById.configure.value);

  const canDeploy = uiPermissions.deployments.includes(uiPermissionsById.deploy.value) || hasPermission(uiPermissions.groups, uiPermissionsById.deploy.value);
  const canReadDeployments = uiPermissions.deployments.includes(uiPermissionsById.read.value);

  return {
    canAuditlog,
    canConfigure,
    canDeploy,
    canManageDevices,
    canManageReleases,
    canManageUsers,
    canReadDeployments,
    canReadDevices,
    canReadReleases,
    canReadUsers,
    canTroubleshoot,
    canUploadReleases,
    canWriteDevices,
    groupsPermissions: uiPermissions.groups,
    releasesPermissions: uiPermissions.releases
  };
});

export const getTenantCapabilities = createSelector(
  [getFeatures, getOrganization, getIsEnterprise],
  (
    { hasAuditlogs: isAuditlogEnabled, hasDeviceConfig: isDeviceConfigEnabled, hasDeviceConnect: isDeviceConnectEnabled, hasMonitor: isMonitorEnabled },
    { addons = [], plan = PLANS.os.id },
    isEnterprise
  ) => {
    const canDelta = isEnterprise || plan === PLANS.professional.id;
    const hasAuditlogs = isAuditlogEnabled && isEnterprise;
    const hasDeviceConfig = isDeviceConfigEnabled && addons.some(addon => addon.name === 'configure' && Boolean(addon.enabled));
    const hasDeviceConnect = isDeviceConnectEnabled && (!isEnterprise || addons.some(addon => addon.name === 'troubleshoot' && Boolean(addon.enabled)));
    const hasMonitor = isMonitorEnabled && addons.some(addon => addon.name === 'monitor' && Boolean(addon.enabled));
    return {
      canDelta,
      canRetry: canDelta,
      canSchedule: canDelta,
      hasAuditlogs,
      hasDeviceConfig,
      hasDeviceConnect,
      hasFullFiltering: canDelta,
      hasMonitor,
      isEnterprise,
      plan
    };
  }
);

export const getFilterAttributes = createSelector(
  [getGlobalSettings, getFilteringAttributes],
  ({ previousFilters }, { identityAttributes, inventoryAttributes, systemAttributes, tagAttributes }) => {
    const deviceNameAttribute = { key: 'name', value: 'Name', scope: ATTRIBUTE_SCOPES.tags, category: ATTRIBUTE_SCOPES.tags, priority: 1 };
    const deviceIdAttribute = { key: 'id', value: 'Device ID', scope: ATTRIBUTE_SCOPES.identity, category: ATTRIBUTE_SCOPES.identity, priority: 1 };
    const checkInAttribute = { key: 'check_in_time', value: 'Latest activity', scope: ATTRIBUTE_SCOPES.system, category: ATTRIBUTE_SCOPES.system, priority: 4 };
    const updateAttribute = { ...checkInAttribute, key: 'updated_ts', value: 'Last inventory update' };
    const firstRequestAttribute = { key: 'created_ts', value: 'First request', scope: ATTRIBUTE_SCOPES.system, category: ATTRIBUTE_SCOPES.system, priority: 4 };
    const attributes = [
      ...previousFilters.map(item => ({
        ...item,
        value: deviceIdAttribute.key === item.key ? deviceIdAttribute.value : item.key,
        category: 'recently used',
        priority: 0
      })),
      deviceNameAttribute,
      deviceIdAttribute,
      ...identityAttributes.map(item => ({ key: item, value: item, scope: ATTRIBUTE_SCOPES.identity, category: ATTRIBUTE_SCOPES.identity, priority: 1 })),
      ...inventoryAttributes.map(item => ({ key: item, value: item, scope: ATTRIBUTE_SCOPES.inventory, category: ATTRIBUTE_SCOPES.inventory, priority: 2 })),
      ...tagAttributes.map(item => ({ key: item, value: item, scope: ATTRIBUTE_SCOPES.tags, category: ATTRIBUTE_SCOPES.tags, priority: 3 })),
      checkInAttribute,
      updateAttribute,
      firstRequestAttribute,
      ...systemAttributes.map(item => ({ key: item, value: item, scope: ATTRIBUTE_SCOPES.system, category: ATTRIBUTE_SCOPES.system, priority: 4 }))
    ];
    return attributeDuplicateFilter(attributes, 'key');
  }
);

export const getOnboardingState = createSelector([getOnboarding, getUserSettings], ({ complete, progress, showTips, ...remainder }, { onboarding = {} }) => ({
  ...remainder,
  ...onboarding,
  complete: onboarding.complete || complete,
  progress:
    Object.keys(onboardingSteps).findIndex(step => step === progress) > Object.keys(onboardingSteps).findIndex(step => step === onboarding.progress)
      ? progress
      : onboarding.progress,
  showTips: !onboarding.showTips ? onboarding.showTips : showTips
}));

export const getDemoDeviceAddress = createSelector([getDevicesById, getOnboarding], (devicesById, { approach, demoArtifactPort }) => {
  const demoDeviceAddress = `http://${getDemoDeviceAddressHelper(Object.values(devicesById), approach)}`;
  return demoArtifactPort ? `${demoDeviceAddress}:${demoArtifactPort}` : demoDeviceAddress;
});

export const getDeviceConfigDeployment = createSelector([getDeviceById, getDeploymentsById], (device, deploymentsById) => {
  const { config = {} } = device;
  const { deployment_id: configDeploymentId } = config;
  const deviceConfigDeployment = deploymentsById[configDeploymentId] || {};
  return { device, deviceConfigDeployment };
});

export const getDeploymentRelease = createSelector(
  [getDeploymentsById, getDeploymentsSelectionState, getReleasesById],
  (deploymentsById, { selectedId }, releasesById) => {
    const deployment = deploymentsById[selectedId] || {};
    return deployment.artifact_name && releasesById[deployment.artifact_name] ? releasesById[deployment.artifact_name] : { device_types_compatible: [] };
  }
);

export const getSelectedDeploymentData = createSelector(
  [getDeploymentsById, getDeploymentsSelectionState, getDevicesById, getSelectedDeploymentDeviceIds],
  (deploymentsById, { selectedId }, devicesById, selectedDeviceIds) => {
    const deployment = deploymentsById[selectedId] ?? {};
    const { devices = {} } = deployment;
    return {
      deployment,
      selectedDevices: selectedDeviceIds.map(deviceId => ({ ...devicesById[deviceId], ...devices[deviceId] }))
    };
  }
);

export const getAvailableIssueOptionsByType = createSelector(
  [getFeatures, getTenantCapabilities, getIssueCountsByType],
  ({ hasReporting }, { hasFullFiltering, hasMonitor }, issueCounts) =>
    Object.values(DEVICE_ISSUE_OPTIONS).reduce((accu, { isCategory, key, needsFullFiltering, needsMonitor, needsReporting, title }) => {
      if (isCategory || (needsReporting && !hasReporting) || (needsFullFiltering && !hasFullFiltering) || (needsMonitor && !hasMonitor)) {
        return accu;
      }
      accu[key] = { count: issueCounts[key].filtered, key, title };
      return accu;
    }, {})
);

export const getGroupNames = createSelector([getGroupsById, getUserRoles, (_, options = {}) => options], (groupsById, { uiPermissions }, { staticOnly }) => {
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = groupsById;
  if (staticOnly) {
    return Object.keys(uiPermissions.groups).sort();
  }
  return Object.keys(
    Object.entries(groups).reduce((accu, [groupName, group]) => {
      if (group.filterId || uiPermissions.groups[ALL_DEVICES]) {
        accu[groupName] = group;
      }
      return accu;
    }, uiPermissions.groups)
  ).sort();
});

export const getDeviceReportsForUser = createSelector(
  [getUserSettings, getCurrentUser, getGlobalSettings, getDevicesById],
  ({ reports }, { id: currentUserId }, globalSettings, devicesById) => {
    return reports || globalSettings[`${currentUserId}-reports`] || (Object.keys(devicesById).length ? defaultReports : []);
  }
);

const listTypeDeviceIdMap = {
  deviceList: getListedDevices,
  search: getSearchedDevices
};
const getDeviceMappingDefaults = () => ({ defaultObject: { auth_sets: [] }, cutOffSize: DEVICE_LIST_MAXIMUM_LENGTH });

export const getMappedDevicesList = createSelector(
  [getDevicesById, (state, listType) => listTypeDeviceIdMap[listType](state), getDeviceMappingDefaults],
  listItemMapper
);

export const getAuditlogDevice = createSelector([getAuditLogEntry, getDevicesById], (auditlogEvent, devicesById) => {
  let auditlogDevice = {};
  if (auditlogEvent) {
    const { object = {} } = auditlogEvent;
    const { device = {}, id, type } = object;
    auditlogDevice = type === 'device' ? { id, ...device } : auditlogDevice;
  }
  return { ...auditlogDevice, ...devicesById[auditlogDevice.id] };
});
