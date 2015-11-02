var React = require('react');
var mui = require('material-ui');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var ValueLink = Router.ValueLink;

var Link = Router.Link;
var Tabs = mui.Tabs;
var Tab = mui.Tab;
var IconMenu = mui.IconMenu;
var IconButton = mui.IconButton;
var MenuItem = require('material-ui/lib/menus/menu-item');
var FontIcon = mui.FontIcon;
var Toolbar = mui.Toolbar;
var ToolbarGroup = require('material-ui/lib/toolbar/toolbar-group');
var ToolbarTitle = require('material-ui/lib/toolbar/toolbar-title');


var menuItems = [
  {route:"/", text:"Dashboard"},
  {route:"/devices", text:"Devices"},
  {route:"/software", text:"Software"},
  {route:"/updates", text:"Updates"},
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

    return this.context.router.isActive('dashboard') ? '0' :
      this.context.router.isActive('devices') ? '1' :
      this.context.router.isActive('software') ? '2' : 
      this.context.router.isActive('updates') ? '3' : '0';
  },
  _handleTabActive: function(tab) {
    this.context.router.transitionTo(tab.props.route);
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
  router: React.PropTypes.func
};

module.exports = Header;