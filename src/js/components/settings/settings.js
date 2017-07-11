import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route } from 'react-router';
import cookie from 'react-cookie';
import SelfUserManagement from '../user-management/selfusermanagement';
import UserManagement from '../user-management/usermanagement';
var createReactClass = require('create-react-class');
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

// material ui
import { List, ListItem } from 'material-ui/List';
import Snackbar from 'material-ui/Snackbar';
import Subheader from 'material-ui/Subheader';
import { Tabs, Tab } from 'material-ui/Tabs';

var listItems = [
  {route: "/settings/my-account", text: "My account", admin: false},
  {route: "/settings/user-management", text: "User management", admin: true}
];

var Settings =  createReactClass({
  getInitialState: function() {
    return {
      tabIndex: this._updateActive(),
      snackbar: AppStore.getSnackbar()
    };
  },

  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },

  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({tabIndex: this._updateActive()});
  },

  _onChange: function(x) {
    this.setState(this.getInitialState());
  },

  _updateActive: function() {
    return this.context.router.isActive({ pathname: '/settings/my-account' }, true) ? '/settings/my-account' :
      this.context.router.isActive('/settings/user-management') ? '/settings/user-management' :
      this.context.router.isActive('/settings') ? '/settings' : '/settings/my-account';
  },
  _handleTabActive: function(tab) {
    this.context.router.push(tab.props.value);
  },
  changeTab: function(route) {
    AppActions.setSnackbar("");
    this.context.router.push(route);
  },

  render: function() {
    var tabHandler = this._handleTabActive;
    var self = this;
    
    var list = listItems.map(function(item, index) {
      return (
        <ListItem
          key={index}
          style={self.state.tabIndex===item.route ? {backgroundColor: "#e7e7e7"} : null }
          primaryText={item.text}
          onTouchTap={self.changeTab.bind(null, item.route)} />
      )
    });

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
            onChange={this.changeTab}
            tabItemContainerStyle={{display: "none"}}
            inkBarStyle={{display: "none"}}>
            <Tab
              label="My account"
              value="/settings/my-account"
              onActive={tabHandler}
              style={{display:"block", width:"100%"}}>
              <div>
                <SelfUserManagement />
              </div>
            </Tab>
            <Tab
              label="User management"
              value="/settings/user-management"
              onActive={tabHandler}
              style={{display:"block", width:"100%"}}>
              <div>
                <UserManagement />
              </div>
            </Tab>
          </Tabs>
        </div>

        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          autoHideDuration={8000} 
        />
      </div>
    )
  }

});


Settings.contextTypes = {
  router: PropTypes.object,
};

module.exports = Settings;
