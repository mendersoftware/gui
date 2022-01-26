import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/lab';
import AdapterMoment from '@mui/lab/AdapterMoment';
import withStyles from '@mui/styles/withStyles';

import './../less/main.less';
import App from './components/app';
import store from './reducers';
import ErrorBoundary from './errorboundary';

const cssVariables = ({ palette: p }) => ({
  '@global': {
    ':root': {
      '--mui-primary-main': p.primary.main,
      '--mui-secondary-main': p.secondary.main
    }
  }
});

const WrappedBaseline = withStyles(cssVariables)(CssBaseline);

function AppProviders() {
  const theme = createTheme();
  return (
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <WrappedBaseline />
            <ErrorBoundary>
              <Router basename="/ui/#">
                <App />
              </Router>
            </ErrorBoundary>
          </LocalizationProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </Provider>
  );
}

export const Main = () => {
  render(<AppProviders />, document.getElementById('main') || document.createElement('div'));
};
Main();
