import { createSelector } from 'reselect';
import { rolesByName } from '../constants/userConstants';

export const getCurrentUser = state => state.users.byId[state.users.currentUser];
const getRolesById = state => state.users.rolesById;

const getAppDocsVersion = state => state.app.docsVersion;
const getFeatures = state => state.app.features;

export const getDocsVersion = createSelector([getAppDocsVersion, getFeatures], (appDocsVersion, { isHosted }) => {
  const docsVersion = appDocsVersion ? `${appDocsVersion}/` : 'development/';
  return isHosted ? 'hosted/' : docsVersion;
});

const getOrganization = state => state.users.organization;

export const getIsEnterprise = createSelector(
  [getOrganization, getRolesById],
  ({ plan = 'os' }, { isEnterprise, isHosted }) => isEnterprise || (isHosted && plan === 'enterprise')
);

export const getUserRoles = createSelector(
  [getCurrentUser, getRolesById, getIsEnterprise, getFeatures, getOrganization],
  (currentUser, rolesById, isEnterprise, { isHosted, hasMultitenancy }, { plan = 'os' }) => {
    let isAdmin = false || !(hasMultitenancy || isEnterprise || (isHosted && plan !== 'os'));
    let allowUserManagement = false || isAdmin;

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
    }
    return { isAdmin, allowUserManagement };
  }
);
