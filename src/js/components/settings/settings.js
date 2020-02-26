import React from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';

// material ui
import { List, ListItem, ListItemText, ListSubheader } from '@material-ui/core';

import SelfUserManagement from '../user-management/selfusermanagement';
import UserManagement from '../user-management/usermanagement';
import MyOrganization from './organization';
import Global from './global';

const routes = {
  global: { route: '/settings/global-settings', text: 'Global settings', admin: true, component: <Global /> },
  myAccount: { route: '/settings/my-account', text: 'My account', admin: false, component: <SelfUserManagement /> },
  userManagement: { route: '/settings/user-management', text: 'User management', admin: true, component: <UserManagement /> }
};
const myOrganization = { route: '/settings/my-organization', text: 'My organization', admin: true, component: <MyOrganization /> };
const sectionMap = {
  'global-settings': 'global',
  'my-account': 'myAccount',
  'user-management': 'userManagement',
  'my-organization': 'myOrganization'
};

export class Settings extends React.Component {
  componentDidMount() {
    if (this.props.location.pathname === '/settings' || (this.props.location.pathname === myOrganization.route && !this.props.hasMultitenancy)) {
      // redirect from organization screen if no multitenancy
      this.props.history.replace(routes.myAccount.route);
    }
  }

  _getCurrentTab(routeDefinitions, tab = this.props.location.pathname) {
    if (routeDefinitions.hasOwnProperty(tab)) {
      return routeDefinitions[tab];
    }
    return routeDefinitions.myAccount;
  }

  _getCurrentSection(sections, section = this.props.match.params.section) {
    if (sections.hasOwnProperty(section)) {
      return sections[section];
    }
    return sections['my-account'];
  }

  render() {
    var self = this;
    const { hasMultitenancy, match } = self.props;

    let relevantItems = routes;

    if (hasMultitenancy) {
      relevantItems['myOrganization'] = myOrganization;
    }
    var list = Object.entries(relevantItems).reduce((accu, entry) => {
      const key = entry[0];
      const item = entry[1];
      accu.push(
        <ListItem component={NavLink} className="navLink settingsNav" to={item.route} key={key}>
          <ListItemText>{item.text}</ListItemText>
        </ListItem>
      );
      return accu;
    }, []);

    const section = self._getCurrentSection(sectionMap, match.params.section);
    return (
      <div className="margin-top">
        <div className="leftFixed">
          <List>
            <ListSubheader>Settings</ListSubheader>
            {list}
          </List>
        </div>
        <div className="rightFluid padding-right">{self._getCurrentTab(relevantItems, section).component}</div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    hasMultitenancy: state.app.features.hasMultitenancy
  };
};

export default withRouter(connect(mapStateToProps)(Settings));
