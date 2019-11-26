import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
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
import { clearAllRetryTimers } from '../../utils/retrytimer';
import DeviceNotifications from './devicenotifications';
import DeploymentNotifications from './deploymentnotifications';

import { getDeviceLimit } from '../../actions/deviceActions';
import { getReleases } from '../../actions/releaseActions';
import { getUser, getGlobalSettings, setShowHelptips, toggleHelptips } from '../../actions/userActions';
import { getOnboardingState, setSnackbar } from '../../actions/appActions';
import { getDeployments, getDeploymentCount } from '../../actions/deploymentActions';

export class Header extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      anchorEl: null
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const sessionId = cookie.load('JWT');
    if (!sessionId || isEmpty(this.props.user) || this.props.user === null) {
      this._updateUsername()
        .then(() => getOnboardingState())
        // this is allowed to fail if no user information are available
        .catch(e => console.log(e));
    } else if (prevState.sessionId !== this.state.sessionId) {
      this._hasDeployments();
      this.props.getReleases();
      this._checkShowHelp();
      this._checkHeaderInfo();
      this.props.getGlobalSettings();
    }
  }
  componentDidMount() {
    // check logged in user
    if (this.props.isLoggedIn) {
      this._updateUsername();
      this.props.getDeployments(1, 1);
      this._checkHeaderInfo();
      this.props.getReleases();
      this.props.getDeviceLimit();
      this._checkShowHelp();
      this.props.getGlobalSettings();
    }
  }

  _checkHeaderInfo() {
    // check if deployments in progress
    this.props.getDeploymentCount('inprogress');
    this._checkAnnouncement();
  }
  _checkShowHelp() {
    //checks if user id is set and if cookie for helptips exists for that user
    var userCookie = cookie.load(this.props.user.id);
    // if no user cookie set, do so via togglehelptips
    if (typeof userCookie === 'undefined' || typeof userCookie.help === 'undefined') {
      toggleHelptips();
    } else {
      // got user cookie but help value not set
      this.props.setShowHelptips(userCookie.help);
    }
  }
  _checkAnnouncement() {
    var hash = this.props.announcement ? hashString(this.props.announcement) : null;
    var announceCookie = cookie.load(this.props.user.id + hash);
    if (hash && typeof announceCookie === 'undefined') {
      this.setState({ showAnnouncement: true, hash: hash });
    } else {
      this.setState({ showAnnouncement: false });
    }
  }
  _hideAnnouncement() {
    if (this.props.user.id) {
      cookie.save(this.props.user.id + this.state.hash, true, { maxAge: 604800 });
    }
    this.setState({ showAnnouncement: false });
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
      return self.props
        .getUser(userId)
        .then(() => {
          self.setState({ gettingUser: false });
          self._checkShowHelp();
          self.props.getGlobalSettings();
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
    this.props.getGlobalSettings();
    this._checkHeaderInfo();
    this.props.setSnackbar('');
  }
  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };
  handleClose = () => {
    this.setState({ anchorEl: null });
  };
  onLogoutClick() {
    this.setState({ gettingUser: false, anchorEl: null });
    clearAllRetryTimers(this.props.setSnackbar);
    cookie.remove('JWT');
    this.props.history.push('/login');
  }
  render() {
    const self = this;
    const { anchorEl } = self.state;
    const { location, user } = self.props;

    const menuButtonColor = '#c7c7c7';

    var dropDownElement = (
      <div style={{ marginRight: '0', paddingLeft: '30px' }}>
        <Button className="header-dropdown" style={{ fontSize: '14px', fill: 'rgb(0, 0, 0)', textTransform: 'none' }} onClick={self.handleClick}>
          <AccountCircleIcon style={{ marginRight: '8px', top: '5px', fontSize: '20px', color: menuButtonColor }} />
          {user.email}
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
          {this.props.multitenancy ? (
            <MenuItem component={Link} to="/settings/my-organization">
              My organization
            </MenuItem>
          ) : null}
          <MenuItem component={Link} to="/settings/user-management">
            User management
          </MenuItem>
          <MenuItem onClick={toggleHelptips}>{this.props.showHelptips ? 'Hide help tooltips' : 'Show help tooltips'}</MenuItem>
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
      <div id="fixedHeader" className={`header ${location.pathname === '/login' ? 'hidden' : ''}`}>
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
            <DeploymentNotifications inprogress={this.props.inProgress} />
            {dropDownElement}
          </Toolbar>
        </Toolbar>
      </div>
    );
  }
}

const actionCreators = {
  getDeviceLimit,
  getDeployments,
  getDeploymentCount,
  getGlobalSettings,
  getOnboardingState,
  getReleases,
  getUser,
  setShowHelptips,
  setSnackbar,
  toggleHelptips
};

const mapStateToProps = state => {
  return {
    acceptedDevices: state.devices.byStatus.accepted.total,
    announcement: state.app.hostedAnnouncement,
    deviceLimit: state.devices.limit,
    demo: state.app.features.isDemoMode,
    docsVersion: state.app.docsVersion,
    inProgress: state.deployments.byStatus.inprogress.total,
    multitenancy: state.app.features.hasMultitenancy,
    showHelptips: state.users.showHelptips,
    pendingDevices: state.devices.byStatus.pending.total,
    user: state.users.byId[state.users.currentUser] || { email: '', id: null }
  };
};

export default withRouter(connect(mapStateToProps, actionCreators)(Header));
