import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import cookie from 'react-cookie';
import Linkify from 'react-linkify';
import ReactTooltip from 'react-tooltip';

import { Button, IconButton, ListItemText, ListItemSecondaryAction, Menu, MenuItem, Toolbar } from '@material-ui/core';

import {
  AccountCircle as AccountCircleIcon,
  Announcement as AnnounceIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Close as CloseIcon,
  ExitToApp as ExitIcon,
  InfoOutlined as InfoIcon
} from '@material-ui/icons';

import { isEmpty, decodeSessionToken, hashString } from '../../helpers';
import { getOnboardingState } from '../../utils/onboardingmanager';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import { toggleHelptips, hideAnnouncement } from '../../utils/toggleuseroptions';
import DeviceNotifications from './devicenotifications';
import DeploymentNotifications from './deploymentnotifications';

import { getDeviceLimit } from '../../actions/deviceActions';
import { getReleases } from '../../actions/releaseActions';
import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';

export class Header extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
    location: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = this._getInitialState();
  }
  componentWillMount() {
    AppStore.changeListener(this._onChange.bind(this));
  }
  componentWillUnmount() {
    AppStore.removeChangeListener(this._onChange.bind(this));
  }
  componentDidUpdate(prevProps, prevState) {
    if (!this.state.sessionId || isEmpty(this.state.user) || this.state.user === null) {
      this._updateUsername();
    } else {
      if (prevState.sessionId !== this.state.sessionId) {
        this._hasDeployments();
        this.props.getReleases();
        this._checkShowHelp();
        this._checkHeaderInfo();
        this._getGlobalSettings();
      }
    }
  }
  componentDidMount() {
    // check logged in user
    if (this.props.isLoggedIn) {
      this._updateUsername();
      this._hasDeployments();
      this._checkHeaderInfo();
      this.props.getReleases();
      this.props.getDeviceLimit();
      this._checkShowHelp();
      this._getGlobalSettings();
    }
  }
  _getInitialState() {
    return {
      sessionId: cookie.load('JWT'),
      user: AppStore.getCurrentUser(),
      showHelptips: AppStore.showHelptips(),
      hasDeployments: AppStore.getHasDeployments(),
      multitenancy: AppStore.hasMultitenancy(),
      globalSettings: AppStore.getGlobalSettings()
    };
  }
  _onChange() {
    this.setState(this._getInitialState());
  }
  _checkHeaderInfo() {
    this._deploymentsInProgress();
    this._checkAnnouncement();
  }
  _getGlobalSettings() {
    return AppActions.getGlobalSettings().catch(err => console.log('error', err));
  }
  _checkShowHelp() {
    //checks if user id is set and if cookie for helptips exists for that user
    var userCookie = cookie.load(this.state.user.id);
    // if no user cookie set, do so via togglehelptips
    if (typeof userCookie === 'undefined' || typeof userCookie.help === 'undefined') {
      toggleHelptips();
    } else {
      // got user cookie but help value not set
      AppActions.setShowHelptips(userCookie.help);
    }
  }
  _checkAnnouncement() {
    var hash = this.props.announcement ? hashString(this.props.announcement) : null;
    var announceCookie = cookie.load(this.state.user.id + hash);
    if (hash && typeof announceCookie === 'undefined') {
      this.setState({ showAnnouncement: true, hash: hash });
    } else {
      this.setState({ showAnnouncement: false });
    }
  }
  _hideAnnouncement() {
    hideAnnouncement(this.state.hash);
    this.setState({ showAnnouncement: false });
  }
  _hasDeployments() {
    // check if *any* deployment exists, for onboarding help tips
    var self = this;
    return AppActions.getDeployments(1, 1)
      .then(deployments => self.setState({ hasDeployments: deployments.length }))
      .catch(err => console.log(err));
  }
  _deploymentsInProgress() {
    // check if deployments in progress
    var self = this;
    AppActions.getDeploymentCount('inprogress').then(inProgress => self.setState({ inProgress }));
  }

  _updateUsername() {
    var self = this;
    // get current user
    if (!self.state.gettingUser) {
      var userId = self.state.sessionId ? decodeSessionToken(self.state.sessionId) : decodeSessionToken(cookie.load('JWT'));
      if (!userId) {
        return;
      }
      self.setState({ gettingUser: true });
      return AppActions.getUser(userId)
        .then(user => {
          AppActions.setCurrentUser(user);
          self.setState({ user: user, gettingUser: false });
          self._checkShowHelp();
          self._getGlobalSettings();
          self._checkHeaderInfo();
        })
        .then(() => getOnboardingState(userId))
        .catch(err => {
          self.setState({ gettingUser: false });
          var errMsg = err.res.error;
          console.log(errMsg);
        });
    }
  }

  changeTab() {
    this._getGlobalSettings();
    this._checkHeaderInfo();
    AppActions.setSnackbar('');
  }
  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };
  handleClose = () => {
    this.setState({ anchorEl: null });
  };
  onLogoutClick() {
    this.setState({ gettingUser: false });
    clearAllRetryTimers();
    cookie.remove('JWT');
    this.context.router.history.push('/login');
  }
  render() {
    const self = this;
    const { anchorEl, user } = self.state;

    const menuButtonColor = '#c7c7c7';

    var dropDownElement = (
      <div style={{ marginRight: '0', paddingLeft: '30px' }}>
        <Button className="header-dropdown" style={{ fontSize: '14px', fill: 'rgb(0, 0, 0)', textTransform: 'none' }} onClick={self.handleClick}>
          <AccountCircleIcon style={{ marginRight: '8px', top: '5px', fontSize: '20px', color: menuButtonColor }} />
          {(user || {}).email}
          {anchorEl ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        </Button>
        <Menu
          anchorEl={anchorEl}
          onClose={self.handleClose}
          open={Boolean(anchorEl)}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
        >
          <MenuItem component={Link} to="/settings">
            Settings
          </MenuItem>
          <MenuItem component={Link} to="/settings/my-account">
            My account
          </MenuItem>
          {this.state.multitenancy ? (
            <MenuItem component={Link} to="/settings/my-organization">
              My organization
            </MenuItem>
          ) : null}
          <MenuItem component={Link} to="/settings/user-management">
            User management
          </MenuItem>
          <MenuItem onClick={toggleHelptips}>{this.state.showHelptips ? 'Hide help tooltips' : 'Show help tooltips'}</MenuItem>
          <MenuItem component={Link} to="/help/getting-started">
            Help
          </MenuItem>
          <MenuItem onClick={() => self.onLogoutClick()}>
            <ListItemText primary="Log out" />
            <ListItemSecondaryAction>
              <IconButton>
                <ExitIcon style={{ color: menuButtonColor, fill: menuButtonColor }} />
              </IconButton>
            </ListItemSecondaryAction>
          </MenuItem>
        </Menu>
      </div>
    );

    const toolbarStyle = { height: '56px', minHeight: 'unset', paddingLeft: '16px', paddingRight: '16px' };

    return (
      <div id="fixedHeader" className={`header ${self.context.location.pathname === '/login' ? 'hidden' : ''}`}>
        <Toolbar style={Object.assign({ backgroundColor: '#fff' }, toolbarStyle)}>
          <Toolbar key={0} style={toolbarStyle}>
            <Link to="/" id="logo" />

            {this.props.demo ? (
              <div id="demoBox">
                <a id="demo-info" data-tip data-for="demo-mode" data-event="click focus" data-offset="{'bottom': 15, 'right': 60}">
                  <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
                  Demo mode
                </a>

                <ReactTooltip id="demo-mode" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                  <h3>Demo mode</h3>
                  <p>
                    Mender is currently running in <b>demo mode</b>.
                  </p>
                  <p>
                    <a href={`https://docs.mender.io/${this.props.docsVersion}/administration/production-installation`} target="_blank">
                      See the documentation for help switching to production mode
                    </a>
                    .
                  </p>
                </ReactTooltip>
              </div>
            ) : null}
          </Toolbar>

          <Toolbar key={1} style={{ flexGrow: '2' }}>
            {this.props.announcement ? (
              <div id="announcement" className={this.state.showAnnouncement ? 'fadeInSlow' : 'fadeOutSlow'} style={{ display: 'flex', alignItems: 'center' }}>
                <AnnounceIcon className="red" style={{ marginRight: '4px', height: '18px', minWidth: '24px' }} />
                <Linkify properties={{ target: '_blank' }}>{this.props.announcement}</Linkify>
                <CloseIcon style={{ marginLeft: '4px', height: '16px', verticalAlign: 'bottom' }} onClick={() => this._hideAnnouncement()} />
              </div>
            ) : null}
          </Toolbar>

          <Toolbar key={2} style={{ flexShrink: '0' }}>
            <DeviceNotifications pending={this.props.pendingDevices} total={this.props.acceptedDevices} limit={this.props.deviceLimit} />
            <DeploymentNotifications inprogress={this.state.inProgress} />
            {dropDownElement}
          </Toolbar>
        </Toolbar>
      </div>
    );
  }
}

const actionCreators = { getDeviceLimit, getReleases };

const mapStateToProps = state => {
  return {
    deviceLimit: state.devices.limit,
    acceptedDevices: state.devices.byStatus.accepted.total,
    pendingDevices: state.devices.byStatus.pending.total
  };
};

export default connect(
  mapStateToProps,
  actionCreators
)(Header);
