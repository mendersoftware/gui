import React from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';

// material ui
import { List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@material-ui/core';
import PaymentIcon from '@material-ui/icons/Payment';

import { getIsEnterprise } from '../../selectors';
import SelfUserManagement from '../user-management/selfusermanagement';
import UserManagement from '../user-management/usermanagement';
import MyOrganization from './organization';
import Roles from './roles';
import Global from './global';
import Upgrade from './upgrade';

export const Settings = ({ allowUserManagement, currentUser, trial, hasMultitenancy, history, isAdmin, isEnterprise, match }) => {
  const sectionMap = {
    'global-settings': { admin: false, enterprise: false, multitenancy: false, userManagement: false, component: <Global />, text: 'Global settings' },
    'my-profile': { admin: false, enterprise: false, multitenancy: false, userManagement: false, component: <SelfUserManagement />, text: 'My profile' },
    'user-management': { admin: false, enterprise: false, multitenancy: false, userManagement: true, component: <UserManagement />, text: 'User management' },
    'role-management': { admin: true, enterprise: true, multitenancy: false, userManagement: false, component: <Roles />, text: 'Roles' },
    'my-organization': { admin: false, enterprise: false, multitenancy: true, userManagement: false, component: <MyOrganization />, text: 'My organization' },
    upgrade: {
      admin: false,
      enterprise: false,
      multitenancy: true,
      trial: true,
      userManagement: false,
      component: <Upgrade history={history} />,
      text: 'Upgrade to a plan'
    }
  };

  const checkDenyAccess = item =>
    (currentUser && item.admin && !isAdmin) ||
    (item.multitenancy && !hasMultitenancy) ||
    (item.enterprise && !isEnterprise) ||
    (item.userManagement && !allowUserManagement) ||
    (item.trial && !trial);

  const getCurrentSection = (sections, section = match.params.section) => {
    if (!sections.hasOwnProperty(section) || checkDenyAccess(sections[section])) {
      history.replace('/settings/my-profile');
      return sections['my-profile'];
    }
    return sections[section];
  };

  return (
    <div className="margin-top">
      <div className="leftFixed">
        <List>
          <ListSubheader>Settings</ListSubheader>
          {Object.entries(sectionMap).reduce((accu, [key, item]) => {
            if (!checkDenyAccess(item)) {
              accu.push(
                <ListItem component={NavLink} className="navLink settingsNav" to={`/settings/${key}`} key={key}>
                  <ListItemText>{item.text}</ListItemText>
                  {key === 'upgrade' ? (
                    <ListItemIcon>
                      <PaymentIcon />
                    </ListItemIcon>
                  ) : null}
                </ListItem>
              );
            }
            return accu;
          }, [])}
        </List>
      </div>
      <div className="rightFluid padding-right">{getCurrentSection(sectionMap, match.params.section).component}</div>
    </div>
  );
};

const mapStateToProps = state => {
  const currentUser = state.users.byId[state.users.currentUser];
  const { plan = 'os', trial = false } = state.users.organization;
  let isAdmin = false || !(state.app.features.hasMultitenancy || state.app.features.isEnterprise || (state.app.features.isHosted && plan !== 'os'));
  let allowUserManagement = false || isAdmin;
  if (currentUser?.roles) {
    // TODO: move these + additional role checks into selectors
    isAdmin = currentUser.roles.some(role => role === 'RBAC_ROLE_PERMIT_ALL');
    allowUserManagement =
      isAdmin ||
      currentUser.roles.some(role =>
        state.users.rolesById[role]?.permissions.some(
          permission => permission.action === 'http' && permission.object.value === '/api/management/v1/useradm/.*' && ['any'].includes(permission.object.type)
        )
      );
  }
  return {
    allowUserManagement,
    currentUser,
    isAdmin,
    isHosted: state.app.features.isHosted,
    isEnterprise: getIsEnterprise(state),
    hasMultitenancy: state.app.features.hasMultitenancy,
    plan,
    trial
  };
};

export default withRouter(connect(mapStateToProps)(Settings));
