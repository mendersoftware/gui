import React from 'react';
import PropTypes from 'prop-types';
import SelfUserManagement from '../user-management/selfusermanagement';
import UserManagement from '../user-management/usermanagement';
import MyOrganization from './organization';
import Global from './global';

import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';

// material ui
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import { Tabs, Tab } from 'material-ui/Tabs';

var listItems = [
  { route: '/settings/global-settings', text: 'Global settings', admin: true },
  { route: '/settings/my-account', text: 'My account', admin: false },
  { route: '/settings/my-organization', text: 'My organization', admin: true },
  { route: '/settings/user-management', text: 'User management', admin: true }
];

export default class Settings extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = this._getInitialState();
  }
  _getInitialState() {
    return {
      tabIndex: this._updateActive(),
      hasMultitenancy: AppStore.hasMultitenancy()
    };
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
      this.changeTab('/settings/my-account');
    }
  }

  componentWillReceiveProps() {
    this.setState({ tabIndex: this._updateActive() });
  }

  _onChange() {
    this.setState(this._getInitialState());
  }

  _updateActive() {
    switch (this.context.router.route.match.params.section) {
    case 'my-account':
      return '/settings/my-account';
    case 'my-organization':
      return '/settings/my-organization';
    case 'user-management':
      return '/settings/user-management';
    case 'global-settings':
      return '/settings/global-settings';
    default:
      return '/settings/global-settings';
    }
  }
  _handleTabActive(tab) {
    this.context.router.history.push(tab.props.value);
  }
  changeTab(route) {
    AppActions.setSnackbar('');
    this.context.router.history.push(route);
  }

  render() {
    var tabHandler = this._handleTabActive.bind(this);
    var self = this;

    var list = listItems.map((item, index) => {
      if (item.route === '/settings/my-organization' && !self.state.hasMultitenancy) {
        // don't show organization if no multitenancy
        return null;
      } else {
        return (
          <ListItem
            key={index}
            style={self.state.tabIndex === item.route ? { backgroundColor: '#e7e7e7' } : null}
            primaryText={item.text}
            onClick={() => self.changeTab(item.route)}
          />
        );
      }
    });

    var organization = this.state.hasMultitenancy ? (
      <Tab
        label="My organization"
        value="/settings/my-organization"
        onActive={tabHandler}
        style={this.state.hasMultitenancy ? { display: 'block', width: '100%' } : { display: 'none' }}
      >
        <div>
          <MyOrganization />
        </div>
      </Tab>
    ) : null;

    return (
      <div className="margin-top">
        <div className="leftFixed">
          <List>
            <Subheader>Settings</Subheader>
            {list}
          </List>
        </div>
        <div className="rightFluid padding-right">
          <Tabs
            value={this.state.tabIndex}
            onChange={route => this.changeTab(route)}
            tabItemContainerStyle={{ display: 'none' }}
            inkBarStyle={{ display: 'none' }}
          >
            <Tab label="Global settings" value="/settings/global-settings" onActive={tabHandler} style={{ display: 'block', width: '100%' }}>
              <div>
                <Global />
              </div>
            </Tab>

            <Tab label="My account" value="/settings/my-account" onActive={tabHandler} style={{ display: 'block', width: '100%' }}>
              <div>
                <SelfUserManagement />
              </div>
            </Tab>

            {organization}

            <Tab label="User management" value="/settings/user-management" onActive={tabHandler} style={{ display: 'block', width: '100%' }}>
              <div>
                <UserManagement currentTab={this.state.tabIndex} />
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    );
  }
}
