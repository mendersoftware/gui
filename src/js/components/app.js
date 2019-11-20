import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import PropTypes from 'prop-types';
import Header from './header/header';
import LeftNav from './leftnav';

import IdleTimer from 'react-idle-timer';

import { logout, updateMaxAge, expirySet } from '../auth';

import SharedSnackbar from '../components/common/sharedsnackbar';

import { setShowConnectingDialog, setShowCreateArtifactDialog } from '../actions/userActions';
import { AppContext } from '../contexts/app-context';
import { getOnboardingComponentFor } from '../utils/onboardingmanager';
import CreateArtifactDialog from './common/dialogs/createartifactdialog';
import ConfirmDismissHelptips from './common/dialogs/confirmdismisshelptips';
import DeviceConnectionDialog from './common/dialogs/deviceconnectiondialog';

class AppRoot extends React.Component {
  static childContextTypes = {
    muiTheme: PropTypes.object,
    router: PropTypes.object,
    location: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      timeout: 900000 // 15 minutes idle time,
    };
  }

  getChildContext() {
    return {
      location: this.props.location
    };
  }

  componentDidMount() {
    window.addEventListener('mousemove', updateMaxAge, false);
  }
  componentWillUnmount() {
    window.addEventListener('mousemove', updateMaxAge, false);
  }
  _onIdle() {
    if (expirySet() && this.props.currentUser) {
      // logout user and warn
      if (!this.props.uploadInProgress) {
        logout();
        this.props.setSnackbar('Your session has expired. You have been automatically logged out due to inactivity.');
        return;
      }
      updateMaxAge();
    }
  }

  render() {
    const { snackbar, timeout, ...context } = this.state;
    const { showDismissHelptipsDialog, showDeviceConnectionDialog, showCreateArtifactDialog } = this.props;

    const onboardingComponent = getOnboardingComponentFor('application-update-reminder-tip', {
      anchor: {
        left: 170,
        top: 225
      },
      place: 'right'
    });

    return (
      <IdleTimer element={document} idleAction={this._onIdle} timeout={timeout} format="MM-DD-YYYY HH:MM:ss.SSS">
        <Header history={this.props.history} isLoggedIn={this.props.isLoggedIn} />
        <LeftNav className="leftFixed leftNav" />
        {onboardingComponent ? onboardingComponent : null}
        <ConfirmDismissHelptips open={showDismissHelptipsDialog} />
        <CreateArtifactDialog open={showCreateArtifactDialog} onCancel={() => setShowCreateArtifactDialog(false)} />
        <DeviceConnectionDialog open={showDeviceConnectionDialog} onCancel={() => setShowConnectingDialog(false)} />
        <SharedSnackbar />
      </IdleTimer>
    );
  }
}

const actionCreators = { setShowConnectingDialog, setShowCreateArtifactDialog, setSnackbar };

const mapStateToProps = state => {
  return {
    artifactProgress: state.releases.artifactProgress,
    currentUser: state.users.currentUser,
    uploadInProgress: state.releases.uploadInProgress,
    showDismissHelptipsDialog: !state.users.onboarding.complete && state.users.onboarding.showTipsDialog,
    showCreateArtifactDialog: state.users.onboarding.showCreateArtifactDialog,
    showDeviceConnectionDialog: state.users.onboarding.showConnectDeviceDialog
  };
};

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    actionCreators
  )
)(AppRoot);
