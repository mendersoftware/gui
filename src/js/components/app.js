import React from 'react';
import Header from './header/header';

import mui from 'material-ui';
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import RawTheme from '../themes/mender-theme.js';

var App = React.createClass({
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },
  getChildContext() { 
    var theme = ThemeManager.getMuiTheme(RawTheme);
    return {
      muiTheme: theme,
    };
  },
  render: function() {
    return (
      <div className="wrapper">
        <div className="header">
          <Header history={this.props.history} />
        </div>
        <div className="container">
          {this.props.children}
        </div>
      </div>
    )
  }
});

module.exports = App;