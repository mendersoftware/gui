import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIdleTimer, workerTimers } from 'react-idle-timer';
import Cookies from 'universal-cookie';

import { LinearProgress, IconButton, Tooltip } from '@mui/material';
import { Cancel as CancelIcon } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

import { getToken, updateMaxAge, expirySet } from '../auth';
import { cancelFileUpload, setSnackbar } from '../actions/appActions';
import { logoutUser, saveUserSettings, setAccountActivationCode, setShowConnectingDialog } from '../actions/userActions';
import { PrivateRoutes, PublicRoutes } from '../config/routes';
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
import { light as lightTheme, dark as darkTheme } from '../themes/Mender';
import SearchResult from './search-result';

const activationPath = '/activate';
const timeout = 900000; // 15 minutes idle time
const cookies = new Cookies();

const useStyles = makeStyles()(theme => ({
  progress: {
    backgroundColor: theme.palette.grey[600],
    gridColumn: 1,
    margin: '15px 0'
  }
}));

const UploadProgressBar = ({ cancelFileUpload, uploadProgress }) => {
  const { classes } = useStyles();
  return (
    Boolean(uploadProgress) && (
      <div id="progressBarContainer">
        <p className="align-center">Upload in progress ({Math.round(uploadProgress)}%)</p>
        <LinearProgress className={classes.progress} variant="determinate" value={uploadProgress} />
        <Tooltip title="Abort" placement="top">
          <IconButton onClick={cancelFileUpload} size="large">
            <CancelIcon />
          </IconButton>
        </Tooltip>
      </div>
    )
  );
};

export const AppRoot = ({
  cancelFileUpload,
  currentUser,
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
  const navigate = useNavigate();
  const { pathname = '', hash } = useLocation();

  useEffect(() => {
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
  }, []);

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
                <PrivateRoutes />
              </ErrorBoundary>
            </div>
            {onboardingComponent ? onboardingComponent : null}
            {showDismissHelptipsDialog && <ConfirmDismissHelptips />}
            {showDeviceConnectionDialog && <DeviceConnectionDialog onCancel={() => setShowConnectingDialog(false)} />}
          </>
        ) : (
          <PublicRoutes />
        )}
        <SharedSnackbar snackbar={snackbar} setSnackbar={setSnackbar} />
        <UploadProgressBar cancelFileUpload={cancelFileUpload} uploadProgress={uploadProgress} />
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

export default connect(mapStateToProps, actionCreators)(AppRoot);
