import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import SelfUserManagement from '../user-management/selfusermanagement';
import UserManagement from '../user-management/usermanagement';
import MyOrganization from './organization';
import Global from './global';
import Billing from './billing';

import AppStore from '../../stores/app-store';

// material ui
import { List, ListItem, ListSubheader, ListItemText } from '@material-ui/core';

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

export default class Settings extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = { hasMultitenancy: AppStore.hasMultitenancy() };
  }

  componentWillMount() {
    AppStore.changeListener(this._onChange.bind(this));
  }

  componentWillUnmount() {
    AppStore.removeChangeListener(this._onChange.bind(this));
  }

  componentDidMount() {
    if (
      this.context.router.route.location.pathname === '/settings' ||
      (this.context.router.route.location.pathname === myOrganization.route && !this.state.hasMultitenancy)
    ) {
      // redirect from organization screen if no multitenancy
      this.context.router.history.replace(routes.myAccount.route);
    }
  }

  _getCurrentTab(routeDefinitions, tab = this.props.history.location.pathname) {
    if (routeDefinitions.hasOwnProperty(tab)) {
      return routeDefinitions[tab];
    }
    return routeDefinitions.myAccount;
  }

  _getCurrentSection(sections, section = this.context.router.route.match.params.section) {
    if (sections.hasOwnProperty(section)) {
      return sections[section];
    }
    return sections['my-account'];
  }

  _onChange() {
    this.setState({ hasMultitenancy: AppStore.hasMultitenancy() });
  }

  render() {
    var self = this;
    const isHosted = AppStore.getIsHosted();
    let relevantItems = routes;

    if (self.state.hasMultitenancy) {
      relevantItems['myOrganization'] = myOrganization;
    }
    if (isHosted) {
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

    const section = self._getCurrentSection(sectionMap, self.context.router.route.match.params.section);
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
