var React = require('react');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Header = require('./header/header');

var mui = require('material-ui');
var ThemeManager = require('material-ui/lib/styles/theme-manager');
var RawTheme = require('../themes/mender-theme.js');

var App = React.createClass({
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },
  getChildContext() { 
    var theme = ThemeManager.getMuiTheme(RawTheme);
    theme.raisedButton.textColor = "black";
    return {
      muiTheme: theme,
    };
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