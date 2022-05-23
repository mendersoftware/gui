import React, { useEffect, useState } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { useIdleTimer, workerTimers } from 'react-idle-timer';
import Cookies from 'universal-cookie';

import { LinearProgress, IconButton, Tooltip } from '@mui/material';
import { Cancel as CancelIcon } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { getToken, updateMaxAge, expirySet } from '../auth';
import { cancelFileUpload, setSnackbar } from '../actions/appActions';
import { logoutUser, saveUserSettings, setAccountActivationCode, setShowConnectingDialog } from '../actions/userActions';
import { privateRoutes, publicRoutes } from '../config/routes';
import { onboardingSteps } from '../constants/onboardingConstants';
import SharedSnackbar from '../components/common/sharedsnackbar';
import ErrorBoundary from '../errorboundary';
import { getOnboardingState, getUserSettings } from '../selectors';
import Tracking from '../tracking';
import { getOnboardingComponentFor } from '../utils/onboardingmanager';
import ConfirmDismissHelptips from './common/dialogs/confirmdismisshelptips';
import DeviceConnectionDialog from './common/dialogs/deviceconnectiondialog';
import Header from './header/header';
import LeftNav from './leftnav';
import { WrappedBaseline } from '../main';
import { colors, light as lightTheme, dark as darkTheme } from '../themes/Mender';
import SearchResult from './search-result';

const activationPath = '/activate';
const timeout = 900000; // 15 minutes idle time
const cookies = new Cookies();

export const AppRoot = ({
  cancelFileUpload,
  currentUser,
  history,
  logoutUser,
  mode,
  onboardingState,
  setAccountActivationCode,
  setShowConnectingDialog,
  showDeviceConnectionDialog,
  showDismissHelptipsDialog,
  setSnackbar,
  snackbar,
  trackingCode,
  uploadProgress
}) => {
  const [showSearchResult, setShowSearchResult] = useState(false);

  useEffect(() => {
    if (trackingCode) {
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
    }
    history.listen(trackLocationChange);
    trackLocationChange(history.location);
  }, []);

  const trackLocationChange = location => {
    // if we're on page whose path might contain sensitive device/ group/ deployment names etc. we sanitize the sent information before submission
    let page = location.pathname || '';
    if (page.includes('=') && (page.startsWith('/devices') || page.startsWith('/deployments'))) {
      const splitter = page.lastIndexOf('/');
      const filters = page.slice(splitter + 1);
      const keyOnlyFilters = filters.split('&').reduce((accu, item) => `${accu}:${item.split('=')[0]}&`, ''); // assume the keys to filter by are not as revealing as the values things are filtered by
      page = `${page.substring(0, splitter)}?${keyOnlyFilters.substring(0, keyOnlyFilters.length - 1)}`; // cut off the last & of the reduced filters string
    } else if (page.startsWith(activationPath)) {
      setAccountActivationCode(page.substring(activationPath.length + 1));
      history.replace('/settings/my-profile');
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

  const onToggleSearchResult = () => setShowSearchResult(!showSearchResult);

  const onboardingComponent = getOnboardingComponentFor(onboardingSteps.ARTIFACT_CREATION_DIALOG, onboardingState);
  const containerProps = getToken() ? { id: 'app' } : { className: 'flexbox centered', style: { minHeight: '100vh' } };
  const theme = createTheme(mode === 'dark' ? darkTheme : lightTheme);
  return (
    <ThemeProvider theme={theme}>
      <WrappedBaseline enableColorScheme />
      <div {...containerProps}>
        {getToken() ? (
          <>
            <Header history={history} />
            <LeftNav />
            <div className="rightFluid container">
              <ErrorBoundary>
                <SearchResult onToggleSearchResult={onToggleSearchResult} open={showSearchResult} />
                {privateRoutes}
              </ErrorBoundary>
            </div>
            {onboardingComponent ? onboardingComponent : null}
            {showDismissHelptipsDialog && <ConfirmDismissHelptips />}
            {showDeviceConnectionDialog && <DeviceConnectionDialog onCancel={() => setShowConnectingDialog(false)} />}
          </>
        ) : (
          publicRoutes
        )}
        <SharedSnackbar snackbar={snackbar} setSnackbar={setSnackbar} />
        {Boolean(uploadProgress) && (
          <div id="progressBarContainer">
            <p className="align-center">Upload in progress ({Math.round(uploadProgress)}%)</p>
            <LinearProgress variant="determinate" style={{ backgroundColor: colors.grey, gridColumn: 1, margin: '15px 0' }} value={uploadProgress} />
            <Tooltip title="Abort" placement="top">
              <IconButton onClick={cancelFileUpload} size="large">
                <CancelIcon />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

const actionCreators = { cancelFileUpload, logoutUser, saveUserSettings, setAccountActivationCode, setShowConnectingDialog, setSnackbar };

const mapStateToProps = state => {
  return {
    currentUser: state.users.currentUser,
    onboardingState: getOnboardingState(state),
    showDismissHelptipsDialog: !state.onboarding.complete && state.onboarding.showTipsDialog,
    showDeviceConnectionDialog: state.users.showConnectDeviceDialog,
    snackbar: state.app.snackbar,
    trackingCode: state.app.trackerCode,
    mode: getUserSettings(state).mode,
    uploadProgress: state.app.uploadProgress
  };
};

export default compose(withRouter, connect(mapStateToProps, actionCreators))(AppRoot);
