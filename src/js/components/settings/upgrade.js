import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { InfoOutlined as InfoOutlinedIcon, LocalOffer as LocalOfferIcon } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { getDeviceLimit } from '../../actions/deviceActions';
import { getUserOrganization, startUpgrade, cancelUpgrade, completeUpgrade } from '../../actions/organizationActions';
import Loader from '../common/loader';
import { PLANS } from '../../constants/appConstants';
import AddOnSelection from './addonselection';
import PlanSelection from './planselection';
import CardSection from './cardsection';
import QuoteRequestForm from './quoterequestform';

const offerTag = (
  <span className="offerTag">
    <LocalOfferIcon /> End of year offer
  </span>
);

export const PostUpgradeNote = ({ newPlan }) => (
  <div style={{ maxWidth: 750 }} className="margin-top-small">
    <h2 style={{ marginTop: 15 }}>Upgrade now</h2>
    <div>
      <p>
        <b>Your upgrade was successful! </b>You are now signed up to the <b>{newPlan}</b> plan.
      </p>
      <p>Redirecting you to your organization page...</p>
      <Loader show={true} />
    </div>
  </div>
);

export const PricingContactNote = () => (
  <p className="info">
    <InfoOutlinedIcon style={{ fontSize: '14px', margin: '0 4px 4px 0', verticalAlign: 'middle' }} />
    If you have any questions about the plan pricing or device limits,{' '}
    <a href="mailto:contact@mender.io" target="_blank" rel="noopener noreferrer">
      contact our team
    </a>
    .
  </p>
);

const upgradeNotes = {
  default: {
    title: 'Upgrades and add-ons',
    description: 'Upgrade your plan or purchase an add-on to connect more devices, access more features and advanced support.'
  },
  trial: {
    title: 'Upgrade now',
    description: 'Upgrade to one of our plans to connect more devices, continue using advanced features, and get access to support.'
  }
};

const quoteRequest = {
  default: {
    title: 'Request a change to your plan',
    note: `Leave us a message, and we'll respond as soon as we can.`
  },
  enterprise: {
    title: 'Request a quote from our team',
    note: `Let us know here if you have any questions or requirements. We'll respond to you shortly.`
  }
};

export const Upgrade = ({ cancelUpgrade, completeUpgrade, getDeviceLimit, getUserOrganization, history, org, sendMessage, setSnackbar, startUpgrade }) => {
  const offerValid = moment().isBefore('2021-01-01');

  const [addOns, setAddOns] = useState([]);
  const [updatedPlan, setUpdatedPlan] = useState('os');
  const [upgraded, setUpgraded] = useState(false);

  useEffect(() => {
    getUserOrganization();
  }, []);

  useEffect(() => {
    const { addons: orgAddOns = [], plan: orgPlan = 'os', trial = false } = org;
    const plan = Object.values(PLANS).find(plan => plan.value === (trial ? 'os' : orgPlan));
    setAddOns(orgAddOns);
    setUpdatedPlan(plan.value);
  }, [org]);

  if (upgraded) {
    return <PostUpgradeNote newPlan={PLANS[updatedPlan].name} />;
  }

  const handleUpgrade = async () =>
    completeUpgrade(org.id, updatedPlan).then(() => {
      setUpgraded(true);
      setTimeout(() => {
        getDeviceLimit();
        history.push('/settings/organization-and-billing');
      }, 3000);
    });

  const onSendMessage = (message, addons = addOns) => {
    sendMessage(message, updatedPlan, addons);
  };

  const { description, title } = org.trial ? upgradeNotes.trial : upgradeNotes.default;
  const { note: quoteRequestNote, title: quoteRequestTitle } = updatedPlan !== 'enterprise' ? quoteRequest.default : quoteRequest.enterprise;
  return (
    <div style={{ maxWidth: 750 }} className="margin-top-small">
      <h2 style={{ marginTop: 15 }}>{title}</h2>
      <p>{description}</p>
      <p>
        Learn more about the different plans at{' '}
        <a href="https://mender.io/plans/pricing" target="_blank" rel="noopener noreferrer">
          mender.io/plans/pricing
        </a>
        .
      </p>
      <h3 className="margin-top">1. Choose a plan</h3>
      <PlanSelection
        currentPlan={org.plan}
        isUpgrade={!org.trial && org.plan !== 'enterprise'}
        updatedPlan={updatedPlan}
        setUpdatedPlan={setUpdatedPlan}
        trial={org.trial}
        offerValid={offerValid}
        offerTag={offerTag}
      />
      {updatedPlan !== 'enterprise' && <PricingContactNote />}

      {org.trial && offerValid && (
        <p className="offerBox">
          {offerTag} – upgrade before December 31st to get a 20% discount for 6 months on Mender Starter and Mender Professional plans. The discount will be
          automatically applied to your account.
        </p>
      )}

      {updatedPlan === 'enterprise' && <h3 className="margin-top-large">2. Select add-ons</h3>}
      <AddOnSelection addons={addOns} isUpgrade={updatedPlan !== 'enterprise'} onChange={setAddOns} onSubmit={addons => onSendMessage('', addons)} />
      {updatedPlan === 'enterprise' && <PricingContactNote />}

      {org.trial ? (
        updatedPlan !== 'enterprise' && (
          <>
            <h3 className="margin-top-large">2. Enter your payment details</h3>
            <p>
              You are upgrading to{' '}
              <b>
                Mender <span className="capitalized-start">{PLANS[updatedPlan].name}</span>
              </b>
            </p>

            <CardSection
              onCancel={() => Promise.resolve(cancelUpgrade(org.id))}
              onComplete={handleUpgrade}
              onSubmit={() => Promise.resolve(startUpgrade(org.id))}
              setSnackbar={setSnackbar}
              isSignUp={true}
            />
          </>
        )
      ) : (
        <>
          <h3 className="margin-top-large">{quoteRequestTitle}</h3>
          <QuoteRequestForm addOns={addOns} updatedPlan={updatedPlan} onSendMessage={onSendMessage} notification={quoteRequestNote} />
        </>
      )}
    </div>
  );
};

const actionCreators = { cancelUpgrade, completeUpgrade, getDeviceLimit, getUserOrganization, setSnackbar, startUpgrade };

const mapStateToProps = state => {
  return {
    org: state.organization.organization
  };
};

export default connect(mapStateToProps, actionCreators)(Upgrade);
