import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from 'react-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import routes from './config/routes';
import RawTheme from './themes/mender-theme.js';

const theme = createMuiTheme(RawTheme);

render(
  <MuiThemeProvider theme={theme}>
    <Router basename="/ui/#">{routes}</Router>
  </MuiThemeProvider>,
  document.getElementById('main')
);
