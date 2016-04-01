import React from 'react';
import Header from './header/header';

import mui from 'material-ui';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';
import RawTheme from '../themes/mender-theme.js';

var App = React.createClass({
  childContextTypes: {
    location: React.PropTypes.object,
    muiTheme: React.PropTypes.object
  },
  getChildContext() { 
    var theme = getMuiTheme(RawTheme);
    return {
      muiTheme: theme,
      location: this.props.location
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