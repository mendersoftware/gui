import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';

// material ui
import { List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@material-ui/core';
import PaymentIcon from '@material-ui/icons/Payment';

import { Elements } from '@stripe/react-stripe-js';

import { getIsEnterprise, getUserRoles } from '../../selectors';
import SelfUserManagement from '../user-management/selfusermanagement';
import UserManagement from '../user-management/usermanagement';
import Organization from './organization';
import Roles from './roles';
import Global from './global';
import Upgrade from './upgrade';

let stripePromise = null;

export const Settings = ({ allowUserManagement, currentUser, hasMultitenancy, history, isAdmin, isEnterprise, match, stripeAPIKey, trial }) => {
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
    }
  }, []);

  const sectionMap = {
    'global-settings': { admin: false, enterprise: false, multitenancy: false, userManagement: false, component: <Global />, text: 'Global settings' },
    'my-profile': { admin: false, enterprise: false, multitenancy: false, userManagement: false, component: <SelfUserManagement />, text: 'My profile' },
    'organization-and-billing': {
      admin: false,
      enterprise: false,
      multitenancy: true,
      userManagement: false,
      component: <Organization />,
      text: 'Organization and billing'
    },
    'user-management': { admin: false, enterprise: false, multitenancy: false, userManagement: true, component: <UserManagement />, text: 'User management' },
    'role-management': { admin: true, enterprise: true, multitenancy: false, userManagement: false, component: <Roles />, text: 'Roles' },
    upgrade: {
      admin: true,
      enterprise: true,
      multitenancy: true,
      trial: true,
      userManagement: true,
      component: <Upgrade history={history} trial={trial} />,
      text: 'Upgrade to a plan'
    }
  };

  const checkDenyAccess = item =>
    (currentUser && item.admin && !isAdmin) ||
    (item.multitenancy && !hasMultitenancy) ||
    (item.enterprise && !isEnterprise) ||
    (item.userManagement && !allowUserManagement) ||
    (item.trial && !trial);

  const getCurrentSection = (sections, section = match.params.section) => {
    if (!sections.hasOwnProperty(section) || checkDenyAccess(sections[section])) {
      history.replace('/settings/my-profile');
      return sections['my-profile'];
    }
    return sections[section];
  };

  return (
    <div className="margin-top">
      <div className="leftFixed">
        <List>
          <ListSubheader>Settings</ListSubheader>
          {Object.entries(sectionMap).reduce((accu, [key, item]) => {
            if (!checkDenyAccess(item)) {
              accu.push(
                <ListItem component={NavLink} className="navLink settingsNav" to={`/settings/${key}`} key={key}>
                  <ListItemText>{item.text}</ListItemText>
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
      </div>
      <div className="rightFluid padding-right">
        {loadingFinished && <Elements stripe={stripePromise}>{getCurrentSection(sectionMap, match.params.section).component}</Elements>}
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  const currentUser = state.users.byId[state.users.currentUser];
  const plan = 'os';
  const trial = true;
  const { allowUserManagement, isAdmin } = getUserRoles(state);
  return {
    allowUserManagement,
    currentUser,
    isAdmin,
    isHosted: state.app.features.isHosted,
    isEnterprise: getIsEnterprise(state),
    hasMultitenancy: state.app.features.hasMultitenancy,
    plan,
    stripeAPIKey: state.app.stripeAPIKey,
    trial
  };
};

export default withRouter(connect(mapStateToProps)(Settings));
