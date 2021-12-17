import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';

// material ui
import { List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@material-ui/core';
import PaymentIcon from '@material-ui/icons/Payment';

import { Elements } from '@stripe/react-stripe-js';

import { versionCompare } from '../../helpers';
import { getCurrentUser, getIsEnterprise, getTenantCapabilities, getUserRoles } from '../../selectors';
import SelfUserManagement from '../user-management/selfusermanagement';
import UserManagement from '../user-management/usermanagement';
import Global from './global';
import Integrations from './integrations';
import Organization from './organization';
import Roles from './roles';
import Upgrade from './upgrade';

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
    canAccess: ({ userRoles: { allowUserManagement } }) => allowUserManagement
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
    component: <Upgrade history={history} />,
    text: ({ isTrial }) => (isTrial ? 'Upgrade to a plan' : 'Upgrades and add-ons'),
    canAccess: ({ hasMultitenancy }) => hasMultitenancy
  }
};

export const Settings = ({ currentUser, hasMultitenancy, isEnterprise, isTrial, history, match, stripeAPIKey, tenantCapabilities, userRoles, version }) => {
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
      history.replace('/settings/my-profile');
      return sections['my-profile'];
    }
    return sections[section];
  };

  return (
    <div className="tab-container with-sub-panels" style={{ minHeight: '95%' }}>
      <List className="leftFixed">
        <ListSubheader>Settings</ListSubheader>
        {Object.entries(sectionMap).reduce((accu, [key, item]) => {
          if (!checkDenyAccess(item)) {
            accu.push(
              <ListItem component={NavLink} className="navLink settingsNav" to={`/settings/${key}`} key={key}>
                <ListItemText>{item.text({ isTrial })}</ListItemText>
                {key === 'upgrade' ? (
                  <ListItemIcon>
                    <PaymentIcon />
                  </ListItemIcon>
                ) : null}
              </ListItem>
            );
          }
          return accu;
        }, [])}
      </List>
      <div className="rightFluid padding-right">
        {loadingFinished && <Elements stripe={stripePromise}>{getCurrentSection(sectionMap, match.params.section).component}</Elements>}
      </div>
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
