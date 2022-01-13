import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import { MuiThemeProvider } from '@material-ui/core/styles';

import './../less/main.less';
import { createTheme } from './themes/theme-manager';
import App from './components/app';
import store from './reducers';
import ErrorBoundary from './errorboundary';

function AppProviders() {
  const theme = createTheme();
  return (
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        <ErrorBoundary>
          <Router basename="/ui/#">
            <App />
          </Router>
        </ErrorBoundary>
      </MuiThemeProvider>
    </Provider>
  );
}

export const Main = () => {
  render(<AppProviders />, document.getElementById('main') || document.createElement('div'));
};
Main();
