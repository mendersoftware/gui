var React = require('react');
var mui = require('material-ui');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

var Link = Router.Link;
var Tabs = mui.Tabs;
var Tab = mui.Tab;

var menuItems = [
  {route:"/", text:"Dashboard"},
  {route:"/updates", text:"Updates"},
  {route:"/nodes", text:"Nodes"},
  {route:"/software", text:"Software"}
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

var Header = React.createClass({
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
          onActive={tabHandler} />
      )
    });
    return (
      <div id="header-nav">
        <div id="logo"></div>
        <Tabs
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