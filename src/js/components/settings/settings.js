import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import SelfUserManagement from '../user-management/selfusermanagement';
import UserManagement from '../user-management/usermanagement';
import MyOrganization from './organization';
import Global from './global';

import AppStore from '../../stores/app-store';

// material ui
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { ListItemText } from '@material-ui/core';

const listItems = [
  { route: '/settings/global-settings', text: 'Global settings', admin: true, component: <Global /> },
  { route: '/settings/my-account', text: 'My account', admin: false, component: <SelfUserManagement /> },
  { route: '/settings/user-management', text: 'User management', admin: true, component: <UserManagement /> }
];

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
    if (this.state.tabIndex === '/settings/my-organization' && !this.state.hasMultitenancy) {
      // redirect from organization screen if no multitenancy
      this.context.router.history.replace('/settings/my-account');
    }
  }

  _onChange() {
    this.setState({ hasMultitenancy: AppStore.hasMultitenancy() });
  }

  render() {
    var self = this;
    let relevantItems = listItems;

    if (self.state.hasMultitenancy) {
      const organization = { route: '/settings/my-organization', text: 'My organization', admin: true, component: <MyOrganization /> };
      relevantItems.splice(organization.tabIndex, 0, organization);
    }
    var list = relevantItems.map((item, index) => (
      <ListItem component={NavLink} className="navLink settingsNav" to={item.route} key={index}>
        <ListItemText>{item.text}</ListItemText>
      </ListItem>
    ));

    const style = { display: 'block', width: '100%' };
    const tabIndex = this.props.history.location.pathname;

    return (
      <div className="margin-top">
        <div className="leftFixed">
          <List>
            <ListSubheader>Settings</ListSubheader>
            {list}
          </List>
        </div>
        <div className="rightFluid padding-right">
          <Tabs value={tabIndex}>
            {listItems.map(item => (
              <Tab component={Link} key={item.route} label={item.text} style={style} to={item.route} value={item.route} />
            ))}
          </Tabs>
          {listItems.find(item => tabIndex === item.route).component}
        </div>
      </div>
    );
  }
}
