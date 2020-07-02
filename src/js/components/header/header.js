import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';

import { Button, IconButton, ListItemText, ListItemSecondaryAction, Menu, MenuItem, Toolbar } from '@material-ui/core';

import {
  AccountCircle as AccountCircleIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ExitToApp as ExitIcon
} from '@material-ui/icons';

import { logout } from '../../auth';
import { decodeSessionToken, hashString } from '../../helpers';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import Announcement from './announcement';
import DemoNotification from './demonotification';
import DeviceNotifications from './devicenotifications';
import DeploymentNotifications from './deploymentnotifications';
import TrialNotification from './trialnotification';

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

import Tracking from '../../tracking';
const menuButtonColor = '#c7c7c7';

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

  componentDidUpdate() {
    const sessionId = this.cookies.get('JWT');
    const { hasTrackingEnabled, organization, trackingCode, user } = this.props;
    if ((!sessionId || !user || !user.id || !user.email.length) && !this.state.gettingUser && !this.state.loggingOut) {
      this._updateUsername();
    }
    if (hasTrackingEnabled && user.id && organization.id) {
      if (Tracking.initialize(trackingCode)) {
        Tracking.set({ tenant: organization.id });
        Tracking.set({ plan: organization.plan });
        Tracking.set({ userId: user.id });
      }
    }
  }

  componentDidMount() {
    this._updateUsername();
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
    self.props.logoutUser().then(() => logout());
  }
  render() {
    const self = this;
    const { anchorEl, showAnnouncement } = self.state;

    const {
      acceptedDevices,
      allowUserManagement,
      announcement,
      demo,
      deviceLimit,
      docsVersion,
      inProgress,
      isEnterprise,
      multitenancy,
      organization,
      pendingDevices,
      plan,
      showHelptips,
      toggleHelptips,
      user
    } = self.props;

    return (
      <Toolbar id="fixedHeader" className="header" style={{ backgroundColor: '#fff', height: 56, minHeight: 'unset', paddingLeft: 32, paddingRight: 40 }}>
        <Link to="/" id="logo" className={plan === 'enterprise' || isEnterprise ? 'enterprise' : ''} />
        {demo && <DemoNotification docsVersion={docsVersion} />}
        {!!announcement && showAnnouncement && (
          <Announcement announcement={announcement} showAnnouncement={showAnnouncement} onHide={() => self._hideAnnouncement()} />
        )}
        {organization && organization.trial && <TrialNotification />}
        <div style={{ flexGrow: '1' }}></div>
        <DeviceNotifications pending={pendingDevices} total={acceptedDevices} limit={deviceLimit} />
        <DeploymentNotifications inprogress={inProgress} />
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
          <MenuItem onClick={toggleHelptips}>{showHelptips ? 'Hide help tooltips' : 'Show help tooltips'}</MenuItem>
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
      </Toolbar>
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
  const docsVersion = state.app.docsVersion ? `${state.app.docsVersion}/` : 'development/';
  return {
    acceptedDevices: state.devices.byStatus.accepted.total,
    allowUserManagement,
    announcement: state.app.hostedAnnouncement,
    deviceLimit: state.devices.limit,
    demo: state.app.features.isDemoMode,
    docsVersion: state.app.features.isHosted ? 'hosted/' : docsVersion,
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

export default connect(mapStateToProps, actionCreators)(Header);
