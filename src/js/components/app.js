import React from 'react';
import PropTypes from 'prop-types';
import Header from './header/header';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RawTheme from '../themes/mender-theme.js';

var createReactClass = require('create-react-class');
var isDemoMode = false;

var App =createReactClass({
  childContextTypes: {
    location: PropTypes.object,
    muiTheme: PropTypes.object
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
          <Header demo={isDemoMode} history={this.props.history} />
        </div>
        <div className="container">
          {React.cloneElement(this.props.children)}
        </div>
      </div>
    )
  }
});

module.exports = App;