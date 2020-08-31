import { createSelector } from 'reselect';
import { rolesByName } from '../constants/userConstants';

export const getCurrentUser = state => state.users.byId[state.users.currentUser];
const getAppDocsVersion = state => state.app.docsVersion;
const getFeatures = state => state.app.features;
const getRolesById = state => state.users.rolesById;
const getOrganization = state => state.users.organization;

export const getDocsVersion = createSelector([getAppDocsVersion, getFeatures], (appDocsVersion, { isHosted }) => {
  // if hosted, use latest docs version
  const docsVersion = appDocsVersion ? `${appDocsVersion}/` : 'development/';
  return isHosted ? 'hosted/' : docsVersion;
});

export const getIsEnterprise = createSelector(
  [getOrganization, getFeatures],
  ({ plan = 'os' }, { isEnterprise, isHosted }) => isEnterprise || (isHosted && plan === 'enterprise')
);

export const getUserRoles = createSelector(
  [getCurrentUser, getRolesById, getIsEnterprise, getFeatures, getOrganization],
  (currentUser, rolesById, isEnterprise, { isHosted, hasMultitenancy }, { plan = 'os' }) => {
    let isAdmin = false || !(hasMultitenancy || isEnterprise || (isHosted && plan !== 'os'));
    let allowUserManagement = false;
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
