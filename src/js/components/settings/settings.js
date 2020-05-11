import React from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';

// material ui
import { List, ListItem, ListItemText, ListSubheader } from '@material-ui/core';

import SelfUserManagement from '../user-management/selfusermanagement';
import UserManagement from '../user-management/usermanagement';
import MyOrganization from './organization';
import Global from './global';

const sectionMap = {
  'global-settings': { admin: false, enterprise: false, multitenancy: false, component: <Global />, text: 'Global settings' },
  'my-account': { admin: false, enterprise: false, multitenancy: false, component: <SelfUserManagement />, text: 'My account' },
  'user-management': { admin: true, enterprise: false, multitenancy: false, component: <UserManagement />, text: 'User management' },
  'my-organization': { admin: false, enterprise: false, multitenancy: true, component: <MyOrganization />, text: 'My organization' }
};

export const Settings = ({ currentUser, hasMultitenancy, history, isAdmin, isEnterprise, match }) => {
  const checkDenyAccess = item => (currentUser && item.admin && !isAdmin) || (item.multitenancy && !hasMultitenancy) || (item.enterprise && !isEnterprise);

  const getCurrentSection = (sections, section = match.params.section) => {
    if (!sections.hasOwnProperty(section) || checkDenyAccess(sections[section])) {
      history.replace('/settings/my-account');
      return sections['my-account'];
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
  const plan = state.users.organization ? state.users.organization.plan : 'os';
  return {
    currentUser,
    isAdmin: currentUser && currentUser.roles ? currentUser.roles.some(role => role === 'RBAC_ROLE_PERMIT_ALL') : false,
    isEnterprise: state.app.features.isEnterprise || (state.app.features.isHosted && plan === 'enterprise'),
    hasMultitenancy: state.app.features.hasMultitenancy
  };
};

export default withRouter(connect(mapStateToProps)(Settings));
