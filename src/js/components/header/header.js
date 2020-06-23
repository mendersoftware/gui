import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import Cookies from 'universal-cookie';
import Linkify from 'react-linkify';
import ReactTooltip from 'react-tooltip';
import ReactGA from 'react-ga';

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

import { logout } from '../../auth';
import { decodeSessionToken, hashString } from '../../helpers';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import DeviceNotifications from './devicenotifications';
import DeploymentNotifications from './deploymentnotifications';

import { getOnboardingState, setSnackbar } from '../../actions/appActions';
import { getDeploymentsByStatus } from '../../actions/deploymentActions';
import { getDeviceCount, getDeviceLimit, getDevicesByStatus, getDynamicGroups, getGroups } from '../../actions/deviceActions';
import { getReleases } from '../../actions/releaseActions';
import {
  getUser,
  getGlobalSettings,
  getRoles,
  getUserOrganization,
  logoutUser,
  saveUserSettings,
  setShowHelptips,
  toggleHelptips
} from '../../actions/userActions';

import { DEVICE_STATES } from '../../constants/deviceConstants';

export class Header extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      anchorEl: null,
      gettingUser: false,
      loggingOut: false
    };
    this.cookies = new Cookies();
  }

  componentDidUpdate(prevProps) {
    const sessionId = this.cookies.get('JWT');
    const { hasTrackingEnabled, organization, trackingCode, user } = this.props;
    if ((!sessionId || !user || !user.id || !user.email.length) && !this.state.gettingUser && !this.state.loggingOut) {
      this._updateUsername();
    }
    if (prevProps.hasTrackingEnabled !== hasTrackingEnabled && trackingCode && hasTrackingEnabled && user.id && organization.id) {
      ReactGA.initialize(trackingCode);
      ReactGA.set({ tenant: organization.id });
      ReactGA.set({ plan: organization.plan });
      ReactGA.set({ userId: user.id });
    }
  }

  componentDidMount() {
    // check logged in user
    if (this.props.isLoggedIn) {
      this._updateUsername();
    }
  }

  initializeHeaderData() {
    this._checkHeaderInfo();
    this._checkShowHelp();
    this.props.getDevicesByStatus(DEVICE_STATES.accepted);
    this.props.getDevicesByStatus(DEVICE_STATES.pending);
    this.props.getDeviceLimit();
    this.props.getGlobalSettings().then(() => {
      if (this.cookies.get('_ga') && typeof this.props.hasTrackingEnabled === 'undefined') {
        this.props.saveUserSettings({ trackingConsentGiven: true });
      }
    });
    this.props.getDynamicGroups();
    this.props.getGroups();
    this.props.getReleases();
    this.props.getRoles();
    if (this.props.multitenancy) {
      this.props.getUserOrganization();
    }
  }

  _checkHeaderInfo() {
    // check if deployments in progress
    this.props.getDeploymentsByStatus('inprogress');
    this._checkAnnouncement();
  }

  _checkShowHelp() {
    //checks if user id is set and if cookie for helptips exists for that user
    var userCookie = this.cookies.get(this.props.user.id);
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
    var announceCookie = this.cookies.get(this.props.user.id + hash);
    if (hash && typeof announceCookie === 'undefined') {
      this.setState({ showAnnouncement: true, hash: hash });
    } else {
      this.setState({ showAnnouncement: false });
    }
  }

  _hideAnnouncement() {
    if (this.props.user.id) {
      this.cookies.set(this.props.user.id + this.state.hash, true, { maxAge: 604800 });
    }
    this.setState({ showAnnouncement: false });
  }

  _updateUsername() {
    const userId = decodeSessionToken(this.cookies.get('JWT'));
    if (this.state.gettingUser || !userId) {
      return;
    }
    const self = this;
    self.setState({ gettingUser: true });
    // get current user
    return (
      self.props
        .getUser(userId)
        .then(() => {
          self.props.getOnboardingState();
          self.initializeHeaderData();
        })
        // this is allowed to fail if no user information are available
        .catch(err => console.log(err.res ? err.res.error : err))
        .finally(() => self.setState({ gettingUser: false }))
    );
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
    const self = this;
    self.setState({ gettingUser: false, loggingOut: true, anchorEl: null });
    clearAllRetryTimers(this.props.setSnackbar);
    self.props
      .logoutUser()
      .then(() => logout())
      .finally(() => self.setState({ loggingOut: false }));
  }
  render() {
    const self = this;
    const { anchorEl } = self.state;

    const {
      acceptedDevices,
      allowUserManagement,
      announcement,
      deviceLimit,
      docsVersion,
      inProgress,
      isEnterprise,
      location,
      multitenancy,
      pendingDevices,
      plan,
      showHelptips,
      toggleHelptips,
      user
    } = self.props;

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
          getContentAnchorEl={null}
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
          <MenuItem component={Link} to="/settings/my-profile">
            My profile
          </MenuItem>
          {multitenancy && (
            <MenuItem component={Link} to="/settings/my-organization">
              My organization
            </MenuItem>
          )}
          {allowUserManagement && (
            <MenuItem component={Link} to="/settings/user-management">
              User management
            </MenuItem>
          )}
          <MenuItem onClick={() => toggleHelptips()}>{showHelptips ? 'Hide help tooltips' : 'Show help tooltips'}</MenuItem>
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
      <div id="fixedHeader" className={`header ${location.pathname === '/login' || location.pathname == '/signup' ? 'hidden' : ''}`}>
        <Toolbar style={Object.assign({ backgroundColor: '#fff' }, toolbarStyle)}>
          <Toolbar key={0} style={toolbarStyle}>
            <Link to="/" id="logo" className={plan === 'enterprise' || isEnterprise ? 'enterprise' : ''} />

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
                    <a href={`https://docs.mender.io/${docsVersion}/administration/production-installation`} target="_blank">
                      See the documentation for help switching to production mode
                    </a>
                    .
                  </p>
                </ReactTooltip>
              </div>
            ) : null}
          </Toolbar>

          <Toolbar key={1} style={{ flexGrow: '2' }}>
            {announcement ? (
              <div id="announcement" className={this.state.showAnnouncement ? 'fadeInSlow' : 'fadeOutSlow'} style={{ display: 'flex', alignItems: 'center' }}>
                <AnnounceIcon className="red" style={{ marginRight: '4px', height: '18px', minWidth: '24px' }} />
                <p>
                  <Linkify properties={{ target: '_blank' }}>{announcement}</Linkify>
                </p>
                <CloseIcon style={{ marginLeft: '4px', height: '16px', verticalAlign: 'bottom' }} onClick={() => this._hideAnnouncement()} />
              </div>
            ) : null}
          </Toolbar>

          <Toolbar key={2} style={{ flexShrink: '0' }}>
            <DeviceNotifications pending={pendingDevices} total={acceptedDevices} limit={deviceLimit} />
            <DeploymentNotifications inprogress={inProgress} />
            {dropDownElement}
          </Toolbar>
        </Toolbar>
      </div>
    );
  }
}

const actionCreators = {
  getDeploymentsByStatus,
  getDeviceCount,
  getDeviceLimit,
  getDynamicGroups,
  getDevicesByStatus,
  getGlobalSettings,
  getGroups,
  getOnboardingState,
  getReleases,
  getRoles,
  getUser,
  getUserOrganization,
  logoutUser,
  saveUserSettings,
  setShowHelptips,
  setSnackbar,
  toggleHelptips
};

const mapStateToProps = state => {
  const organization = state.users.organization ? state.users.organization : { plan: 'os', id: null };
  const currentUser = state.users.byId[state.users.currentUser];
  let allowUserManagement = false;
  if (currentUser?.roles) {
    // TODO: move these + additional role checks into selectors
    const isAdmin = currentUser.roles.some(role => role === 'RBAC_ROLE_PERMIT_ALL');
    allowUserManagement =
      isAdmin ||
      currentUser.roles.some(role =>
        state.users.rolesById[role]?.permissions.some(
          permission => permission.action === 'http' && permission.object.value === '/api/management/v1/useradm/.*' && ['any'].includes(permission.object.type)
        )
      );
  }
  return {
    acceptedDevices: state.devices.byStatus.accepted.total,
    allowUserManagement,
    announcement: state.app.hostedAnnouncement,
    deviceLimit: state.devices.limit,
    demo: state.app.features.isDemoMode,
    docsVersion: state.app.docsVersion,
    hasTrackingEnabled: state.users.globalSettings[state.users.currentUser]?.trackingConsentGiven,
    inProgress: state.deployments.byStatus.inprogress.total,
    isEnterprise: state.app.features.isEnterprise || (state.app.features.isHosted && organization.plan === 'enterprise'),
    multitenancy: state.app.features.hasMultitenancy || state.app.features.isEnterprise || state.app.features.isHosted,
    showHelptips: state.users.showHelptips,
    pendingDevices: state.devices.byStatus.pending.total,
    organization,
    trackingCode: state.app.trackerCode,
    user: state.users.byId[state.users.currentUser] || { email: '', id: null }
  };
};

export default withRouter(connect(mapStateToProps, actionCreators)(Header));
