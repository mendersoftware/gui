import React from 'react';
import PropTypes from 'prop-types';
import { Link, matchPath } from 'react-router-dom';

import cookie from 'react-cookie';
import { isEmpty, decodeSessionToken, hashString } from '../../helpers';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import ReactTooltip from 'react-tooltip';
import { toggleHelptips, hideAnnouncement } from '../../utils/toggleuseroptions';
import { DevicesNav, ArtifactsNav, DeploymentsNav } from '../helptips/helptooltips';
import Linkify from 'react-linkify';
import DeviceNotifications from './devicenotifications';
import DeploymentNotifications from './deploymentnotifications';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';

import AnnounceIcon from '@material-ui/icons/Announcement';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import ExitIcon from '@material-ui/icons/ExitToApp';
import HelpIcon from '@material-ui/icons/Help';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Toolbar from '@material-ui/core/Toolbar';
import ToolbarGroup from '@material-ui/core/Toolbar';

var menuItems = [
  { route: '/', text: 'Dashboard' },
  { route: '/devices', text: 'Devices' },
  { route: '/artifacts', text: 'Artifacts' },
  { route: '/deployments', text: 'Deployments' }
];

export default class Header extends React.Component {
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
        this._hasArtifacts();
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
      this._hasArtifacts();
      this._checkShowHelp();
      this._getGlobalSettings();
    }
  }
  _getInitialState() {
    return {
      sessionId: cookie.load('JWT'),
      user: AppStore.getCurrentUser(),
      showHelptips: AppStore.showHelptips(),
      pendingDevices: AppStore.getTotalPendingDevices(),
      acceptedDevices: AppStore.getTotalAcceptedDevices(),
      artifacts: AppStore.getArtifactsRepo(),
      hasDeployments: AppStore.getHasDeployments(),
      multitenancy: AppStore.hasMultitenancy(),
      deviceLimit: AppStore.getDeviceLimit(),
      inProgress: AppStore.getNumberInProgress(),
      globalSettings: AppStore.getGlobalSettings()
    };
  }
  _onChange() {
    this.setState(this._getInitialState());
  }
  _checkHeaderInfo() {
    this._getDeviceLimit();
    this._deploymentsInProgress();
    this._hasDevices();
    this._hasPendingDevices();
    this._checkAnnouncement();
  }
  _getGlobalSettings() {
    return AppActions.getGlobalSettings()
      .then(settings => console.warn(settings))
      .catch(err => console.log('error', err));
  }
  _getDeviceLimit() {
    var self = this;
    return AppActions.getDeviceLimit().then(limit => self.setState({ deviceLimit: limit ? limit : 500 }));
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

  _hasDevices() {
    // check if any devices connected + accepted
    var self = this;
    return AppActions.getDeviceCount('accepted')
      .then(acceptedDevices => self.setState({ acceptedDevices }))
      .catch(err => console.log(err));
  }
  _hasPendingDevices() {
    // check if any devices connected + accepted
    var self = this;
    return AppActions.getDeviceCount('pending')
      .then(pendingDevices => self.setState({ pendingDevices }))
      .catch(err => console.log(err.error));
  }
  _hasArtifacts() {
    var self = this;
    return AppActions.getArtifacts()
      .then(artifacts => self.setState({ artifacts }))
      .catch(err => console.log(err));
  }
  _updateUsername() {
    var self = this;
    // get current user
    if (!self.state.gettingUser) {
      var userId = self.state.sessionId ? decodeSessionToken(self.state.sessionId) : decodeSessionToken(cookie.load('JWT'));
      if (!userId) {
        return Promise.reject();
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
    var dropdownLabel = (
      <span>
        <Icon className="material-icons" style={{ marginRight: '8px', top: '5px', fontSize: '20px', color: '#c7c7c7' }}>
          account_circle
        </Icon>
        {(this.state.user || {}).email}
      </span>
    );

    var helpPath = this.props.history.location.pathname.indexOf('/help') != -1;

    const { anchorEl } = self.state;

    var dropDownElement = (
      <div>
        <Button
          className="header-dropdown"
          // anchorOrigin={{ vertical: 'center', horizontal: 'middle' }}
          // targetOrigin={{ vertical: 'bottom', horizontal: 'middle' }}
          style={{ marginRight: '0', fontSize: '14px', paddingLeft: '4px', fill: 'rgb(0, 0, 0)' }}
          onClick={self.handleClick}
        >
          {dropdownLabel}
        </Button>
        <Menu anchorEl={anchorEl} onClose={self.handleClose} open={Boolean(anchorEl)}>
          <MenuItem component={Link} to="/settings">
            Settings
          </MenuItem>
          <MenuItem component={Link} to="/settings/my-account">
            My account
          </MenuItem>
          <MenuItem component={Link} to="/settings/my-organization" className={this.state.multitenancy ? null : 'hidden'}>
            My organization
          </MenuItem>
          <MenuItem component={Link} to="/settings/user-management">
            User management
          </MenuItem>
          <MenuItem onClick={toggleHelptips}>{this.state.showHelptips ? 'Hide help tooltips' : 'Show help tooltips'}</MenuItem>
          <MenuItem component={Link} to="/help">
            Help
          </MenuItem>
          <MenuItem onClick={() => self.onLogoutClick()}>
            <ListItemText primary="Log out" />
            <ListItemSecondaryAction>
              <IconButton>
                <ExitIcon style={{ color: '#c7c7c7', fill: '#c7c7c7' }} />
              </IconButton>
            </ListItemSecondaryAction>
          </MenuItem>
        </Menu>
      </div>
    );

    return (
      <div className={self.context.location.pathname === '/login' ? 'hidden' : null}>
        <Toolbar style={{ backgroundColor: '#fff' }}>
          <ToolbarGroup key={0}>
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
          </ToolbarGroup>

          <ToolbarGroup key={1} style={{ flexGrow: '2' }}>
            {this.props.announcement ? (
              <div id="announcement" className={this.state.showAnnouncement ? 'fadeInSlow' : 'fadeOutSlow'} style={{ display: 'flex', alignItems: 'center' }}>
                <AnnounceIcon className="red" style={{ marginRight: '4px', height: '18px', minWidth: '24px' }} />
                <Linkify properties={{ target: '_blank' }}>{this.props.announcement}</Linkify>
                <a onClick={() => this._hideAnnouncement()}>
                  <CloseIcon style={{ marginLeft: '4px', height: '16px', verticalAlign: 'bottom' }} />
                </a>
              </div>
            ) : null}
          </ToolbarGroup>

          <ToolbarGroup style={{ flexShrink: '0' }} key={2}>
            <DeviceNotifications pending={this.state.pendingDevices} total={this.state.acceptedDevices} limit={this.state.deviceLimit} />

            <DeploymentNotifications inprogress={this.state.inProgress} />
            {dropDownElement}
          </ToolbarGroup>
        </Toolbar>

        <div id="header-nav">
          {this.state.showHelptips && this.state.acceptedDevices && !this.state.artifacts.length && !matchPath('/artifacts') ? (
            <div>
              <div
                id="onboard-8"
                className="tooltip help highlight"
                data-tip
                data-for="artifact-nav-tip"
                data-event="click focus"
                style={{ left: '150px', top: '135px' }}
              >
                <HelpIcon />
              </div>
              <ReactTooltip id="artifact-nav-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                <ArtifactsNav />
              </ReactTooltip>
            </div>
          ) : null}

          {this.state.showHelptips &&
          !this.state.acceptedDevices &&
          !(this.state.pendingDevices && matchPath({ pathname: '/' }, true)) &&
          !matchPath('/devices') &&
          !helpPath ? (
              <div>
                <div
                  id="onboard-7"
                  className="tooltip help highlight"
                  data-tip
                  data-for="devices-nav-tip"
                  data-event="click focus"
                  style={{ left: '150px', top: '75px' }}
                >
                  <HelpIcon />
                </div>
                <ReactTooltip id="devices-nav-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                  <DevicesNav devices={this.state.pendingDevices} />
                </ReactTooltip>
              </div>
            ) : null}

          {this.state.showHelptips && !this.state.hasDeployments && this.state.acceptedDevices && this.state.artifacts.length && !matchPath('/deployments') ? (
            <div>
              <div
                id="onboard-11"
                className="tooltip help highlight"
                data-tip
                data-for="deployments-nav-tip"
                data-event="click focus"
                style={{ left: '150px', top: '196px' }}
              >
                <HelpIcon />
              </div>
              <ReactTooltip id="deployments-nav-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                <DeploymentsNav devices={this.state.acceptedDevices} />
              </ReactTooltip>
            </div>
          ) : null}

          {/*
          // TODO: find out what this was used for...
          <Tabs value={this.props.currentTab} onChange={() => this.changeTab()}>
            {menuItems.map((item, index) => (
              <Tab key={index} style={styles.tabs} label={item.text} value={item.route} />
            ))}
          </Tabs> */}
        </div>
      </div>
    );
  }
}
