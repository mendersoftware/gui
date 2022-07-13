import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
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

export const AppProviders = () => (
  <React.StrictMode>
    <Provider store={store}>
      <CacheProvider value={cache}>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <ErrorBoundary>
            <BrowserRouter basename="ui">
              <App />
            </BrowserRouter>
          </ErrorBoundary>
        </LocalizationProvider>
      </CacheProvider>
    </Provider>
  </React.StrictMode>
);

export const Main = () => {
  render(<AppProviders />, document.getElementById('main') || document.createElement('div'));
};
Main();
