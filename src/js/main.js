import React from 'react';
import { Router, Route, hashHistory } from 'react-router';
import { render } from 'react-dom';
import { MuiThemeProvider } from 'material-ui/styles';
var routes = require('./config/routes');


import injectTapEventPlugin from 'react-tap-event-plugin';

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

render((
  <MuiThemeProvider>
    <Router history={hashHistory}>
      {routes}
    </Router>
  </MuiThemeProvider>
), document.getElementById('main'))
