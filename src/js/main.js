import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import { MuiThemeProvider } from '@material-ui/core/styles';

import './../less/main.less';
import theme from './themes/mender-theme';
import App from './components/app';
import store from './reducers';
import ErrorBoundary from './errorboundary';

render(
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <ErrorBoundary>
        <Router basename="/ui/#">
          <App />
        </Router>
      </ErrorBoundary>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('main')
);
