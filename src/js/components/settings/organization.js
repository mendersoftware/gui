import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactTooltip from 'react-tooltip';
import { Link } from 'react-router-dom';

// material ui
import { Button, List, LinearProgress } from '@material-ui/core';
import { Error as ErrorIcon, FileCopy as CopyPasteIcon, Info as InfoIcon } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { cancelRequest, confirmCardUpdate, getCurrentCard, getUserOrganization, startCardUpdate } from '../../actions/organizationActions';
import { PLANS as plans } from '../../constants/appConstants';
import { colors } from '../../themes/mender-theme';
import Alert from '../common/alert';
import ExpandableAttribute from '../common/expandable-attribute';
import CancelRequestDialog from './dialogs/cancelrequest';
import OrganizationSettingsItem from './organizationsettingsitem';
import CardSection from './cardsection';

export const Organization = ({
  cancelRequest,
  card,
  confirmCardUpdate,
  getUserOrganization,
  org,
  hasUnpaid,
  isHosted,
  acceptedDevices,
  deviceLimit,
  setSnackbar,
  startCardUpdate
}) => {
  const [copied, setCopied] = useState(false);
  const [cancelSubscription, setCancelSubscription] = useState(false);
  const [cancelSubscriptionConfirmation, setCancelSubscriptionConfirmation] = useState(false);
  const [isUpdatingPaymentDetails, setIsUpdatingPaymentDetails] = useState(false);

  useEffect(() => {
    getUserOrganization();
    getCurrentCard();
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

  // const invoiceDate = moment();
  const { last4, expiration, brand } = card;
  const currentPlan = isHosted ? org && org.plan : 'enterprise';
  const orgHeader = (
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
  return (
    <div className="margin-top-small">
      <h2 className="margin-top-small">Organization and billing</h2>
      <List>
        <OrganizationSettingsItem title="Organization name" content={{ action: { internal: true }, description: org.name }} />
        <div className="flexbox" style={{ alignItems: 'flex-end' }}>
          <ExpandableAttribute
            style={{ width: '500px', display: 'inline-block' }}
            key="org_token"
            primary={orgHeader}
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
              notification={
                org.trial ? (
                  <div className="flexbox centered text-muted">
                    <ErrorIcon fontSize="small" />
                    <span className="margin-left-small">
                      Your trial expires in {moment().from(moment(org.trial_expiration), true)}. <Link to="/settings/upgrade">Upgrade to a paid plan</Link>
                    </span>
                  </div>
                ) : null
              }
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
                notification={
                  <div className="flexbox centered text-muted">
                    <ErrorIcon fontSize="small" />
                    <span className="margin-left-small">
                      To increase your device limit, <Link to="/settings/upgrade">upgrade {org.trial ? 'to a paid' : 'your'} plan</Link>.
                    </span>
                  </div>
                }
              />
            )}
            {!org.trial && (
              <>
                {/* <OrganizationSettingsItem
                  title="Next payment date"
                  content={{
                    action: { title: 'View invoices', internal: true, action: setShowInvoices },
                    description: invoiceDate.format('MMMM DD, YYYY')
                  }}
                  notification={<div className="text-muted">Your subscription will be charged automatically</div>}
                /> */}
                <OrganizationSettingsItem
                  title="Payment card"
                  content={{
                    action: { title: 'Update payment card', internal: true, action: () => setIsUpdatingPaymentDetails(true) },
                    description: (
                      <div>
                        <div>
                          {brand} ending in {last4}
                        </div>
                        <div>
                          Expires {`0${expiration.month}`.slice(-2)}/{`${expiration.year}`.slice(-2)}
                        </div>
                      </div>
                    )
                  }}
                  secondary={
                    isUpdatingPaymentDetails ? (
                      <CardSection
                        onCancel={() => setIsUpdatingPaymentDetails(false)}
                        onComplete={confirmCardUpdate}
                        onSubmit={startCardUpdate}
                        setSnackbar={setSnackbar}
                      />
                    ) : null
                  }
                  notification={
                    hasUnpaid && (
                      <div className="red flexbox centered">
                        <ErrorIcon fontSize="small" />
                        <span className="margin-left-small">You have an unpaid invoice. Please check your payment card details</span>
                      </div>
                    )
                  }
                />
              </>
            )}
          </>
        )}
      </List>
      {isHosted && (
        <>
          {cancelSubscriptionConfirmation ? (
            <Alert className="margin-top-large" severity="error" style={{ maxWidth: '500px' }}>
              <p>We&#39;ve started the process to cancel your plan and deactivate your account.</p>
              <p>
                We&#39;ll send you an email confirming your deactivation. If you have any question at all, contact us at{' '}
                <strong>
                  <a href="mailto:support@mender.io">support@mender.io</a>
                </strong>
              </p>
            </Alert>
          ) : (
            <p className="margin-left-small margin-right-small">
              <a href="" onClick={handleCancelSubscription}>
                {org.trial ? 'End trial' : 'Cancel subscription'} and deactivate account
              </a>
            </p>
          )}
          {cancelSubscription && <CancelRequestDialog onCancel={() => setCancelSubscription(false)} onSubmit={cancelSubscriptionSubmit} />}
        </>
      )}
    </div>
  );
};

const actionCreators = { cancelRequest, confirmCardUpdate, getCurrentCard, startCardUpdate, getUserOrganization, setSnackbar };

const mapStateToProps = state => {
  return {
    acceptedDevices: state.devices.byStatus.accepted.total,
    card: state.organization.card,
    deviceLimit: state.devices.limit,
    isHosted: state.app.features.isHosted,
    org: state.organization.organization
  };
};

export default connect(mapStateToProps, actionCreators)(Organization);
