import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactTooltip from 'react-tooltip';
import { Link } from 'react-router-dom';

// material ui
import { Button, List, LinearProgress } from '@material-ui/core';
import { Error as ErrorIcon, FileCopy as CopyPasteIcon, Info as InfoIcon, OpenInNew as OpenInNewIcon } from '@material-ui/icons';

import { cancelRequest, getUserOrganization } from '../../actions/organizationActions';
import { ADDONS, PLANS } from '../../constants/appConstants';
import { getIsEnterprise } from '../../selectors';
import { colors } from '../../themes/mender-theme';
import Alert from '../common/alert';
import ExpandableAttribute from '../common/expandable-attribute';
import CancelRequestDialog from './dialogs/cancelrequest';
import OrganizationSettingsItem, { maxWidth, padding } from './organizationsettingsitem';
import OrganizationPaymentSettings from './organizationpaymentsettings';

export const OrgHeader = () => (
  <div>
    <span style={{ paddingRight: 10 }}>Organization token</span>
    <div
      id="token-info"
      className="tooltip info"
      data-tip
      style={{ position: 'relative', display: 'inline', top: '6px' }}
      data-for="token-help"
      data-event="click focus"
    >
      <InfoIcon />
    </div>
    <ReactTooltip id="token-help" globalEventOff="click" place="top" type="light" effect="solid" style={{}} className="react-tooltip">
      <h3>Organization token</h3>
      <p style={{ color: '#DECFD9', margin: '1em 0' }}>
        This token is unique for your organization and ensures that only devices that you own are able to connect to your account.
      </p>
    </ReactTooltip>
  </div>
);

export const TrialExpirationNote = ({ trial_expiration }) => (
  <div className="flexbox centered text-muted">
    <ErrorIcon fontSize="small" />
    <span className="margin-left-small">
      Your trial expires in {moment().from(moment(trial_expiration), true)}. <Link to="/settings/upgrade">Upgrade to a paid plan</Link>
    </span>
  </div>
);

export const DeviceLimitExpansionNotification = ({ isTrial }) => (
  <div className="flexbox centered text-muted">
    <ErrorIcon fontSize="small" />
    <span className="margin-left-small">
      To increase your device limit,{' '}
      {isTrial ? (
        <Link to="/settings/upgrade">upgrade to a paid plan</Link>
      ) : (
        <a href="mailto:contact@mender.io" target="_blank" rel="noopener noreferrer">
          contact our sales team
        </a>
      )}
      .
    </span>
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

export const Organization = ({ cancelRequest, currentPlan = 'os', getUserOrganization, org, isEnterprise, isHosted, acceptedDevices, deviceLimit }) => {
  const [copied, setCopied] = useState(false);
  const [cancelSubscription, setCancelSubscription] = useState(false);
  const [cancelSubscriptionConfirmation, setCancelSubscriptionConfirmation] = useState(false);

  const planName = PLANS[currentPlan].name;

  const enabledAddOns =
    org.addons?.reduce((accu, addon) => {
      if (addon.enabled) {
        const { title } = ADDONS[addon.name];
        let addonPrice = '';
        if (!org.trial && !isEnterprise) {
          const planAddon = ADDONS[addon.name][currentPlan] ? ADDONS[addon.name][currentPlan] : ADDONS[addon.name].os;
          addonPrice = ` - ${planAddon.price}`;
        }
        accu.push(`${title}${addonPrice}`);
      }
      return accu;
    }, []) || [];

  useEffect(() => {
    getUserOrganization();
  }, []);

  const onCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };

  const cancelSubscriptionSubmit = async reason =>
    cancelRequest(org.id, reason).then(() => {
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
    <div className="margin-top-small">
      <h2 className="margin-top-small">Organization and billing</h2>
      <List>
        <OrganizationSettingsItem title="Organization name" content={{ action: { internal: true }, description: org.name }} />
        <OrganizationSettingsItem
          title={<OrgHeader />}
          content={{}}
          secondary={
            <ExpandableAttribute
              component="div"
              disableGutters
              dividerDisabled
              style={{ width: maxWidth - 2 * padding }}
              key="org_token"
              secondary={org.tenant_token}
              textClasses={{ secondary: 'break-all inventory-text tenant-token-text' }}
            />
          }
          sideBarContent={
            <div>
              <CopyToClipboard text={org.tenant_token} onCopy={onCopied}>
                <Button startIcon={<CopyPasteIcon />}>Copy to clipboard</Button>
              </CopyToClipboard>
              <div style={{ height: 30, padding: 15 }}>{copied && <span className="green fadeIn">Copied to clipboard.</span>}</div>
            </div>
          }
        />
        {isHosted && (
          <>
            <OrganizationSettingsItem
              title="Current plan"
              content={{
                action: { title: 'Compare product plans', internal: false, target: 'https://mender.io/plans/pricing' },
                description: org.trial ? 'Trial' : planName
              }}
              notification={org.trial ? <TrialExpirationNote trial_expiration={org.trial_expiration} /> : null}
            />
            {deviceLimit > 0 && (
              <OrganizationSettingsItem
                title={`Device limit: ${acceptedDevices}/${deviceLimit}`}
                content={{}}
                secondary={
                  <LinearProgress
                    variant="determinate"
                    style={{ backgroundColor: colors.grey, margin: '15px 0' }}
                    value={(acceptedDevices * 100) / deviceLimit}
                  />
                }
                notification={<DeviceLimitExpansionNotification isTrial={org.trial} />}
              />
            )}
            <OrganizationSettingsItem
              title="Current add-ons"
              content={{
                action: { title: 'Purchase an add-on', internal: true, action: () => window.location.replace('#/settings/upgrade') },
                description: enabledAddOns.length ? enabledAddOns.join(', ') : `You currently don't have any add-ons`
              }}
              notification={org.trial && <TrialExpirationNote trial_expiration={org.trial_expiration} />}
              sideBarContent={
                <div className="margin-left-small margin-bottom">
                  <a className="flexbox center-aligned" href="https://mender.io/plans/pricing" target="_blank" rel="noopener noreferrer">
                    <div style={{ maxWidth: 200 }}>Compare plans and add-ons at mender.io</div>
                    <OpenInNewIcon fontSize="small" />
                  </a>
                </div>
              }
            />
            {!org.trial && !isEnterprise && <OrganizationPaymentSettings />}
          </>
        )}
      </List>
      {isHosted && (
        <>
          {cancelSubscriptionConfirmation ? (
            <CancelSubscriptionAlert />
          ) : (
            <CancelSubscriptionButton handleCancelSubscription={handleCancelSubscription} isTrial={org.trial} />
          )}
          {cancelSubscription && <CancelRequestDialog onCancel={() => setCancelSubscription(false)} onSubmit={cancelSubscriptionSubmit} />}
        </>
      )}
    </div>
  );
};

const actionCreators = { cancelRequest, getUserOrganization };

const mapStateToProps = state => {
  const currentPlan = state.app.features.isHosted ? state.organization.organization && state.organization.organization.plan : 'enterprise';
  return {
    acceptedDevices: state.devices.byStatus.accepted.total,
    currentPlan,
    deviceLimit: state.devices.limit,
    isEnterprise: getIsEnterprise(state),
    isHosted: state.app.features.isHosted,
    org: state.organization.organization
  };
};

export default connect(mapStateToProps, actionCreators)(Organization);
