import React from 'react';
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

import { colors } from '../../themes/mender-theme';
import logo from '../../../assets/img/headerlogo.png';
import enterpriseLogo from '../../../assets/img/headerlogo-enterprise.png';

const menuButtonColor = colors.grey;

// Change this when a new feature/offer is introduced
const currentOffer = {
  name: 'add-ons',
  expires: '2021-06-30',
  trial: true,
  os: true,
  professional: true,
  enterprise: true
};

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
    if ((!sessionId || !user?.id || !user.email.length) && !this.state.gettingUser && !this.state.loggingOut) {
      return this._updateUsername();
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
    this._offerBannerCookie();
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
        .getUser('me')
        .then(self.props.initializeAppData)
        // this is allowed to fail if no user information are available
        .catch(err => console.log(extractErrorMessage(err)))
        .then(self.props.getOnboardingState)
        .finally(() => self.setState({ gettingUser: false }))
    );
  }

  _offerBannerCookie() {
    const self = this;
    const offerCookie = this.cookies.get('offer') === currentOffer.name;
    self.setState({ offerCookie: offerCookie });
  }

  onLogoutClick() {
    this.setState({ gettingUser: false, loggingOut: true, anchorEl: null });
    this.props.logoutUser();
  }

  setHideOffer() {
    const self = this;
    this.cookies.set('offer', currentOffer.name, { path: '/', maxAge: 2629746 });
    self._offerBannerCookie();
  }

  render() {
    const self = this;
    const { anchorEl } = self.state;
    const {
      acceptedDevices,
      allowUserManagement,
      announcement,
      demo,
      deviceLimit,
      docsVersion,
      setHideAnnouncement,
      inProgress,
      isEnterprise,
      isHosted,
      multitenancy,
      organization,
      pendingDevices,
      showHelptips,
      toggleHelptips,
      user
    } = self.props;

    const showOffer =
      isHosted &&
      moment().isBefore(currentOffer.expires) &&
      (organization && organization.trial ? currentOffer.trial : currentOffer[organization.plan]) &&
      !self.state.offerCookie;
    return (
      <Toolbar
        id="fixedHeader"
        className={showOffer ? 'header banner' : 'header'}
        style={{ backgroundColor: '#fff', minHeight: 'unset', paddingLeft: 32, paddingRight: 40 }}
      >
        {showOffer && <OfferHeader docsVersion={docsVersion} organization={organization} onHide={() => self.setHideOffer()} />}
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
            <MenuItem component={Link} to="/help/get-started">
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
      </Toolbar>
    );
  }
}

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
