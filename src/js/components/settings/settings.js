// Copyright 2017 Northern.tech AS
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
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom';

// material ui
import { Payment as PaymentIcon } from '@mui/icons-material';

import { Elements } from '@stripe/react-stripe-js';

import { TIMEOUTS } from '../../constants/appConstants';
import { versionCompare } from '../../helpers';
import { getCurrentUser, getIsEnterprise, getTenantCapabilities, getUserCapabilities, getUserRoles } from '../../selectors';
import LeftNav from '../common/left-nav';
import SelfUserManagement from '../settings/user-management/selfusermanagement';
import UserManagement from '../settings/user-management/usermanagement';
import Global from './global';
import Integrations from './integrations';
import Organization from './organization/organization';
import Roles from './roles';
import Upgrade from './upgrade';

let stripePromise = null;

const sectionMap = {
  'global-settings': { component: Global, text: () => 'Global settings', canAccess: () => true },
  'my-profile': { component: SelfUserManagement, text: () => 'My profile', canAccess: () => true },
  'organization-and-billing': {
    component: Organization,
    text: () => 'Organization and billing',
    canAccess: ({ hasMultitenancy }) => hasMultitenancy
  },
  'user-management': {
    component: UserManagement,
    text: () => 'User management',
    canAccess: ({ userCapabilities: { canManageUsers } }) => canManageUsers
  },
  'role-management': {
    component: Roles,
    text: () => 'Roles',
    canAccess: ({ currentUser, isEnterprise, userRoles: { isAdmin } }) => currentUser && isAdmin && isEnterprise
  },
  integrations: {
    component: Integrations,
    text: () => 'Integrations',
    canAccess: ({ userRoles: { isAdmin }, version }) => isAdmin && versionCompare(version, '3.2') > -1
  },
  upgrade: {
    component: Upgrade,
    icon: <PaymentIcon />,
    text: ({ isTrial }) => (isTrial ? 'Upgrade to a plan' : 'Upgrades and add-ons'),
    canAccess: ({ hasMultitenancy }) => hasMultitenancy
  }
};

export const Settings = ({ currentUser, hasMultitenancy, isEnterprise, isTrial, stripeAPIKey, tenantCapabilities, userCapabilities, userRoles, version }) => {
  const [loadingFinished, setLoadingFinished] = useState(!stripeAPIKey);
  const { section: sectionParam } = useParams();

  useEffect(() => {
    // Make sure to call `loadStripe` outside of a component’s render to avoid recreating
    // the `Stripe` object on every render - but don't initialize twice.
    if (!stripePromise) {
      import(/* webpackChunkName: "stripe" */ '@stripe/stripe-js').then(({ loadStripe }) => {
        if (stripeAPIKey) {
          stripePromise = loadStripe(stripeAPIKey).finally(() => setLoadingFinished(true));
        }
      });
    } else {
      const notStripePromise = new Promise(resolve => setTimeout(resolve, TIMEOUTS.debounceDefault));
      Promise.race([stripePromise, notStripePromise]).then(result => setLoadingFinished(result !== notStripePromise));
    }
  }, []);

  const checkDenyAccess = item =>
    currentUser.id && !item.canAccess({ currentUser, hasMultitenancy, isEnterprise, isTrial, tenantCapabilities, userCapabilities, userRoles, version });

  const getCurrentSection = (sections, section = sectionParam) => {
    if (!sections.hasOwnProperty(section) || checkDenyAccess(sections[section])) {
      return;
    }
    return sections[section];
  };

  const links = Object.entries(sectionMap).reduce((accu, [key, item]) => {
    if (!checkDenyAccess(item)) {
      accu.push({
        path: `/settings/${key}`,
        icon: item.icon,
        title: item.text({ isTrial })
      });
    }
    return accu;
  }, []);

  const section = getCurrentSection(sectionMap, sectionParam);
  if (!section) {
    return <Navigate to="/settings/my-profile" replace />;
  }
  const Component = section.component;
  return (
    <div className="tab-container with-sub-panels" style={{ minHeight: '95%' }}>
      <LeftNav sections={[{ itemClass: 'settingsNav', items: links, title: 'Settings' }]} />
      <div className="rightFluid padding-right">
        {loadingFinished && (
          <Elements stripe={stripePromise}>
            <Component />
          </Elements>
        )}
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
    userCapabilities: getUserCapabilities(state),
    userRoles: getUserRoles(state),
    version: state.app.versionInformation.Integration
  };
};

export default connect(mapStateToProps)(Settings);
