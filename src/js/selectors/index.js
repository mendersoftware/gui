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
import { createSelector } from '@reduxjs/toolkit';

import { mapUserRolesToUiPermissions } from '../actions/userActions';
import { PLANS } from '../constants/appConstants';
import { DEPLOYMENT_STATES } from '../constants/deploymentConstants';
import {
  ATTRIBUTE_SCOPES,
  DEVICE_ISSUE_OPTIONS,
  DEVICE_LIST_MAXIMUM_LENGTH,
  DEVICE_ONLINE_CUTOFF,
  EXTERNAL_PROVIDER,
  UNGROUPED_GROUP
} from '../constants/deviceConstants';
import { rolesByName, twoFAStates, uiPermissionsById } from '../constants/userConstants';
import { attributeDuplicateFilter, duplicateFilter, getDemoDeviceAddress as getDemoDeviceAddressHelper } from '../helpers';

const getAppDocsVersion = state => state.app.docsVersion;
export const getFeatures = state => state.app.features;
const getRolesById = state => state.users.rolesById;
const getOrganization = state => state.organization.organization;
const getAcceptedDevices = state => state.devices.byStatus.accepted;
const getDevicesById = state => state.devices.byId;
const getGroupsById = state => state.devices.groups.byId;
const getSearchedDevices = state => state.app.searchState.deviceIds;
const getListedDevices = state => state.devices.deviceList.deviceIds;
const getFilteringAttributes = state => state.devices.filteringAttributes;
const getFilteringAttributesFromConfig = state => state.devices.filteringAttributesConfig.attributes;
const getDeviceLimit = state => state.devices.limit;
const getDevicesList = state => Object.values(state.devices.byId);
const getOnboarding = state => state.onboarding;
const getShowHelptips = state => state.users.showHelptips;
const getGlobalSettings = state => state.users.globalSettings;
const getIssueCountsByType = state => state.monitor.issueCounts.byType;
const getReleasesById = state => state.releases.byId;
const getListedReleases = state => state.releases.releasesList.releaseIds;
const getExternalIntegrations = state => state.organization.externalDeviceIntegrations;
const getDeploymentsById = state => state.deployments.byId;
const getDeploymentsByStatus = state => state.deployments.byStatus;

export const getCurrentUser = state => state.users.byId[state.users.currentUser] || {};
export const getUserSettings = state => state.users.userSettings;

export const getHas2FA = createSelector(
  [getCurrentUser],
  currentUser => currentUser.hasOwnProperty('tfa_status') && currentUser.tfa_status === twoFAStates.enabled
);

export const getDemoDeviceAddress = createSelector([getDevicesList, getOnboarding], (devices, { approach, demoArtifactPort }) => {
  const demoDeviceAddress = `http://${getDemoDeviceAddressHelper(devices, approach)}`;
  return demoArtifactPort ? `${demoDeviceAddress}:${demoArtifactPort}` : demoDeviceAddress;
});

const listItemMapper = (byId, ids, { defaultObject = {}, cutOffSize = DEVICE_LIST_MAXIMUM_LENGTH }) => {
  return ids.slice(0, cutOffSize).reduce((accu, id) => {
    if (id && byId[id]) {
      accu.push({ ...defaultObject, ...byId[id] });
    }
    return accu;
  }, []);
};

const listTypeDeviceIdMap = {
  deviceList: getListedDevices,
  search: getSearchedDevices
};
const getDeviceMappingDefaults = () => ({ defaultObject: { auth_sets: [] }, cutOffSize: DEVICE_LIST_MAXIMUM_LENGTH });
export const getMappedDevicesList = createSelector(
  [getDevicesById, (state, listType) => listTypeDeviceIdMap[listType](state), getDeviceMappingDefaults],
  listItemMapper
);

const defaultIdAttribute = Object.freeze({ attribute: 'id', scope: ATTRIBUTE_SCOPES.identity });
export const getIdAttribute = createSelector([getGlobalSettings], ({ id_attribute = { ...defaultIdAttribute } }) => id_attribute);

export const getLimitMaxed = createSelector([getAcceptedDevices, getDeviceLimit], ({ total: acceptedDevices = 0 }, deviceLimit) =>
  Boolean(deviceLimit && deviceLimit <= acceptedDevices)
);

export const getFilterAttributes = createSelector(
  [getGlobalSettings, getFilteringAttributes],
  ({ previousFilters }, { identityAttributes, inventoryAttributes, systemAttributes, tagAttributes }) => {
    const deviceNameAttribute = { key: 'name', value: 'Name', scope: ATTRIBUTE_SCOPES.tags, category: ATTRIBUTE_SCOPES.tags, priority: 1 };
    const deviceIdAttribute = { key: 'id', value: 'Device ID', scope: ATTRIBUTE_SCOPES.identity, category: ATTRIBUTE_SCOPES.identity, priority: 1 };
    const checkInAttribute = { key: 'updated_ts', value: 'Last check-in', scope: ATTRIBUTE_SCOPES.system, category: ATTRIBUTE_SCOPES.system, priority: 4 };
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
      firstRequestAttribute,
      ...systemAttributes.map(item => ({ key: item, value: item, scope: ATTRIBUTE_SCOPES.system, category: ATTRIBUTE_SCOPES.system, priority: 4 }))
    ];
    return attributeDuplicateFilter(attributes, 'key');
  }
);

export const getGroups = createSelector([getGroupsById], groupsById => {
  const groupNames = Object.keys(groupsById).sort();
  const groupedGroups = Object.entries(groupsById)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce(
      (accu, [groupname, group]) => {
        const name = groupname === UNGROUPED_GROUP.id ? UNGROUPED_GROUP.name : groupname;
        const groupItem = { ...group, groupId: name, name: groupname };
        if (group.filters.length > 0) {
          if (groupname !== UNGROUPED_GROUP.id) {
            accu.dynamic.push(groupItem);
          } else {
            accu.ungrouped.push(groupItem);
          }
        } else {
          accu.static.push(groupItem);
        }
        return accu;
      },
      { dynamic: [], static: [], ungrouped: [] }
    );
  return { groupNames, ...groupedGroups };
});

export const getDeviceTwinIntegrations = createSelector([getExternalIntegrations], integrations =>
  integrations.filter(integration => integration.id && EXTERNAL_PROVIDER[integration.provider]?.deviceTwin)
);

export const getOfflineThresholdSettings = createSelector([getGlobalSettings], ({ offlineThreshold }) => ({
  interval: offlineThreshold?.interval || DEVICE_ONLINE_CUTOFF.interval,
  intervalUnit: offlineThreshold?.intervalUnit || DEVICE_ONLINE_CUTOFF.intervalName
}));

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

export const getAttributesList = createSelector(
  [getFilteringAttributes, getFilteringAttributesFromConfig],
  ({ identityAttributes = [], inventoryAttributes = [] }, { identity = [], inventory = [] }) =>
    [...identityAttributes, ...inventoryAttributes, ...identity, ...inventory].filter(duplicateFilter)
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
    canWriteDevices
  };
});

export const getTenantCapabilities = createSelector(
  [getFeatures, getOrganization, getIsEnterprise],
  (
    {
      hasAuditlogs: isAuditlogEnabled,
      hasDeviceConfig: isDeviceConfigEnabled,
      hasDeviceConnect: isDeviceConnectEnabled,
      hasMonitor: isMonitorEnabled,
      isHosted
    },
    { addons = [], plan },
    isEnterprise
  ) => {
    const canDelta = isEnterprise || plan === PLANS.professional.value;
    const hasAuditlogs = isAuditlogEnabled && (!isHosted || isEnterprise || plan === PLANS.professional.value);
    const hasDeviceConfig = isDeviceConfigEnabled && (!isHosted || addons.some(addon => addon.name === 'configure' && Boolean(addon.enabled)));
    const hasDeviceConnect = isDeviceConnectEnabled && (!isHosted || addons.some(addon => addon.name === 'troubleshoot' && Boolean(addon.enabled)));
    const hasMonitor = isMonitorEnabled && (!isHosted || addons.some(addon => addon.name === 'monitor' && Boolean(addon.enabled)));
    return {
      canDelta,
      canRetry: canDelta,
      canSchedule: canDelta,
      hasAuditlogs,
      hasDeviceConfig,
      hasDeviceConnect,
      hasFullFiltering: canDelta,
      hasMonitor,
      isEnterprise
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

export const getDeviceTypes = createSelector([getAcceptedDevices, getDevicesById], ({ deviceIds = [] }, devicesById) =>
  Object.keys(
    deviceIds.slice(0, 200).reduce((accu, item) => {
      const { device_type: deviceTypes = [] } = devicesById[item] ? devicesById[item].attributes : {};
      accu = deviceTypes.reduce((deviceTypeAccu, deviceType) => {
        if (deviceType.length > 1) {
          deviceTypeAccu[deviceType] = deviceTypeAccu[deviceType] ? deviceTypeAccu[deviceType] + 1 : 1;
        }
        return deviceTypeAccu;
      }, accu);
      return accu;
    }, {})
  )
);

const getReleaseMappingDefaults = () => ({});
export const getReleasesList = createSelector([getReleasesById, getListedReleases, getReleaseMappingDefaults], listItemMapper);

const relevantDeploymentStates = [DEPLOYMENT_STATES.pending, DEPLOYMENT_STATES.inprogress, DEPLOYMENT_STATES.finished];
export const DEPLOYMENT_CUTOFF = 3;
export const getRecentDeployments = createSelector([getDeploymentsById, getDeploymentsByStatus], (deploymentsById, deploymentsByStatus) =>
  Object.entries(deploymentsByStatus).reduce(
    (accu, [state, byStatus]) => {
      if (!relevantDeploymentStates.includes(state) || !byStatus.deploymentIds.length) {
        return accu;
      }
      accu[state] = byStatus.deploymentIds
        .reduce((accu, id) => {
          if (deploymentsById[id]) {
            accu.push(deploymentsById[id]);
          }
          return accu;
        }, [])
        .slice(0, DEPLOYMENT_CUTOFF);
      accu.total += byStatus.total;
      return accu;
    },
    { total: 0 }
  )
);
