import React from 'react';
import { withRouter } from 'react-router-dom';

import PropTypes from 'prop-types';
import Header from './header/header';
import LeftNav from './leftnav';

import IdleTimer from 'react-idle-timer';

import { logout, updateMaxAge, expirySet } from '../auth';
import { preformatWithRequestID, stringToBoolean } from '../helpers';

import SharedSnackbar from '../components/common/sharedsnackbar';

import AppStore from '../stores/app-store';
import AppActions from '../actions/app-actions';
import { AppContext } from '../contexts/app-context';
import { getOnboardingComponentFor } from '../utils/onboardingmanager';
import CreateArtifactDialog from './common/dialogs/createartifactdialog';
import ConfirmDismissHelptips from './common/dialogs/confirmdismisshelptips';
import DeviceConnectionDialog from './common/dialogs/deviceconnectiondialog';

const isDemoMode = mender_environment && stringToBoolean(mender_environment.isDemoMode);
const _HostedAnnouncement = mender_environment && mender_environment.hostedAnnouncement ? mender_environment.hostedAnnouncement : '';

class AppRoot extends React.Component {
  static childContextTypes = {
    muiTheme: PropTypes.object,
    router: PropTypes.object,
    location: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      artifactProgress: 0,
      version: AppStore.getIntegrationVersion(),
      docsVersion: AppStore.getDocsVersion(),
      timeout: 900000, // 15 minutes idle time,
      uploadArtifact: (meta, file) => this._uploadArtifact(meta, file),
      ...this._getState()
    };
  }

  getChildContext() {
    return {
      location: this.props.location
    };
  }

  _getState() {
    return {
      currentUser: AppStore.getCurrentUser(),
      uploadInProgress: AppStore.getUploadInProgress(),
      globalSettings: AppStore.getGlobalSettings(),
      snackbar: AppStore.getSnackbar(),
      showDismissHelptipsDialog: !AppStore.getOnboardingComplete() && AppStore.getShowOnboardingTipsDialog(),
      showCreateArtifactDialog: AppStore.getShowCreateArtifactDialog(),
      showDeviceConnectionDialog: AppStore.getShowConnectDeviceDialog()
    };
  }

  componentWillMount() {
    AppStore.changeListener(this._onChange.bind(this));
  }
  componentDidMount() {
    window.addEventListener('mousemove', updateMaxAge, false);
  }
  componentWillUnmount() {
    window.addEventListener('mousemove', updateMaxAge, false);
    AppStore.removeChangeListener(this._onChange.bind(this));
  }
  _onChange() {
    this.setState(this._getState());
  }
  _onIdle() {
    if (expirySet() && this.state.currentUser) {
      // logout user and warn
      if (!this.state.uploadInProgress) {
        logout();
        AppActions.setSnackbar('Your session has expired. You have been automatically logged out due to inactivity.');
        return;
      }
      updateMaxAge();
    }
  }

  _uploadArtifact(meta, file) {
    var self = this;
    var progress = percent => self.setState({ artifactProgress: percent });
    AppActions.setSnackbar('Uploading artifact');
    return new Promise((resolve, reject) =>
      AppActions.uploadArtifact(meta, file, progress)
        .then(() => AppActions.setSnackbar('Upload successful', 5000))
        .catch(err => {
          try {
            var errMsg = err.res.body.error || '';
            AppActions.setSnackbar(preformatWithRequestID(err.res, `Artifact couldn't be uploaded. ${errMsg}`), null, 'Copy to clipboard');
          } catch (e) {
            console.log(e);
          }
          reject();
        })
        .finally(() => {
          self.setState({ artifactProgress: 0 });
          resolve();
        })
    );
  }

  render() {
    const { snackbar, timeout, showDismissHelptipsDialog, showDeviceConnectionDialog, showCreateArtifactDialog, ...context } = this.state;

    const onboardingComponent = getOnboardingComponentFor('application-update-reminder-tip', {
      anchor: {
        left: 170,
        top: 225
      },
      place: 'right'
    });

    return (
      <IdleTimer element={document} idleAction={this._onIdle} timeout={timeout} format="MM-DD-YYYY HH:MM:ss.SSS">
        <Header
          announcement={_HostedAnnouncement}
          docsVersion={context.docsVersion}
          demo={isDemoMode}
          history={this.props.history}
          isLoggedIn={this.props.isLoggedIn}
        />

        <LeftNav className="leftFixed leftNav" version={context.version} docsVersion={context.docsVersion} />
        <div className="rightFluid container">
          <AppContext.Provider value={context}>{this.props.children}</AppContext.Provider>
        </div>
        {onboardingComponent ? onboardingComponent : null}
        <ConfirmDismissHelptips open={showDismissHelptipsDialog} />
        <CreateArtifactDialog open={showCreateArtifactDialog} onCancel={() => AppActions.setShowCreateArtifactDialog(false)} />
        <DeviceConnectionDialog open={showDeviceConnectionDialog} onCancel={() => AppActions.setShowConnectingDialog(false)} />
        <SharedSnackbar snackbar={snackbar} />
      </IdleTimer>
    );
  }
}
const App = withRouter(AppRoot);
export default App;
