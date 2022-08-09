import React, { useState } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';

// material ui
import { List, LinearProgress } from '@mui/material';
import { Error as ErrorIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';

import { cancelRequest } from '../../../actions/organizationActions';
import { ADDONS, PLANS } from '../../../constants/appConstants';
import Alert from '../../common/alert';
import CancelRequestDialog from '../dialogs/cancelrequest';
import OrganizationSettingsItem, { maxWidth } from './organizationsettingsitem';
import OrganizationPaymentSettings from './organizationpaymentsettings';
import { connect } from 'react-redux';
import { getIsEnterprise } from '../../../selectors';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(theme => ({
  deviceLimitBar: { backgroundColor: theme.palette.grey[500], margin: '15px 0' },
  wrapper: {
    backgroundColor: theme.palette.background.lightgrey,
    marginTop: theme.spacing(6),
    padding: theme.spacing(2),
    '&>h5': { marginTop: 0, marginBottom: 0 }
  }
}));

export const TrialExpirationNote = ({ trial_expiration }) => (
  <div className="flexbox centered muted">
    <ErrorIcon fontSize="small" />
    <span className="margin-left-small">
      Your trial expires in {moment().from(moment(trial_expiration), true)}. <Link to="/settings/upgrade">Upgrade to a paid plan</Link>
    </span>
  </div>
);

export const DeviceLimitExpansionNotification = ({ isTrial }) => (
  <div className="flexbox centered">
    <ErrorIcon className="muted margin-right-small" fontSize="small" />
    <div className="muted" style={{ marginRight: 4 }}>
      To increase your device limit,{' '}
    </div>
    {isTrial ? (
      <Link to="/settings/upgrade">upgrade to a paid plan</Link>
    ) : (
      <a href="mailto:contact@mender.io" target="_blank" rel="noopener noreferrer">
        contact our sales team
      </a>
    )}
    <div className="muted">.</div>
  </div>
);

export const CancelSubscriptionAlert = () => (
  <Alert className="margin-top-large" severity="error" style={{ maxWidth }}>
    <p>We&#39;ve started the process to cancel your plan and deactivate your account.</p>
    <p>
      We&#39;ll send you an email confirming your deactivation. If you have any question at all, contact us at{' '}
      <strong>
        <a href="mailto:support@mender.io">support@mender.io</a>
      </strong>
    </p>
  </Alert>
);

export const CancelSubscriptionButton = ({ handleCancelSubscription, isTrial }) => (
  <p className="margin-left-small margin-right-small" style={{ maxWidth }}>
    <a href="" onClick={handleCancelSubscription}>
      {isTrial ? 'End trial' : 'Cancel subscription'} and deactivate account
    </a>
  </p>
);

export const Billing = ({ acceptedDevices, cancelRequest, currentPlan, deviceLimit, isEnterprise, organization }) => {
  const [cancelSubscription, setCancelSubscription] = useState(false);
  const [cancelSubscriptionConfirmation, setCancelSubscriptionConfirmation] = useState(false);
  const { classes } = useStyles();

  const planName = PLANS[currentPlan].name;

  const enabledAddOns =
    organization.addons?.reduce((accu, addon) => {
      if (addon.enabled) {
        const { title } = ADDONS[addon.name];
        let addonPrice = '';
        if (!organization.trial && !isEnterprise) {
          const planAddon = ADDONS[addon.name][currentPlan] ? ADDONS[addon.name][currentPlan] : ADDONS[addon.name].os;
          addonPrice = ` - ${planAddon.price}`;
        }
        accu.push(`${title}${addonPrice}`);
      }
      return accu;
    }, []) || [];

  const cancelSubscriptionSubmit = async reason =>
    cancelRequest(organization.id, reason).then(() => {
      setCancelSubscription(false);
      setCancelSubscriptionConfirmation(true);
    });

  const handleCancelSubscription = e => {
    if (e !== undefined) {
      e.preventDefault();
    }
    setCancelSubscription(!cancelSubscription);
  };

  return (
    <div className={classes.wrapper}>
      <h5>Billing</h5>
      <List>
        <OrganizationSettingsItem
          title="Current plan"
          content={{
            action: { title: 'Compare product plans', internal: false, target: 'https://mender.io/plans/pricing' },
            description: organization.trial ? 'Trial' : planName
          }}
          notification={organization.trial ? <TrialExpirationNote trial_expiration={organization.trial_expiration} /> : null}
        />
        {deviceLimit > 0 && (
          <OrganizationSettingsItem
            title={`Device limit: ${acceptedDevices}/${deviceLimit}`}
            content={{}}
            secondary={<LinearProgress className={classes.deviceLimitBar} variant="determinate" value={(acceptedDevices * 100) / deviceLimit} />}
            notification={<DeviceLimitExpansionNotification isTrial={organization.trial} />}
          />
        )}
        <OrganizationSettingsItem
          title="Current add-ons"
          content={{
            action: { title: 'Purchase an add-on', internal: true, action: () => window.location.replace('#/settings/upgrade') },
            description: enabledAddOns.length ? enabledAddOns.join(', ') : `You currently don't have any add-ons`
          }}
          notification={organization.trial && <TrialExpirationNote trial_expiration={organization.trial_expiration} />}
          sideBarContent={
            <div className="margin-left-small margin-bottom">
              <a className="flexbox center-aligned" href="https://mender.io/plans/pricing" target="_blank" rel="noopener noreferrer">
                <div style={{ maxWidth: 200 }}>Compare plans and add-ons at mender.io</div>
                <OpenInNewIcon fontSize="small" />
              </a>
            </div>
          }
        />
        {!organization.trial && !isEnterprise && <OrganizationPaymentSettings />}
      </List>
      {cancelSubscriptionConfirmation ? (
        <CancelSubscriptionAlert />
      ) : (
        <CancelSubscriptionButton handleCancelSubscription={handleCancelSubscription} isTrial={organization.trial} />
      )}
      {cancelSubscription && <CancelRequestDialog onCancel={() => setCancelSubscription(false)} onSubmit={cancelSubscriptionSubmit} />}
    </div>
  );
};

const actionCreators = { cancelRequest };

const mapStateToProps = state => {
  const currentPlan = state.organization.organization.plan || 'os';
  return {
    acceptedDevices: state.devices.byStatus.accepted.total,
    currentPlan,
    deviceLimit: state.devices.limit,
    isEnterprise: getIsEnterprise(state),
    organization: state.organization.organization
  };
};
export default connect(mapStateToProps, actionCreators)(Billing);
