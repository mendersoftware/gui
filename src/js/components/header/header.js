import React from 'react';
import { Router, Route, Link } from 'react-router';
import cookie from 'react-cookie';
var AppActions = require('../../actions/app-actions');

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
    backgroundColor: "#7D3F69"
  }
};

var tab = 0;

var Header = React.createClass({
  getInitialState: function() {
    return {
      tabIndex: this._updateActive(),
    };
  },
  componentWillMount: function() {
    this.setState({tabIndex: this._updateActive()});
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({tabIndex: this._updateActive()});
  },
  _updateActive: function() {
    return this.context.router.isActive({ pathname: '/' }, true) ? '/' :
      this.context.router.isActive('/devices') ? '/devices' :
      this.context.router.isActive('/artifacts') ? '/artifacts' : 
      this.context.router.isActive('/deployments') ? '/deployments' : '/';
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

      <DropDownMenu style={{marginRight: "0"}} iconStyle={{ fill: 'rgb(0, 0, 0)' }} value={cookie.load("userEmail")}>
        <MenuItem primaryText={cookie.load("userEmail")}  value={cookie.load("userEmail")} className="hidden" />
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
  router: React.PropTypes.object,
};

module.exports = Header;