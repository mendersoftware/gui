var React = require('react');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Header = require('./header/header');

var mui = require('material-ui');
var ThemeManager = require('material-ui/lib/styles/theme-manager');
var RawTheme = require('material-ui/lib/styles/raw-themes/light-raw-theme');

var App = React.createClass({
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },
  getChildContext() { 
    return {
      muiTheme: ThemeManager.getMuiTheme(RawTheme)
    }
  },
  render: function() {
    return (
      <div className="wrapper">
        <div className="header">
          <Header />
        </div>
        <div className="container">
          <RouteHandler />
        </div>
      </div>
    )
  }
});

module.exports = App;