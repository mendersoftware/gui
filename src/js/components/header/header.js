import React from 'react';
var mui = require('material-ui');
import { Link } from 'react-router';

var Tabs = mui.Tabs;
var Tab = mui.Tab;
import IconMenu from 'material-ui/lib/menus/icon-menu';
import IconButton from 'material-ui/lib/icon-button';
import MenuItem from 'material-ui/lib/menus/menu-item';
import FontIcon from 'material-ui/lib/font-icon';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';


var menuItems = [
  {route:"/", text:"Dashboard"},
  {route:"/devices", text:"Devices"},
  {route:"/software", text:"Software"},
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
      tabIndex: this._updateActive()
    };
  },
  componentWillMount: function() {
    this.setState({tabIndex: this._updateActive()});
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({tabIndex: this._updateActive()});
  },
  _updateActive: function() {
    return this.context.router.isActive({ pathname: '/' }, true) ? '0' :
      this.context.router.isActive('/devices') ? '1' :
      this.context.router.isActive('/software') ? '2' : 
      this.context.router.isActive('/deployments') ? '3' : '0';
  },
  _handleTabActive: function(tab) {
    this.context.router.push(tab.props.route);
  },
  render: function() {
    var tabHandler = this._handleTabActive;
    var menu = menuItems.map(function(item, index) {
      return (
        <Tab key={index}
          style={styles.tabs}
          route={item.route}
          label={item.text}
          value={index.toString()}
          onActive={tabHandler} />
      )
    });
    var iconButtonElement = <IconButton><FontIcon className="material-icons">settings</FontIcon></IconButton>;
    return (
      <div>
        <Toolbar style={{backgroundColor: "#fff"}}>
          <ToolbarGroup key={0} float="left">
              <Link to="/" id="logo"></Link>
          </ToolbarGroup>
          <ToolbarGroup key={1} float="right">
            <IconMenu desktop={true} style={{marginTop:"5"}} iconButtonElement={iconButtonElement}>
              <MenuItem primaryText="Settings" />
              <MenuItem primaryText="Manage users" />
              <MenuItem primaryText="Help" />
              <MenuItem primaryText="Logout" />
            </IconMenu>
          </ToolbarGroup>
        </Toolbar>
        <div id="header-nav">
          <Tabs
            value={this.state.tabIndex}
            inkBarStyle={styles.inkbar}>
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