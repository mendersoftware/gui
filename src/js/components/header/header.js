import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { withTranslation } from 'react-i18next';

import { Button, IconButton, ListItemText, ListItemSecondaryAction, Menu, MenuItem, Toolbar } from '@material-ui/core';

import {
  AccountCircle as AccountCircleIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ExitToApp as ExitIcon
} from '@material-ui/icons';

import { getToken, logout } from '../../auth';
import { decodeSessionToken, hashString, isEmpty } from '../../helpers';
import { getDocsVersion, getIsEnterprise, getUserRoles, getUserSettings } from '../../selectors';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import Announcement from './announcement';
import DemoNotification from './demonotification';
import DeviceNotifications from './devicenotifications';
import DeploymentNotifications from './deploymentnotifications';
import TrialNotification from './trialnotification';

import { getOnboardingState, setFirstLoginAfterSignup, setSnackbar } from '../../actions/appActions';
import { getDeploymentsByStatus } from '../../actions/deploymentActions';
import { getDeviceLimit, getDevicesByStatus, getDynamicGroups, getGroups } from '../../actions/deviceActions';
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
        .then(() => {
          self.props.getOnboardingState();
          self.initializeHeaderData();
        })
        // this is allowed to fail if no user information are available
        .catch(err => console.log(err.response ? err.response.data.error : err))
        .finally(() => self.setState({ gettingUser: false }))
    );
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
      t,
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
            {t('settings.title')}
          </MenuItem>
          <MenuItem component={Link} to="/settings/my-profile">
            {t('settings.user')}
          </MenuItem>
          {multitenancy && (
            <MenuItem component={Link} to="/settings/my-organization">
              {t('settings.organization')}
            </MenuItem>
          )}
          {allowUserManagement && (
            <MenuItem component={Link} to="/settings/user-management">
              {t('settings.userManagement')}
            </MenuItem>
          )}
          <MenuItem onClick={toggleHelptips}>{t('settings.helpTooltips', { context: showHelptips })}</MenuItem>
          <MenuItem component={Link} to="/help/getting-started">
            {t('help.title')}
          </MenuItem>
          <MenuItem onClick={() => self.onLogoutClick()}>
            <ListItemText primary={t('logout')} />
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
  setFirstLoginAfterSignup,
  setShowHelptips,
  setSnackbar,
  toggleHelptips
};

const mapStateToProps = state => {
  const organization = !isEmpty(state.users.organization) ? state.users.organization : { plan: 'os', id: null };
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

export default withTranslation()(connect(mapStateToProps, actionCreators)(Header));
