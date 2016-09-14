import React from 'react';
import { Link } from 'react-router';
var AppActions = require('../../actions/app-actions');

import { Tabs, Tab } from 'material-ui/Tabs';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';


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

var tooltip = {
  title: 'Settings & options',
  text: '<div class="development"><i class="material-icons">build</i>Under development</div>The Mender UI will soon allow you to change settings, manage your users and more via the settings & options menu.',
  selector: '#settings-info',
  position: 'bottom-right',
  type: 'hover'
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
  componentDidMount: function() {
    this.props.addTooltip(tooltip);
  },
  _updateActive: function() {
    return this.context.router.isActive({ pathname: '/' }, true) ? '/' :
      this.context.router.isActive('/devices') ? '/devices' :
      this.context.router.isActive('/software') ? '/software' : 
      this.context.router.isActive('/deployments') ? '/deployments' : '/';
  },
  _handleTabActive: function(tab) {
    this.context.router.push(tab.props.value);
  },
  changeTab: function() {
    this.props.clearSteps();
    AppActions.setSnackbar("");
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
    var iconButtonElement = <IconButton><FontIcon className="material-icons">settings</FontIcon></IconButton>;
    return (
      <div>
        <Toolbar style={{backgroundColor: "#fff"}}>
          <ToolbarGroup key={0} className="float-left">
              <Link to="/" id="logo"></Link>
          </ToolbarGroup>
          <ToolbarGroup key={1} className="float-right">
            <IconMenu anchorOrigin={{vertical: 'bottom', horizontal:'left'}} desktop={true} style={{marginTop:"5px"}} iconButtonElement={iconButtonElement}>
              <MenuItem primaryText="Settings" disabled={true} />
              <MenuItem primaryText="Manage users" disabled={true} />
              <MenuItem primaryText="Help" disabled={true} />
              <MenuItem primaryText="Logout" disabled={true} />
            </IconMenu>
            <div id="settings-info" className="tooltip info">
              <FontIcon className="material-icons">info</FontIcon>
            </div>
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