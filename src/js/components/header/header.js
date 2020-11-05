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

import { initializeAppData, setFirstLoginAfterSignup, setSnackbar } from '../../actions/appActions';
import { getOnboardingState } from '../../actions/onboardingActions';
import { getUser, logoutUser, setShowHelptips, toggleHelptips } from '../../actions/userActions';
import { getToken } from '../../auth';
import { decodeSessionToken, hashString, isEmpty } from '../../helpers';
import { getDocsVersion, getIsEnterprise, getUserRoles, getUserSettings } from '../../selectors';
import Tracking from '../../tracking';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import Announcement from './announcement';
import DemoNotification from './demonotification';
import DeviceNotifications from './devicenotifications';
import DeploymentNotifications from './deploymentnotifications';
import TrialNotification from './trialnotification';

import { colors } from '../../themes/mender-theme';

const menuButtonColor = colors.grey;

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
    const sessionId = getToken();
    const { firstLoginAfterSignup, hasTrackingEnabled, organization, setFirstLoginAfterSignup, user } = this.props;
    if ((!sessionId || !user || !user.id || !user.email.length) && !this.state.gettingUser && !this.state.loggingOut) {
      this._updateUsername();
    }
    Tracking.setTrackingEnabled(hasTrackingEnabled);
    if (hasTrackingEnabled && user.id && organization.id) {
      Tracking.setOrganizationUser(organization, user);
      if (firstLoginAfterSignup) {
        Tracking.pageview('/signup/complete');
        setFirstLoginAfterSignup(false);
      }
    }
  }

  componentDidMount() {
    this._updateUsername();
  }

  _checkShowHelp(userId) {
    //checks if user id is set and if cookie for helptips exists for that user
    const userCookie = this.cookies.get(userId);
    // if no user cookie set, do so via togglehelptips
    if (typeof userCookie === 'undefined' || typeof userCookie.help === 'undefined') {
      toggleHelptips();
    } else {
      // got user cookie but help value not set
      this.props.setShowHelptips(userCookie.help);
    }
  }

  _checkAnnouncement(userId) {
    const hash = this.props.announcement ? hashString(this.props.announcement) : null;
    const announceCookie = this.cookies.get(userId + hash);
    if (hash && typeof announceCookie === 'undefined') {
      this.setState({ showAnnouncement: true, hash });
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
    const userId = decodeSessionToken(getToken());
    if (this.state.gettingUser || !userId) {
      return;
    }
    const self = this;
    self.setState({ gettingUser: true });
    // get current user
    return (
      self.props
        .getUser(userId)
        .then(result => {
          const userId = result[1].id;
          self._checkAnnouncement(userId);
          self._checkShowHelp(userId);
          return this.props.initializeAppData();
        })
        // this is allowed to fail if no user information are available
        .catch(err => console.log(err.response ? err.response.data.error?.message : err))
        .then(self.props.getOnboardingState)
        .finally(() => self.setState({ gettingUser: false }))
    );
  }

  onLogoutClick() {
    this.setState({ gettingUser: false, loggingOut: true, anchorEl: null });
    clearAllRetryTimers(this.props.setSnackbar);
    this.props.logoutUser();
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
      showHelptips,
      toggleHelptips,
      user
    } = self.props;

    return (
      <Toolbar id="fixedHeader" className="header" style={{ backgroundColor: '#fff', height: 56, minHeight: 'unset', paddingLeft: 32, paddingRight: 40 }}>
        <Link to="/" id="logo" className={isEnterprise ? 'enterprise' : ''} />
        {demo && <DemoNotification docsVersion={docsVersion} />}
        {!!announcement && showAnnouncement && (
          <Announcement announcement={announcement} showAnnouncement={showAnnouncement} onHide={() => self._hideAnnouncement()} />
        )}
        {organization && organization.trial && <TrialNotification />}
        <div style={{ flexGrow: '1' }}></div>
        <DeviceNotifications pending={pendingDevices} total={acceptedDevices} limit={deviceLimit} />
        <DeploymentNotifications inprogress={inProgress} />
        <Button
          className="header-dropdown"
          style={{ fontSize: '14px', fill: 'rgb(0, 0, 0)', textTransform: 'none' }}
          onClick={e => self.setState({ anchorEl: e.currentTarget })}
        >
          <AccountCircleIcon style={{ marginRight: '8px', top: '5px', fontSize: '20px', color: menuButtonColor }} />
          {user.email}
          {anchorEl ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        </Button>
        <Menu
          anchorEl={anchorEl}
          getContentAnchorEl={null}
          onClose={() => self.setState({ anchorEl: null })}
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
            <MenuItem component={Link} to="/settings/organization-and-billing">
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
  getOnboardingState,
  getUser,
  initializeAppData,
  logoutUser,
  setFirstLoginAfterSignup,
  setShowHelptips,
  setSnackbar,
  toggleHelptips
};

const mapStateToProps = state => {
  const organization = !isEmpty(state.organization.organization) ? state.organization.organization : { plan: 'os', id: null };
  const { allowUserManagement } = getUserRoles(state);
  return {
    acceptedDevices: state.devices.byStatus.accepted.total,
    allowUserManagement,
    announcement: state.app.hostedAnnouncement,
    deviceLimit: state.devices.limit,
    demo: state.app.features.isDemoMode,
    docsVersion: getDocsVersion(state),
    firstLoginAfterSignup: state.app.firstLoginAfterSignup,
    hasTrackingEnabled: getUserSettings(state).trackingConsentGiven,
    inProgress: state.deployments.byStatus.inprogress.total,
    isEnterprise: getIsEnterprise(state),
    multitenancy: state.app.features.hasMultitenancy || state.app.features.isEnterprise || state.app.features.isHosted,
    showHelptips: state.users.showHelptips,
    pendingDevices: state.devices.byStatus.pending.total,
    organization,
    user: state.users.byId[state.users.currentUser] || { email: '', id: null }
  };
};

export default connect(mapStateToProps, actionCreators)(Header);
