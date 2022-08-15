import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';
import moment from 'moment';

import { Button, IconButton, ListItemText, ListItemSecondaryAction, Menu, MenuItem, Toolbar } from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ExitToApp as ExitIcon
} from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

import { initializeAppData, setFirstLoginAfterSignup, setSearchState, setSnackbar } from '../../actions/appActions';
import { getOnboardingState } from '../../actions/onboardingActions';
import { getUser, setHideAnnouncement, logoutUser, toggleHelptips } from '../../actions/userActions';
import { getToken } from '../../auth';
import { decodeSessionToken, extractErrorMessage, isEmpty } from '../../helpers';
import { getDocsVersion, getIsEnterprise, getUserCapabilities, getUserSettings } from '../../selectors';
import Tracking from '../../tracking';
import Announcement from './announcement';
import DemoNotification from './demonotification';
import DeviceNotifications from './devicenotifications';
import DeploymentNotifications from './deploymentnotifications';
import TrialNotification from './trialnotification';
import OfferHeader from './offerheader';

import logo from '../../../assets/img/headerlogo.png';
import enterpriseLogo from '../../../assets/img/headerlogo-enterprise.png';
import whiteLogo from '../../../assets/img/whiteheaderlogo.png';
import whiteEnterpriseLogo from '../../../assets/img/whiteheaderlogo-enterprise.png';
import UserConstants from '../../constants/userConstants';
import Search from '../common/search';

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

const useStyles = makeStyles()(theme => ({
  header: {
    minHeight: 'unset',
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(5),
    width: '100%',
    borderBottom: `1px solid ${theme.palette.grey[100]}`,
    display: 'grid',
    gridTemplateRows: theme.mixins.toolbar.minHeight
  },
  banner: { gridTemplateRows: `1fr ${theme.mixins.toolbar.minHeight}px` },
  buttonColor: { color: theme.palette.grey[600] },
  dropDown: { height: '100%', marginLeft: theme.spacing(0.5), textTransform: 'none' },
  exitIcon: { color: theme.palette.grey[600], fill: theme.palette.grey[600] },
  demoTrialAnnouncement: {
    fontSize: 14,
    height: '100%',
    maxHeight: theme.mixins.toolbar.minHeight,
    minWidth: 164,
    overflow: 'hidden'
  },
  demoAnnouncementIcon: {
    height: 16,
    color: theme.palette.primary.main,
    '&.MuiButton-textPrimary': {
      color: theme.palette.primary.main,
      height: 'inherit'
    }
  },
  redAnnouncementIcon: {
    color: theme.palette.error.dark
  }
}));

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
  isSearching,
  logoutUser,
  mode,
  multitenancy,
  organization,
  pendingDevices,
  searchTerm,
  setFirstLoginAfterSignup,
  setHideAnnouncement,
  setSearchState,
  showHelptips,
  toggleHelptips,
  user
}) => {
  const { classes } = useStyles();
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

  const onSearch = searchTerm => setSearchState({ searchTerm, page: 1 });

  const setHideOffer = () => {
    cookies.set('offer', currentOffer.name, { path: '/', maxAge: 2629746 });
    setHasOfferCookie(true);
  };

  const showOffer =
    isHosted && moment().isBefore(currentOffer.expires) && (organization.trial ? currentOffer.trial : currentOffer[organization.plan]) && !hasOfferCookie;

  const headerLogo = mode === 'dark' ? (isEnterprise ? whiteEnterpriseLogo : whiteLogo) : isEnterprise ? enterpriseLogo : logo;

  return (
    <Toolbar id="fixedHeader" className={showOffer ? `${classes.header} ${classes.banner}` : classes.header}>
      {showOffer && <OfferHeader docsVersion={docsVersion} onHide={setHideOffer} />}
      <div className="flexbox space-between">
        <div className="flexbox center-aligned">
          <Link to="/">
            <img id="logo" src={headerLogo} />
          </Link>
          {demo && <DemoNotification iconClassName={classes.demoAnnouncementIcon} sectionClassName={classes.demoTrialAnnouncement} docsVersion={docsVersion} />}
          {!!announcement && (
            <Announcement
              announcement={announcement}
              errorIconClassName={classes.redAnnouncementIcon}
              iconClassName={classes.demoAnnouncementIcon}
              sectionClassName={classes.demoTrialAnnouncement}
              onHide={setHideAnnouncement}
            />
          )}
          {organization.trial && (
            <TrialNotification
              expiration={organization.trial_expiration}
              iconClassName={classes.demoAnnouncementIcon}
              sectionClassName={classes.demoTrialAnnouncement}
            />
          )}
        </div>
        <Search isSearching={isSearching} searchTerm={searchTerm} onSearch={onSearch} />
        <div className="flexbox center-aligned">
          <DeviceNotifications pending={pendingDevices} total={acceptedDevices} limit={deviceLimit} />
          <DeploymentNotifications inprogress={inProgress} />
          <Button
            className={`header-dropdown ${classes.dropDown}`}
            onClick={e => setAnchorEl(e.currentTarget)}
            startIcon={<AccountCircleIcon className={classes.buttonColor} />}
            endIcon={anchorEl ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
          >
            {user.email}
          </Button>
          <Menu
            anchorEl={anchorEl}
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
              Help & support
            </MenuItem>
            <MenuItem onClick={onLogoutClick}>
              <ListItemText primary="Log out" />
              <ListItemSecondaryAction>
                <IconButton>
                  <ExitIcon className={classes.exitIcon} />
                </IconButton>
              </ListItemSecondaryAction>
            </MenuItem>
          </Menu>
        </div>
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
  setSearchState,
  toggleHelptips
};

const mapStateToProps = state => {
  const organization = !isEmpty(state.organization.organization) ? state.organization.organization : { plan: 'os', id: null };
  const { canManageUsers: allowUserManagement } = getUserCapabilities(state);
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
    isSearching: state.app.searchState.isSearching,
    multitenancy: state.app.features.hasMultitenancy || state.app.features.isEnterprise || state.app.features.isHosted,
    searchTerm: state.app.searchState.searchTerm,
    showHelptips: state.users.showHelptips,
    pendingDevices: state.devices.byStatus.pending.total,
    organization,
    user: state.users.byId[state.users.currentUser] || { email: '', id: null }
  };
};

export default connect(mapStateToProps, actionCreators)(Header);
