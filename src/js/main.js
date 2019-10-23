import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';
import './../hint.css';
import './../less/main.less';
import theme from './themes/mender-theme';
import routes from './config/routes';

render(
  <MuiThemeProvider theme={theme}>
    <Router basename="/ui/#">{routes}</Router>
  </MuiThemeProvider>,
  document.getElementById('main')
);
