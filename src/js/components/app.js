import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import IdleTimer from 'react-idle-timer';
import Cookies from 'universal-cookie';

import { getToken, updateMaxAge, expirySet } from '../auth';
import { logoutUser, saveUserSettings, setShowConnectingDialog } from '../actions/userActions';
import { privateRoutes, publicRoutes } from '../config/routes';
import { onboardingSteps } from '../constants/onboardingConstants';
import SharedSnackbar from '../components/common/sharedsnackbar';
import ErrorBoundary from '../errorboundary';
import { getOnboardingState } from '../selectors';
import { getOnboardingComponentFor } from '../utils/onboardingmanager';
import Tracking from '../tracking';
import LiveChatBox from './livechatbox';
import ConfirmDismissHelptips from './common/dialogs/confirmdismisshelptips';
import DeviceConnectionDialog from './common/dialogs/deviceconnectiondialog';
import Header from './header/header';
import LeftNav from './leftnav';

const timeout = 900000; // 15 minutes idle time

class AppRoot extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    this.cookies = new Cookies();
  }

  componentDidMount() {
    const { trackingCode } = this.props;
    if (trackingCode) {
      if (!this.cookies.get('_ga')) {
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
    const trackLocationChange = location => {
      // if we're on page whose path might contain sensitive device/ group/ deployment names etc. we sanitize the sent information before submission
      let page = location.pathname || '';
      if (location.pathname.includes('=') && (location.pathname.startsWith('/devices') || location.pathname.startsWith('/deployments'))) {
        const splitter = location.pathname.lastIndexOf('/');
        const filters = location.pathname.slice(splitter + 1);
        const keyOnlyFilters = filters.split('&').reduce((accu, item) => `${accu}:${item.split('=')[0]}&`, ''); // assume the keys to filter by are not as revealing as the values things are filtered by
        page = `${location.pathname.substring(0, splitter)}?${keyOnlyFilters.substring(0, keyOnlyFilters.length - 1)}`; // cut off the last & of the reduced filters string
      }
      Tracking.pageview(page);
    };
    this.props.history.listen(location => trackLocationChange(location));
    trackLocationChange(this.props.history.location);
  }

  onIdle() {
    if (expirySet() && this.props.currentUser) {
      // logout user and warn
      return this.props.logoutUser('Your session has expired. You have been automatically logged out due to inactivity.').catch(() => updateMaxAge());
    }
  }

  render() {
    const self = this;
    const { history, onboardingState, setShowConnectingDialog, showDeviceConnectionDialog, showDismissHelptipsDialog } = self.props;

    let onboardingComponent = getOnboardingComponentFor(onboardingSteps.APPLICATION_UPDATE_REMINDER_TIP, onboardingState, {
      anchor: {
        left: 170,
        top: 225
      },
      place: 'right'
    });
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.ARTIFACT_CREATION_DIALOG, onboardingState, {}, onboardingComponent);

    return (
      <>
        {getToken() ? (
          <>
            <IdleTimer element={document} onAction={updateMaxAge} onIdle={() => self.onIdle()} timeout={timeout} />
            <Header history={history} />
            <LeftNav className="leftFixed leftNav" />
            <div className="rightFluid container">
              <ErrorBoundary>{privateRoutes}</ErrorBoundary>
            </div>
            {onboardingComponent ? onboardingComponent : null}
            {showDismissHelptipsDialog && <ConfirmDismissHelptips />}
            {showDeviceConnectionDialog && <DeviceConnectionDialog onCancel={() => setShowConnectingDialog(false)} />}
            <LiveChatBox />
          </>
        ) : (
          publicRoutes
        )}
        <SharedSnackbar />
      </>
    );
  }
}

const actionCreators = { logoutUser, saveUserSettings, setShowConnectingDialog };

const mapStateToProps = state => {
  return {
    onboardingState: getOnboardingState(state),
    currentUser: state.users.currentUser,
    showDismissHelptipsDialog: !state.onboarding.complete && state.onboarding.showTipsDialog,
    showDeviceConnectionDialog: state.users.showConnectDeviceDialog,
    trackingCode: state.app.trackerCode
  };
};

export default compose(withRouter, connect(mapStateToProps, actionCreators))(AppRoot);
