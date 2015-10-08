var React = require('react');
var Router = require('react-router');
var routes = require('./config/routes');

var injectTapEventPlugin = require("react-tap-event-plugin");

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();


Router.run(routes, function(Root) {
  React.render(<Root />, document.getElementById('main'));
});

