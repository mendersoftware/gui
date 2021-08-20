import { createSelector } from '@reduxjs/toolkit';
import { rolesByName, twoFAStates } from '../constants/userConstants';
import { getDemoDeviceAddress as getDemoDeviceAddressHelper } from '../helpers';

const getAppDocsVersion = state => state.app.docsVersion;
const getFeatures = state => state.app.features;
const getRolesById = state => state.users.rolesById;
const getOrganization = state => state.organization.organization;
const getAcceptedDevices = state => state.devices.byStatus.accepted;
const getDeviceLimit = state => state.devices.limit;
const getDevicesList = state => Object.values(state.devices.byId);
const getOnboarding = state => state.onboarding;
const getShowHelptips = state => state.users.showHelptips;
const getGlobalSettings = state => state.users.globalSettings;

export const getCurrentUser = state => state.users.byId[state.users.currentUser] || {};
export const getUserSettings = state => state.users.globalSettings[state.users.currentUser] || {};

export const getHas2FA = createSelector(
  [getCurrentUser],
  currentUser => currentUser.hasOwnProperty('tfa_status') && currentUser.tfa_status === twoFAStates.enabled
);

export const getDemoDeviceAddress = createSelector([getDevicesList, getOnboarding], (devices, { approach, demoArtifactPort }) => {
  return getDemoDeviceAddressHelper(devices, approach, demoArtifactPort);
});

export const getIdAttribute = createSelector([getGlobalSettings], ({ id_attribute = {} }) => id_attribute);

export const getLimitMaxed = createSelector([getAcceptedDevices, getDeviceLimit], ({ total: acceptedDevices = 0 }, deviceLimit) =>
  Boolean(deviceLimit && deviceLimit <= acceptedDevices)
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
  ({ plan = 'os' }, { isEnterprise, isHosted }) => isEnterprise || (isHosted && plan === 'enterprise')
);

export const getUserRoles = createSelector(
  [getCurrentUser, getRolesById, getIsEnterprise, getFeatures, getOrganization],
  (currentUser, rolesById, isEnterprise, { isHosted, hasMultitenancy }, { plan = 'os' }) => {
    let isAdmin = !(hasMultitenancy || isEnterprise || (isHosted && plan !== 'os'));
    let allowUserManagement = isAdmin;
    let isGroupRestricted = false;
    let hasWriteAccess = isAdmin;
    let canTroubleshoot = isAdmin;
    if (currentUser.roles) {
      isAdmin = currentUser.roles.some(role => role === rolesByName.admin);
      allowUserManagement =
        isAdmin ||
        currentUser.roles.some(role =>
          rolesById[role]?.permissions.some(
            permission =>
              permission.action === rolesByName.userManagement.action &&
              permission.object.value === rolesByName.userManagement.object.value &&
              [rolesByName.userManagement.object.type].includes(permission.object.type)
          )
        );
      isGroupRestricted =
        !isAdmin &&
        currentUser.roles.some(role => rolesById[role]?.permissions.some(permission => permission.object.type === rolesByName.groupAccess.object.type));
      hasWriteAccess = isAdmin || currentUser.roles.some(role => role === rolesByName.readOnly);
      canTroubleshoot = isAdmin || currentUser.roles.some(role => role === rolesByName.terminalAccess);
    }
    return { allowUserManagement, canTroubleshoot, hasWriteAccess, isAdmin, isGroupRestricted };
  }
);

export const getTenantCapabilities = createSelector(
  [getFeatures, getOrganization],
  (
    { hasAuditlogs, hasDeviceConfig: isDeviceConfigEnabled, hasDeviceConnect: isDeviceConnectEnabled, hasMonitor: isMonitorEnabled, isHosted },
    { addons = [] }
  ) => {
    const hasDeviceConfig = isDeviceConfigEnabled && (!isHosted || addons.some(addon => addon.name === 'configure' && Boolean(addon.enabled)));
    const hasDeviceConnect = isDeviceConnectEnabled && (!isHosted || addons.some(addon => addon.name === 'troubleshoot' && Boolean(addon.enabled)));
    const hasMonitor = isMonitorEnabled && (!isHosted || addons.some(addon => addon.name === 'monitor' && Boolean(addon.enabled)));
    return { hasAuditlogs, hasDeviceConfig, hasDeviceConnect, hasMonitor };
  }
);
