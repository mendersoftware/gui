import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from 'react-dom';
import { MuiThemeProvider } from 'material-ui/styles';
import routes from './config/routes';

render(
  <MuiThemeProvider>
    <Router basename="/ui/#">{routes}</Router>
  </MuiThemeProvider>,
  document.getElementById('main')
);
