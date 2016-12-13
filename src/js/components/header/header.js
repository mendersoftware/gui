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

var tooltip = {
  title: 'Settings & options',
  text: '<div class="development"><i class="material-icons">build</i>Under development</div>The Mender UI will soon allow you to change settings, manage your users and more via this menu.',
  selector: '.settings-menu-tooltip',
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
    var iconButtonElement = <IconButton className="settings-menu-tooltip" style={{marginTop: "5px"}}><FontIcon className="material-icons">settings</FontIcon></IconButton>;
    return (
      <div>
        <Toolbar style={{backgroundColor: "#fff"}}>
          <ToolbarGroup key={0} className="float-left">
              <Link to="/" id="logo"></Link>
          </ToolbarGroup>
          <ToolbarGroup key={1} className="float-right">
            {iconButtonElement}
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