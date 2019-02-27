import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import SelfUserManagement from '../user-management/selfusermanagement';
import UserManagement from '../user-management/usermanagement';
import MyOrganization from './organization';
import Global from './global';

import AppStore from '../../stores/app-store';

// material ui
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import { Tabs, Tab } from 'material-ui/Tabs';

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
      <NavLink className="navLink settingsNav" to={item.route} key={index}>
        <ListItem primaryText={item.text} />
      </NavLink>
    ));

    const style = { display: 'block', width: '100%' };

    return (
      <div className="margin-top">
        <div className="leftFixed">
          <List>
            <Subheader>Settings</Subheader>
            {list}
          </List>
        </div>
        <div className="rightFluid padding-right">
          <Tabs value={this.props.history.location.pathname} tabItemContainerStyle={{ display: 'none' }} inkBarStyle={{ display: 'none' }}>
            {listItems.map(item => {
              return (
                <Tab key={item.route} value={item.route} label={item.text} style={style}>
                  {item.component}
                </Tab>
              );
            })}
          </Tabs>
        </div>
      </div>
    );
  }
}
