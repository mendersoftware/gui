// Copyright 2015 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import {
  AccountCircle as AccountCircleIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ExitToApp as ExitIcon
} from '@mui/icons-material';
import { Button, IconButton, ListItemSecondaryAction, ListItemText, Menu, MenuItem, Toolbar } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import moment from 'moment';
import Cookies from 'universal-cookie';

import enterpriseLogo from '../../../assets/img/headerlogo-enterprise.png';
import logo from '../../../assets/img/headerlogo.png';
import whiteEnterpriseLogo from '../../../assets/img/whiteheaderlogo-enterprise.png';
import whiteLogo from '../../../assets/img/whiteheaderlogo.png';
import { setFirstLoginAfterSignup, setSearchState } from '../../actions/appActions';
import { getAllDeviceCounts } from '../../actions/deviceActions';
import { initializeSelf, logoutUser, setAllTooltipsReadState, setHideAnnouncement } from '../../actions/userActions';
import { TIMEOUTS } from '../../constants/appConstants';
import { READ_STATES } from '../../constants/userConstants';
import { isDarkMode } from '../../helpers';
import {
  getAcceptedDevices,
  getCurrentSession,
  getCurrentUser,
  getDeviceCountsByStatus,
  getDeviceLimit,
  getFeatures,
  getIsEnterprise,
  getOrganization,
  getShowHelptips,
  getUserCapabilities,
  getUserSettings
} from '../../selectors';
import Tracking from '../../tracking';
import { useDebounce } from '../../utils/debouncehook';
import Search from '../common/search';
import Announcement from './announcement';
import DemoNotification from './demonotification';
import DeploymentNotifications from './deploymentnotifications';
import DeviceNotifications from './devicenotifications';
import OfferHeader from './offerheader';
import TrialNotification from './trialnotification';

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
    display: 'grid'
  },
  banner: { gridTemplateRows: `1fr ${theme.mixins.toolbar.minHeight}px` },
  buttonColor: { color: theme.palette.grey[600] },
  dropDown: { height: '100%', marginLeft: theme.spacing(0.5), textTransform: 'none' },
  exitIcon: { color: theme.palette.grey[600], fill: theme.palette.grey[600] },
  demoTrialAnnouncement: {
    fontSize: 14,
    height: 'auto'
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

export const Header = ({ mode }) => {
  const { classes } = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [gettingUser, setGettingUser] = useState(false);
  const [hasOfferCookie, setHasOfferCookie] = useState(false);

  const organization = useSelector(getOrganization);
  const { canManageUsers: allowUserManagement } = useSelector(getUserCapabilities);
  const { total: acceptedDevices = 0 } = useSelector(getAcceptedDevices);
  const announcement = useSelector(state => state.app.hostedAnnouncement);
  const deviceLimit = useSelector(getDeviceLimit);
  const firstLoginAfterSignup = useSelector(state => state.app.firstLoginAfterSignup);
  const { trackingConsentGiven: hasTrackingEnabled } = useSelector(getUserSettings);
  const inProgress = useSelector(state => state.deployments.byStatus.inprogress.total);
  const isEnterprise = useSelector(getIsEnterprise);
  const { isDemoMode: demo, hasMultitenancy, isHosted } = useSelector(getFeatures);
  const { isSearching, searchTerm, refreshTrigger } = useSelector(state => state.app.searchState);
  const multitenancy = hasMultitenancy || isEnterprise || isHosted;
  const { pending: pendingDevices } = useSelector(getDeviceCountsByStatus);
  const user = useSelector(getCurrentUser);
  const { token } = useSelector(getCurrentSession);
  const userId = useDebounce(user.id, TIMEOUTS.debounceDefault);

  const dispatch = useDispatch();
  const deviceTimer = useRef();
  const showHelptips = useSelector(getShowHelptips);

  useEffect(() => {
    if ((!userId || !user.email?.length) && !gettingUser && token) {
      setGettingUser(true);
      dispatch(initializeSelf());
      return;
    }
    Tracking.setTrackingEnabled(hasTrackingEnabled);
    if (hasTrackingEnabled && user.id && organization.id) {
      Tracking.setOrganizationUser(organization, user);
      if (firstLoginAfterSignup) {
        Tracking.pageview('/signup/complete');
        dispatch(setFirstLoginAfterSignup(false));
      }
    }
  }, [dispatch, firstLoginAfterSignup, gettingUser, hasTrackingEnabled, organization, token, user, user.email, userId]);

  useEffect(() => {
    const showOfferCookie = cookies.get('offer') === currentOffer.name;
    setHasOfferCookie(showOfferCookie);
    clearInterval(deviceTimer.current);
    deviceTimer.current = setInterval(() => dispatch(getAllDeviceCounts()), TIMEOUTS.refreshDefault);
    return () => {
      clearInterval(deviceTimer.current);
    };
  }, [dispatch]);

  const onLogoutClick = () => {
    setAnchorEl(null);
    dispatch(logoutUser()).then(() => window.location.replace('/ui/'));
  };

  const onSearch = useCallback((searchTerm, refreshTrigger) => dispatch(setSearchState({ refreshTrigger, searchTerm, page: 1 })), [dispatch]);

  const onToggleTooltips = () => dispatch(setAllTooltipsReadState(showHelptips ? READ_STATES.read : READ_STATES.unread));

  const setHideOffer = () => {
    cookies.set('offer', currentOffer.name, { path: '/', maxAge: 2629746 });
    setHasOfferCookie(true);
  };

  const handleClose = () => setAnchorEl(null);

  const showOffer =
    isHosted && moment().isBefore(currentOffer.expires) && (organization.trial ? currentOffer.trial : currentOffer[organization.plan]) && !hasOfferCookie;

  const headerLogo = isDarkMode(mode) ? (isEnterprise ? whiteEnterpriseLogo : whiteLogo) : isEnterprise ? enterpriseLogo : logo;

  return (
    <Toolbar id="fixedHeader" className={showOffer ? `${classes.header} ${classes.banner}` : classes.header}>
      {!!announcement && (
        <Announcement
          announcement={announcement}
          errorIconClassName={classes.redAnnouncementIcon}
          iconClassName={classes.demoAnnouncementIcon}
          sectionClassName={classes.demoTrialAnnouncement}
          onHide={() => dispatch(setHideAnnouncement(true))}
        />
      )}
      {showOffer && <OfferHeader onHide={setHideOffer} />}
      <div className="flexbox space-between">
        <div className="flexbox center-aligned">
          <Link to="/">
            <img id="logo" src={headerLogo} />
          </Link>
          {demo && <DemoNotification iconClassName={classes.demoAnnouncementIcon} sectionClassName={classes.demoTrialAnnouncement} />}
          {organization.trial && (
            <TrialNotification
              expiration={organization.trial_expiration}
              iconClassName={classes.demoAnnouncementIcon}
              sectionClassName={classes.demoTrialAnnouncement}
            />
          )}
        </div>
        <Search isSearching={isSearching} searchTerm={searchTerm} onSearch={onSearch} trigger={refreshTrigger} />
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
            onClose={handleClose}
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
            <MenuItem component={Link} to="/settings" onClick={handleClose}>
              Settings
            </MenuItem>
            <MenuItem component={Link} to="/settings/my-profile" onClick={handleClose}>
              My profile
            </MenuItem>
            {multitenancy && (
              <MenuItem component={Link} to="/settings/organization-and-billing" onClick={handleClose}>
                My organization
              </MenuItem>
            )}
            {allowUserManagement && (
              <MenuItem component={Link} to="/settings/user-management" onClick={handleClose}>
                User management
              </MenuItem>
            )}
            <MenuItem onClick={onToggleTooltips}>{`Mark help tips as ${showHelptips ? '' : 'un'}read`}</MenuItem>
            <MenuItem component={Link} to="/help/get-started" onClick={handleClose}>
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

export default Header;
