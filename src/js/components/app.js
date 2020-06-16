import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import IdleTimer from 'react-idle-timer';
import ReactGA from 'react-ga';

import Header from './header/header';
import LeftNav from './leftnav';
import CreateArtifactDialog from './common/dialogs/createartifactdialog';
import ConfirmDismissHelptips from './common/dialogs/confirmdismisshelptips';
import DeviceConnectionDialog from './common/dialogs/deviceconnectiondialog';
import { logout, updateMaxAge, expirySet } from '../auth';
import { setSnackbar } from '../actions/appActions';
import { setShowConnectingDialog, setShowCreateArtifactDialog } from '../actions/userActions';
import SharedSnackbar from '../components/common/sharedsnackbar';
import { getOnboardingComponentFor } from '../utils/onboardingmanager';

import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = window.mender_environment.stripeAPIKey ? loadStripe(window.mender_environment.stripeAPIKey) : null;

const timeout = 900000; // 15 minutes idle time

class AppRoot extends React.PureComponent {
  componentDidMount() {
    this.props.history.listen(location => {
      // if we're on page whose path might contain sensitive device/ group/ deployment names etc. we sanitize the sent information before submission
      let page = location.pathname || '';
      if (location.pathname.includes('=') && (location.pathname.startsWith('/devices') || location.pathname.startsWith('/deployments'))) {
        const splitter = location.pathname.lastIndexOf('/');
        const filters = location.pathname.slice(splitter + 1);
        const keyOnlyFilters = filters.split('&').reduce((accu, item) => `${accu}:${item.split('=')[0]}&`, ''); // assume the keys to filter by are not as revealing as the values things are filtered by
        page = `${location.pathname.substring(0, splitter)}?${keyOnlyFilters.substring(0, keyOnlyFilters.length - 1)}`; // cut off the last & of the reduced filters string
      }
      ReactGA.pageview(page);
    });
  }

  onIdle() {
    if (expirySet() && this.props.currentUser) {
      // logout user and warn
      if (!this.props.artifactProgress) {
        this.props.setSnackbar('Your session has expired. You have been automatically logged out due to inactivity.');
        logout();
        return;
      }
      updateMaxAge();
    }
  }

  render() {
    const self = this;
    const {
      children,
      history,
      isLoggedIn,
      setShowConnectingDialog,
      setShowCreateArtifactDialog,
      showDismissHelptipsDialog,
      showDeviceConnectionDialog,
      showCreateArtifactDialog
    } = self.props;

    const onboardingComponent = getOnboardingComponentFor('application-update-reminder-tip', {
      anchor: {
        left: 170,
        top: 225
      },
      place: 'right'
    });

    return (
      <Elements stripe={stripePromise}>
        <IdleTimer element={document} onAction={updateMaxAge} onIdle={() => self.onIdle()} timeout={timeout} />
        <Header history={history} isLoggedIn={isLoggedIn} />
        <LeftNav className="leftFixed leftNav" />
        <div className="rightFluid container">{children}</div>
        {onboardingComponent ? onboardingComponent : null}
        <ConfirmDismissHelptips open={showDismissHelptipsDialog} />
        <CreateArtifactDialog
          open={showCreateArtifactDialog}
          onCancel={() => setShowCreateArtifactDialog(false)}
          onClose={() => {
            history.push('/releases');
            setShowCreateArtifactDialog(false);
          }}
        />
        <DeviceConnectionDialog open={showDeviceConnectionDialog} onCancel={() => setShowConnectingDialog(false)} />
        <SharedSnackbar />
      </Elements>
    );
  }
}

const actionCreators = { setShowConnectingDialog, setShowCreateArtifactDialog, setSnackbar };

const mapStateToProps = state => {
  return {
    artifactProgress: state.releases.uploadProgress,
    currentUser: state.users.currentUser,
    showDismissHelptipsDialog: !state.users.onboarding.complete && state.users.onboarding.showTipsDialog,
    showCreateArtifactDialog: state.users.onboarding.showCreateArtifactDialog,
    showDeviceConnectionDialog: state.users.onboarding.showConnectDeviceDialog
  };
};

export default compose(withRouter, connect(mapStateToProps, actionCreators))(AppRoot);
