import React from 'react';
import { Router, hashHistory } from 'react-router';
import { render } from 'react-dom';
import { MuiThemeProvider } from 'material-ui/styles';
var routes = require('./config/routes');

render(
  <MuiThemeProvider>
    <Router history={hashHistory}>{routes}</Router>
  </MuiThemeProvider>,
  document.getElementById('main')
);
