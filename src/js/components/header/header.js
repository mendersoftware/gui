import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Link } from 'react-router';
import cookie from 'react-cookie';
var AppActions = require('../../actions/app-actions');
var AppStore = require('../../stores/app-store');
var createReactClass = require('create-react-class');

import { Tabs, Tab } from 'material-ui/Tabs';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import InfoIcon from 'react-material-icons/icons/action/info-outline';


var menuItems = [
  {route:"/", text:"Dashboard"},
  {route:"/devices", text:"Devices"},
  {route:"/artifacts", text:"Artifacts"},
  {route:"/deployments", text:"Deployments"},
];

var styles = {
  tabs: {
    backgroundColor: "#f7f7f7",
    color: "#414141"
  },
  inkbar: {
    backgroundColor: "#7D3F69",
    marginTop: "0"
  }
};

var tab = 0;

var Header = createReactClass({
  getInitialState: function() {
    return {
      tabIndex: this._updateActive(),
      userEmail: cookie.load("userEmail"),
      tabIndex: this._updateActive()
    };
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({tabIndex: this._updateActive()});
  },
  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState(this.getInitialState());
  },
  _updateActive: function() {
    return this.context.router.isActive({ pathname: '/' }, true) ? '/' :
      this.context.router.isActive('/devices') ? '/devices' :
      this.context.router.isActive('/artifacts') ? '/artifacts' : 
      this.context.router.isActive('/deployments') ? '/deployments' :
      this.context.router.isActive('/settings') ? '/settings' : '/';
  },
  _handleTabActive: function(tab) {
    this.context.router.push(tab.props.value);
  },
  changeTab: function() {
    this.props.clearSteps();
    AppActions.setSnackbar("");
  },
  _logOut: function() {
    cookie.remove('JWT');
    cookie.remove('userEmail');
    this.context.router.push("/login");
  },
  _handleHeaderMenu: function(event, index, value) {
    this.context.router.push(value);
  },
  render: function() {
    var tabHandler = this._handleTabActive;
    var menu = menuItems.map(function(item, index) {
      return (
        <Tab key={index}
          style={styles.tabs}
          label={item.text}
          value={item.route}
          onActive={tabHandler} />
      )
    });
    var dropDownElement = (

      <DropDownMenu anchorOrigin={{vertical: 'center', horizontal: 'middle'}} targetOrigin={{vertical: 'bottom', horizontal: 'middle'}}  style={{marginRight: "0"}} iconStyle={{ fill: 'rgb(0, 0, 0)' }} value={this.state.userEmail} onChange={this._handleHeaderMenu}>
        <MenuItem primaryText={this.state.userEmail} value={this.state.userEmail} className="hidden" />
        <MenuItem primaryText="User management" value="/settings/user-management" />
        <MenuItem primaryText="Log out" onClick={this._logOut} />
      </DropDownMenu>
    );
    return (
      <div className={this.context.router.isActive('/login') ? "hidden" : null}>
        <Toolbar style={{backgroundColor: "#fff"}}>
          <ToolbarGroup key={0} className="float-left">
              <Link to="/" id="logo"></Link>
          </ToolbarGroup>

          {this.props.demo ? <div id="demoBox"><InfoIcon style={{marginRight:"6px", height:"16px", verticalAlign:"bottom"}} />Mender is currently running in <b>demo mode</b>. <a href="https://docs.mender.io/Administration/Production-installation" target="_blank">See the documentation</a> for help switching to production mode</div> : null }

          <ToolbarGroup key={1} className="float-right">
            {dropDownElement}
          </ToolbarGroup>
        </Toolbar>
       
        <div id="header-nav">
          <Tabs
            value={this.state.tabIndex}
            inkBarStyle={styles.inkbar}
            onChange={this.changeTab}
            tabItemContainerStyle={{backgroundColor:"inherit"}}>
            {menu}
          </Tabs>
        </div>
      </div>
    );
  }
});

Header.contextTypes = {
  router: PropTypes.object,
};

module.exports = Header;