import React, { useEffect, useState } from 'react';
import { useIdleTimer, workerTimers } from 'react-idle-timer';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import withStyles from '@mui/styles/withStyles';
import { makeStyles } from 'tss-react/mui';

import Cookies from 'universal-cookie';

import { parseEnvironmentInfo, setSnackbar } from '../actions/appActions';
import { logoutUser, saveUserSettings, setAccountActivationCode, setShowConnectingDialog } from '../actions/userActions';
import { expirySet, getToken, updateMaxAge } from '../auth';
import SharedSnackbar from '../components/common/sharedsnackbar';
import { PrivateRoutes, PublicRoutes } from '../config/routes';
import ErrorBoundary from '../errorboundary';
import { toggle } from '../helpers';
import { getUserSettings } from '../selectors';
import { dark as darkTheme, light as lightTheme } from '../themes/Mender';
import Tracking from '../tracking';
import DeviceConnectionDialog from './common/dialogs/deviceconnectiondialog';
import Footer from './footer';
import Header from './header/header';
import LeftNav from './leftnav';
import SearchResult from './search-result';

const activationPath = '/activate';
export const timeout = 900000; // 15 minutes idle time
const cookies = new Cookies();

const reducePalette =
  prefix =>
  (accu, [key, value]) => {
    if (value instanceof Object) {
      return {
        ...accu,
        ...Object.entries(value).reduce(reducePalette(`${prefix}-${key}`), {})
      };
    } else {
      accu[`${prefix}-${key}`] = value;
    }
    return accu;
  };

const cssVariables = ({ palette }) => {
  const muiVariables = Object.entries(palette).reduce(reducePalette('--mui'), {});
  return {
    '@global': {
      ':root': {
        ...muiVariables,
        '--mui-overlay': palette.grey[400]
      }
    }
  };
};

const WrappedBaseline = withStyles(cssVariables)(CssBaseline);

const useStyles = makeStyles()(() => ({
  public: {
    display: 'grid',
    gridTemplateRows: 'max-content 1fr max-content',
    height: '100vh',
    '.content': {
      alignSelf: 'center',
      justifySelf: 'center'
    }
  }
}));

export const AppRoot = ({
  currentUser,
  logoutUser,
  mode,
  parseEnvironmentInfo,
  setAccountActivationCode,
  setShowConnectingDialog,
  showDeviceConnectionDialog,
  setSnackbar,
  snackbar,
  trackingCode
}) => {
  const [showSearchResult, setShowSearchResult] = useState(false);
  const navigate = useNavigate();
  const { pathname = '', hash } = useLocation();

  useEffect(() => {
    parseEnvironmentInfo();
    if (!trackingCode) {
      return;
    }
    if (!cookies.get('_ga')) {
      Tracking.cookieconsent().then(({ trackingConsentGiven }) => {
        if (trackingConsentGiven) {
          Tracking.initialize(trackingCode);
          Tracking.pageview();
        }
      });
    } else {
      Tracking.initialize(trackingCode);
    }
    trackLocationChange(pathname);
  }, [trackingCode]);

  useEffect(() => {
    trackLocationChange(pathname);
    // the following is added to ensure backwards capability for hash containing routes & links (e.g. /ui/#/devices => /ui/devices)
    if (hash) {
      navigate(hash.substring(1));
    }
  }, [hash, pathname]);

  const trackLocationChange = pathname => {
    let page = pathname;
    // if we're on page whose path might contain sensitive device/ group/ deployment names etc. we sanitize the sent information before submission
    if (page.includes('=') && (page.startsWith('/devices') || page.startsWith('/deployments'))) {
      const splitter = page.lastIndexOf('/');
      const filters = page.slice(splitter + 1);
      const keyOnlyFilters = filters.split('&').reduce((accu, item) => `${accu}:${item.split('=')[0]}&`, ''); // assume the keys to filter by are not as revealing as the values things are filtered by
      page = `${page.substring(0, splitter)}?${keyOnlyFilters.substring(0, keyOnlyFilters.length - 1)}`; // cut off the last & of the reduced filters string
    } else if (page.startsWith(activationPath)) {
      setAccountActivationCode(page.substring(activationPath.length + 1));
      navigate('/settings/my-profile', { replace: true });
    }
    Tracking.pageview(page);
  };

  const onIdle = () => {
    if (expirySet() && currentUser) {
      // logout user and warn
      return logoutUser('Your session has expired. You have been automatically logged out due to inactivity.').catch(updateMaxAge);
    }
  };

  useIdleTimer({ crossTab: true, onAction: updateMaxAge, onActive: updateMaxAge, onIdle, syncTimers: 400, timeout, timers: workerTimers });

  const onToggleSearchResult = () => setShowSearchResult(toggle);

  const theme = createTheme(mode === 'dark' ? darkTheme : lightTheme);

  const { classes } = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <WrappedBaseline enableColorScheme />
      <>
        {getToken() ? (
          <div id="app">
            <Header mode={mode} />
            <LeftNav />
            <div className="rightFluid container">
              <ErrorBoundary>
                <SearchResult onToggleSearchResult={onToggleSearchResult} open={showSearchResult} />
                <PrivateRoutes />
              </ErrorBoundary>
            </div>
            {showDeviceConnectionDialog && <DeviceConnectionDialog onCancel={() => setShowConnectingDialog(false)} />}
          </div>
        ) : (
          <div className={classes.public}>
            <PublicRoutes />
            <Footer />
          </div>
        )}
        <SharedSnackbar snackbar={snackbar} setSnackbar={setSnackbar} />
      </>
    </ThemeProvider>
  );
};

const actionCreators = { logoutUser, parseEnvironmentInfo, saveUserSettings, setAccountActivationCode, setShowConnectingDialog, setSnackbar };

const mapStateToProps = state => {
  return {
    currentUser: state.users.currentUser,
    showDeviceConnectionDialog: state.users.showConnectDeviceDialog,
    snackbar: state.app.snackbar,
    trackingCode: state.app.trackerCode,
    mode: getUserSettings(state).mode
  };
};

export default connect(mapStateToProps, actionCreators)(AppRoot);
