import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';
import './../hint.css';
import './../less/main.less';
import theme from './themes/mender-theme';
import routes from './config/routes';
import store from './reducers';

render(
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <Router basename="/ui/#">{routes}</Router>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('main')
);
