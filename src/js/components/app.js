import React from 'react';
import { matchPath, withRouter } from 'react-router-dom';

import PropTypes from 'prop-types';
import Header from './header/header';
import LeftNav from './leftnav';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RawTheme from '../themes/mender-theme.js';

import IdleTimer from 'react-idle-timer';

import { logout, updateMaxAge, expirySet } from '../auth';
import { preformatWithRequestID } from '../helpers';

import SharedSnackbar from '../components/common/sharedsnackbar';

import AppStore from '../stores/app-store';
import AppActions from '../actions/app-actions';
import { AppContext } from '../contexts/app-context';

var isDemoMode = false;
var _HostedAnnouncement = '';

class AppRoot extends React.Component {
  static childContextTypes = {
    muiTheme: PropTypes.object,
    router: PropTypes.object,
    location: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = this._getInitialState();
  }

  getChildContext() {
    var theme = getMuiTheme(RawTheme);
    return {
      muiTheme: theme,
      location: this.props.location
    };
  }

  _getInitialState() {
    return {
      currentUser: AppStore.getCurrentUser(),
      uploadInProgress: AppStore.getUploadInProgress(),
      timeout: 900000, // 15 minutes idle time,
      currentTab: this._updateActive(),
      version: AppStore.getMenderVersion(),
      docsVersion: AppStore.getDocsVersion(),
      globalSettings: AppStore.getGlobalSettings(),
      snackbar: AppStore.getSnackbar(),
      uploadArtifact: (meta, file) => this._uploadArtifact(meta, file),
      artifactProgress: 0
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
    this.setState(this._getInitialState());
  }
  _onIdle() {
    if (expirySet()) {
      // logout user and warn
      if (this.state.currentUser && !this.state.uploadInProgress) {
        logout();
        AppActions.setSnackbar('Your session has expired. You have been automatically logged out due to inactivity.');
      } else if (this.state.currentUser && this.state.uploadInProgress) {
        updateMaxAge();
      }
    }
  }
  _updateActive() {
    const pathParams = matchPath(this.props.location.pathname, { path: '/:location?' });
    switch (pathParams.location) {
    case 'devices':
      return '/devices';
    case 'artifacts':
      return '/artifacts';
    case 'deployments':
      return '/deployments';
    case 'help':
      return '/help';
    case 'settings':
      return '/settings';
    default:
      return '';
    }
  }
  _uploadArtifact(meta, file) {
    var self = this;
    AppActions.setUploadInProgress(true);
    var progress = percent => self.setState({ artifactProgress: percent });

    AppActions.setSnackbar('Uploading artifact');
    AppActions.uploadArtifact(meta, file, progress)
      .then(() => {
        self.setState({ artifactProgress: 0 });
        AppActions.setSnackbar('Upload successful', 5000);
        AppActions.setUploadInProgress(false);
      })
      .catch(err => {
        self.setState({ artifactProgress: 0 });
        AppActions.setUploadInProgress(false);
        try {
          var errMsg = err.res.body.error || '';
          AppActions.setSnackbar(preformatWithRequestID(err.res, `Artifact couldn't be uploaded. ${errMsg}`), null, 'Copy to clipboard');
        } catch (e) {
          console.log(e);
        }
      });
  }

  render() {
    return (
      <IdleTimer ref="idleTimer" element={document} idleAction={this._onIdle} timeout={this.state.timeout} format="MM-DD-YYYY HH:MM:ss.SSS">
        <div>
          <div className="header" id="fixedHeader">
            <Header
              announcement={_HostedAnnouncement}
              docsVersion={this.state.docsVersion}
              currentTab={this.state.currentTab}
              demo={isDemoMode}
              history={this.props.history}
              isLoggedIn={(this.state.currentUser || {}).hasOwnProperty('email')}
            />
          </div>

          <div className="wrapper">
            <div className="leftFixed leftNav">
              <LeftNav
                version={this.state.version}
                docsVersion={this.state.docsVersion}
                currentTab={this.state.currentTab}
                changeTab={tabIndex => this._changeTab(tabIndex)}
              />
            </div>
            <div className="rightFluid container">
              <AppContext.Provider value={this.state}>{this.props.children}</AppContext.Provider>
            </div>
          </div>

          <SharedSnackbar snackbar={this.state.snackbar} />
        </div>
      </IdleTimer>
    );
  }
}
const App = withRouter(AppRoot);
export default App;
