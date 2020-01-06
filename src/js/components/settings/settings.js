import React from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import SelfUserManagement from '../user-management/selfusermanagement';
import UserManagement from '../user-management/usermanagement';
import MyOrganization from './organization';
import Global from './global';
import Billing from './billing';

// material ui
import { List, ListItem, ListItemText, ListSubheader } from '@material-ui/core';

const routes = {
  global: { route: '/settings/global-settings', text: 'Global settings', admin: true, component: <Global /> },
  myAccount: { route: '/settings/my-account', text: 'My account', admin: false, component: <SelfUserManagement /> },
  userManagement: { route: '/settings/user-management', text: 'User management', admin: true, component: <UserManagement /> }
};
const myOrganization = { route: '/settings/my-organization', text: 'My organization', admin: true, component: <MyOrganization /> };
const billing = { route: '/settings/billing', text: 'Usage and billing', admin: true, component: <Billing /> };
const sectionMap = {
  'global-settings': 'global',
  'my-account': 'myAccount',
  billing: 'billing',
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
    let relevantItems = routes;

    if (self.props.hasMultitenancy) {
      relevantItems['myOrganization'] = myOrganization;
    }
    if (self.props.isHosted) {
      relevantItems['billing'] = billing;
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

    const section = self._getCurrentSection(sectionMap, self.props.match.params.section);
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
    isHosted: state.app.features.isHosted,
    hasMultitenancy: state.app.features.hasMultitenancy
  };
};

export default withRouter(connect(mapStateToProps)(Settings));
