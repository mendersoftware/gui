import { createSelector } from 'reselect';
import { rolesByName } from '../constants/userConstants';
import { getDemoDeviceAddress as getDemoDeviceAddressHelper } from '../helpers';

const getAppDocsVersion = state => state.app.docsVersion;
const getFeatures = state => state.app.features;
const getRolesById = state => state.users.rolesById;
const getOrganization = state => state.organization.organization;
const getDevicesList = state => Object.values(state.devices.byId);
const getOnboarding = state => state.onboarding;
const getShowHelptips = state => state.users.showHelptips;
const getGlobalSettings = state => state.users.globalSettings;

export const getCurrentUser = state => state.users.byId[state.users.currentUser];
export const getUserSettings = state => state.users.globalSettings[state.users.currentUser] || {};

export const getDemoDeviceAddress = createSelector([getDevicesList, getOnboarding], (devices, { approach, demoArtifactPort }) => {
  return getDemoDeviceAddressHelper(devices, approach, demoArtifactPort);
});

export const getIdAttribute = createSelector([getGlobalSettings], ({ id_attribute = 'Device ID' }) => id_attribute);

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
    let isAdmin = false || !(hasMultitenancy || isEnterprise || (isHosted && plan !== 'os'));
    let allowUserManagement = isAdmin;
    let isGroupRestricted = false;
    if (currentUser?.roles) {
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
    }
    return { allowUserManagement, isAdmin, isGroupRestricted };
  }
);

export const getTenantCapabilities = createSelector([getOrganization], ({ addons = [] }) => {
  const hasDeviceConfig = addons.some(addon => addon.Name === 'configure' && Boolean(addon.Enabled));
  return { hasDeviceConfig };
});
