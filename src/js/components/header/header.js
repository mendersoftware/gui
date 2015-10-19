var React = require('react');
var mui = require('material-ui');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var ValueLink = Router.ValueLink;

var Link = Router.Link;
var Tabs = mui.Tabs;
var Tab = mui.Tab;

var menuItems = [
  {route:"/", text:"Dashboard"},
  {route:"/devices", text:"Devices"},
  {route:"/software", text:"Software"},
  {route:"/updates", text:"Updates"},
];

var styles = {
  tabs: {
    backgroundColor: "#ffffff",
    color: "#414141"
  },
  inkbar: {
    backgroundColor: "#5d0f43"
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
    return (
      <div id="header-nav">
        <div id="logo"></div>
        <Tabs
          value={this.state.tabIndex}
          inkBarStyle={styles.inkbar}>
          {menu}
        </Tabs>
      </div>
    );
  }
});

Header.contextTypes = {
  router: React.PropTypes.func
};

module.exports = Header;