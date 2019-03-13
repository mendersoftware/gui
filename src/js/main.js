import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from 'react-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from './themes/mender-theme';
import routes from './config/routes';

render(
  <MuiThemeProvider theme={theme}>
    <Router basename="/ui/#">{routes}</Router>
  </MuiThemeProvider>,
  document.getElementById('main')
);
