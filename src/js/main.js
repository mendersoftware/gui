import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import './../less/main.less';
import App from './components/app';
import ErrorBoundary from './errorboundary';
import store from './reducers';

const cache = createCache({
  key: 'mui',
  prepend: true
});

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

const welcomeMessage = `Welcome to the Mender project!

Does this page need fixes or improvements?

Open an issue, or contribute a fix to:

- https://github.com/mendersoftware/gui

🤝 Contribute to Mender: https://github.com/mendersoftware/mender/blob/master/CONTRIBUTING.md
🔎 Ask about problems, and report issues: https://hub.mender.io
🚀 We like your curiosity! Help us improve Mender by joining the team: https://northern.tech/careers
`;

export const Main = () => {
  console.log(welcomeMessage);
  render(<AppProviders />, document.getElementById('main') || document.createElement('div'));
};
Main();
