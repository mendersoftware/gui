import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';
import moment from 'moment';

import { Button, IconButton, ListItemText, ListItemSecondaryAction, Menu, MenuItem, Toolbar } from '@material-ui/core';

import {
  AccountCircle as AccountCircleIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ExitToApp as ExitIcon
} from '@material-ui/icons';

import { initializeAppData, setFirstLoginAfterSignup, setSnackbar } from '../../actions/appActions';
import { getOnboardingState } from '../../actions/onboardingActions';
import { getUser, setHideAnnouncement, logoutUser, toggleHelptips } from '../../actions/userActions';
import { getToken } from '../../auth';
import { decodeSessionToken, extractErrorMessage, isEmpty } from '../../helpers';
import { getDocsVersion, getIsEnterprise, getUserRoles, getUserSettings } from '../../selectors';
import Tracking from '../../tracking';
import Announcement from './announcement';
import DemoNotification from './demonotification';
import DeviceNotifications from './devicenotifications';
import DeploymentNotifications from './deploymentnotifications';
import TrialNotification from './trialnotification';
import OfferHeader from './offerheader';

import menderTheme, { colors } from '../../themes/mender-theme';
import logo from '../../../assets/img/headerlogo.png';
import enterpriseLogo from '../../../assets/img/headerlogo-enterprise.png';
import UserConstants from '../../constants/userConstants';

const menuButtonColor = colors.grey;

// Change this when a new feature/offer is introduced
const currentOffer = {
  name: 'add-ons',
  expires: '2021-12-30',
  trial: true,
  os: true,
  professional: true,
  enterprise: true
};

const cookies = new Cookies();

export const Header = ({
  acceptedDevices,
  allowUserManagement,
  announcement,
  demo,
  deviceLimit,
  docsVersion,
  firstLoginAfterSignup,
  getOnboardingState,
  getUser,
  hasTrackingEnabled,
  initializeAppData,
  inProgress,
  isEnterprise,
  isHosted,
  logoutUser,
  multitenancy,
  organization,
  pendingDevices,
  setFirstLoginAfterSignup,
  setHideAnnouncement,
  showHelptips,
  toggleHelptips,
  user
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [gettingUser, setGettingUser] = useState(false);
  const [hasOfferCookie, setHasOfferCookie] = useState(false);

  const sessionId = getToken();

  useEffect(() => {
    if ((!sessionId || !user?.id || !user.email.length) && !gettingUser && !loggingOut) {
      updateUsername();
      return;
    }
    Tracking.setTrackingEnabled(hasTrackingEnabled);
    if (hasTrackingEnabled && user.id && organization.id) {
      Tracking.setOrganizationUser(organization, user);
      if (firstLoginAfterSignup) {
        Tracking.pageview('/signup/complete');
        setFirstLoginAfterSignup(false);
      }
    }
  }, [sessionId, user.id, user.email, gettingUser, loggingOut]);

  useEffect(() => {
    // updateUsername();
    const showOfferCookie = cookies.get('offer') === currentOffer.name;
    setHasOfferCookie(showOfferCookie);
  }, []);

  const updateUsername = () => {
    const userId = decodeSessionToken(getToken());
    if (gettingUser || !userId) {
      return;
    }
    setGettingUser(true);
    // get current user
    return (
      getUser(UserConstants.OWN_USER_ID)
        .then(initializeAppData)
        // this is allowed to fail if no user information are available
        .catch(err => console.log(extractErrorMessage(err)))
        .then(getOnboardingState)
        .finally(() => setGettingUser(false))
    );
  };

  const onLogoutClick = () => {
    setGettingUser(false);
    setLoggingOut(true);
    setAnchorEl(null);
    logoutUser();
  };

  const setHideOffer = () => {
    cookies.set('offer', currentOffer.name, { path: '/', maxAge: 2629746 });
    setHasOfferCookie(true);
  };

  const showOffer =
    isHosted &&
    moment().isBefore(currentOffer.expires) &&
    (organization && organization.trial ? currentOffer.trial : currentOffer[organization.plan]) &&
    !hasOfferCookie;
  return (
    <Toolbar
      id="fixedHeader"
      className={showOffer ? 'header banner' : 'header'}
      style={{
        minHeight: 'unset',
        paddingLeft: menderTheme.spacing(4),
        paddingRight: menderTheme.spacing(5)
      }}
    >
      {showOffer && <OfferHeader docsVersion={docsVersion} onHide={setHideOffer} />}
      <div className="flexbox">
        <Link to="/">
          <img id="logo" src={isEnterprise ? enterpriseLogo : logo} />
        </Link>
        {demo && <DemoNotification docsVersion={docsVersion} />}
        {!!announcement && <Announcement announcement={announcement} onHide={setHideAnnouncement} />}
        {organization?.trial && <TrialNotification expiration={organization.trial_expiration} />}
        <div style={{ flexGrow: '1' }}></div>
        <DeviceNotifications pending={pendingDevices} total={acceptedDevices} limit={deviceLimit} />
        <DeploymentNotifications inprogress={inProgress} />
        <Button
          className="header-dropdown"
          style={{ fontSize: 14, marginLeft: menderTheme.spacing(0.5), textTransform: 'none' }}
          onClick={e => setAnchorEl(e.currentTarget)}
          startIcon={<AccountCircleIcon style={{ color: menuButtonColor }} />}
          endIcon={anchorEl ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        >
          {user.email}
        </Button>
        <Menu
          anchorEl={anchorEl}
          getContentAnchorEl={null}
          onClose={() => setAnchorEl(null)}
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
          <MenuItem component={Link} to="/help/get-started">
            Help
          </MenuItem>
          <MenuItem onClick={onLogoutClick}>
            <ListItemText primary="Log out" />
            <ListItemSecondaryAction>
              <IconButton>
                <ExitIcon style={{ color: menuButtonColor, fill: menuButtonColor }} />
              </IconButton>
            </ListItemSecondaryAction>
          </MenuItem>
        </Menu>
      </div>
    </Toolbar>
  );
};

const actionCreators = {
  getOnboardingState,
  getUser,
  setHideAnnouncement,
  initializeAppData,
  logoutUser,
  setFirstLoginAfterSignup,
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
    isHosted: state.app.features.isHosted,
    multitenancy: state.app.features.hasMultitenancy || state.app.features.isEnterprise || state.app.features.isHosted,
    showHelptips: state.users.showHelptips,
    pendingDevices: state.devices.byStatus.pending.total,
    organization,
    user: state.users.byId[state.users.currentUser] || { email: '', id: null }
  };
};

export default connect(mapStateToProps, actionCreators)(Header);
