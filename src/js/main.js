import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { LocalizationProvider } from '@mui/lab';
import AdapterMoment from '@mui/lab/AdapterMoment';
import CssBaseline from '@mui/material/CssBaseline';
import withStyles from '@mui/styles/withStyles';

import './../less/main.less';
import App from './components/app';
import store from './reducers';
import ErrorBoundary from './errorboundary';

const cache = createCache({
  key: 'mui',
  prepend: true
});

const cssVariables = ({ palette: p }) => ({
  '@global': {
    ':root': {
      '--mui-primary-main': p.primary.main,
      '--mui-secondary-main': p.secondary.main
    }
  }
});

export const WrappedBaseline = withStyles(cssVariables)(CssBaseline);

function AppProviders() {
  return (
    <Provider store={store}>
      <CacheProvider value={cache}>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <ErrorBoundary>
            <Router basename="/ui/#">
              <App />
            </Router>
          </ErrorBoundary>
        </LocalizationProvider>
      </CacheProvider>
    </Provider>
  );
}

export const Main = () => {
  render(<AppProviders />, document.getElementById('main') || document.createElement('div'));
};
Main();
