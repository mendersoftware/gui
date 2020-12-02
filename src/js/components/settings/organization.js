import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactTooltip from 'react-tooltip';
import { Link } from 'react-router-dom';

// material ui
import { Button, List, LinearProgress } from '@material-ui/core';
import { Error as ErrorIcon, FileCopy as CopyPasteIcon, Info as InfoIcon } from '@material-ui/icons';

import { cancelRequest, getUserOrganization } from '../../actions/organizationActions';
import { PLANS as plans } from '../../constants/appConstants';
import { getIsEnterprise } from '../../selectors';
import { colors } from '../../themes/mender-theme';
import Alert from '../common/alert';
import ExpandableAttribute from '../common/expandable-attribute';
import CancelRequestDialog from './dialogs/cancelrequest';
import OrganizationSettingsItem, { maxWidth } from './organizationsettingsitem';
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

export const EnterpriseModificationsNote = ({ orgName, mailBodyTexts }) => (
  <>
    <p className="info" style={{ marginLeft: 15, marginRight: 15, maxWidth }}>
      For changes to your plan or any other support questions, contact us at{' '}
      <a href={`mailto:support@mender.io?subject=${orgName}: Enterprise upgrade&body=${mailBodyTexts.upgrade}`} target="_blank" rel="noopener noreferrer">
        support@mender.io
      </a>
    </p>
    <p className="margin-left-small margin-right-small margin-bottom-none" style={{ maxWidth }}>
      <a href={`mailto:support@mender.io?subject=${orgName}: Update billing&body=${mailBodyTexts.billing}`} target="_blank" rel="noopener noreferrer">
        Request to update your billing details
      </a>
    </p>
  </>
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

export const Organization = ({ cancelRequest, currentPlan, getUserOrganization, org, isEnterprise, isHosted, acceptedDevices, deviceLimit }) => {
  const [copied, setCopied] = useState(false);
  const [cancelSubscription, setCancelSubscription] = useState(false);
  const [cancelSubscriptionConfirmation, setCancelSubscriptionConfirmation] = useState(false);

  const mailBodyTexts = {
    upgrade: `
Organization%20ID%3A%20
${org.id}
%0AOrganization%20name%3A%20
${org.name}
%0APlan%20name%3A%20
${plans[currentPlan]}
%0A%0AI%20would%20like%20to%20make%20a%20change%20to%20my%20Mender%20plan.`,
    billing: `
Organization%20ID%3A%20
${org.id}
%0AOrganization%20name%3A%20
${org.name}
%0APlan%20name%3A%20
${plans[currentPlan]}
%0A%0AI%20would%20like%20to%20make%20a%20change%20to%20my%20billing%20details.`
  };

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
        <div className="flexbox" style={{ alignItems: 'flex-end' }}>
          <ExpandableAttribute
            style={{ width: maxWidth, display: 'inline-block' }}
            key="org_token"
            primary={<OrgHeader />}
            secondary={org.tenant_token}
            textClasses={{ secondary: 'break-all inventory-text tenant-token-text' }}
          />
          <CopyToClipboard text={org.tenant_token} onCopy={onCopied}>
            <Button style={{ margin: '0 15px 15px' }} startIcon={<CopyPasteIcon />}>
              Copy to clipboard
            </Button>
          </CopyToClipboard>
          <div>
            <p style={{ marginBottom: 30 }}>{copied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
          </div>
        </div>
        {isHosted && (
          <>
            <OrganizationSettingsItem
              title="Current plan"
              content={{
                action: { title: 'Compare product plans', internal: false, target: 'https://mender.io/plans/pricing' },
                description: org.trial ? 'Trial' : plans[currentPlan]
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
            {!org.trial && !isEnterprise && <OrganizationPaymentSettings />}
          </>
        )}
      </List>
      {isEnterprise && <EnterpriseModificationsNote orgName={org.name} mailBodyTexts={mailBodyTexts} />}
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
