import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';

// material ui
import { ListItemIcon } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';

import { Elements } from '@stripe/react-stripe-js';

import { versionCompare } from '../../helpers';
import { getCurrentUser, getIsEnterprise, getTenantCapabilities, getUserRoles } from '../../selectors';
import LeftNav from '../common/left-nav';
import SelfUserManagement from '../settings/user-management/selfusermanagement';
import UserManagement from '../settings/user-management/usermanagement';
import Organization from './organization/organization';
import Global from './global';
import Integrations from './integrations';
import Roles from './roles';
import Upgrade from './upgrade';
import { uiPermissionsById } from '../../constants/userConstants';

let stripePromise = null;

const sectionMap = {
  'global-settings': { component: <Global />, text: () => 'Global settings', canAccess: () => true },
  'my-profile': { component: <SelfUserManagement />, text: () => 'My profile', canAccess: () => true },
  'organization-and-billing': {
    component: <Organization />,
    text: () => 'Organization and billing',
    canAccess: ({ hasMultitenancy }) => hasMultitenancy
  },
  'user-management': {
    component: <UserManagement />,
    text: () => 'User management',
    canAccess: ({ userRoles: { uiPermissions } }) => uiPermissions.userManagement.includes(uiPermissionsById.manage.value)
  },
  'role-management': {
    component: <Roles />,
    text: () => 'Roles',
    canAccess: ({ currentUser, isEnterprise, userRoles: { isAdmin } }) => currentUser && isAdmin && isEnterprise
  },
  'integrations': {
    component: <Integrations />,
    text: () => 'Integrations',
    canAccess: ({ userRoles: { isAdmin }, version }) => isAdmin && versionCompare(version, '3.2') > -1
  },
  upgrade: {
    component: <Upgrade />,
    text: ({ isTrial }) => (isTrial ? 'Upgrade to a plan' : 'Upgrades and add-ons'),
    canAccess: ({ hasMultitenancy }) => hasMultitenancy
  }
};

const UpgradeIcon = () => (
  <ListItemIcon>
    <PaymentIcon />
  </ListItemIcon>
);

export const Settings = ({ currentUser, hasMultitenancy, isEnterprise, isTrial, match, stripeAPIKey, tenantCapabilities, userRoles, version }) => {
  const [loadingFinished, setLoadingFinished] = useState(!stripeAPIKey);

  useEffect(() => {
    // Make sure to call `loadStripe` outside of a component’s render to avoid recreating
    // the `Stripe` object on every render - but don't initialize twice.
    if (!stripePromise) {
      import(/* webpackChunkName: "stripe" */ '@stripe/stripe-js').then(({ loadStripe }) => {
        if (stripeAPIKey) {
          stripePromise = loadStripe(stripeAPIKey).then(args => {
            setLoadingFinished(true);
            return Promise.resolve(args);
          });
        }
      });
    } else {
      const notStripePromise = {};
      Promise.race([stripePromise, notStripePromise]).then(result => setLoadingFinished(result !== notStripePromise));
    }
  }, []);

  const checkDenyAccess = item => !item.canAccess({ currentUser, hasMultitenancy, isEnterprise, isTrial, tenantCapabilities, userRoles, version });

  const getCurrentSection = (sections, section = match.params.section) => {
    if (!sections.hasOwnProperty(section) || checkDenyAccess(sections[section])) {
      return;
    }
    return sections[section];
  };

  const links = Object.entries(sectionMap).reduce((accu, [key, item]) => {
    if (!checkDenyAccess(item)) {
      accu.push({
        path: `/settings/${key}`,
        secondaryAction: key === 'upgrade' ? <UpgradeIcon /> : null,
        title: item.text({ isTrial })
      });
    }
    return accu;
  }, []);

  const section = getCurrentSection(sectionMap, match.params.section);
  if (!section) {
    return <Redirect to="/settings/my-profile" />;
  }
  return (
    <div className="tab-container with-sub-panels" style={{ minHeight: '95%' }}>
      <LeftNav sections={[{ itemClass: 'settingsNav', items: links, title: 'Settings' }]} />
      <div className="rightFluid padding-right">{loadingFinished && <Elements stripe={stripePromise}>{section.component}</Elements>}</div>
    </div>
  );
};

const mapStateToProps = state => {
  const { trial: isTrial = false } = state.organization.organization;
  return {
    currentUser: getCurrentUser(state),
    hasMultitenancy: state.app.features.hasMultitenancy,
    isEnterprise: getIsEnterprise(state),
    isTrial,
    stripeAPIKey: state.app.stripeAPIKey,
    tenantCapabilities: getTenantCapabilities(state),
    userRoles: getUserRoles(state),
    version: state.app.versionInformation.Integration
  };
};

export default withRouter(connect(mapStateToProps)(Settings));
