import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { InfoOutlined as InfoOutlinedIcon, Mail as MailIcon } from '@material-ui/icons';
import { setSnackbar } from '../../actions/appActions';
import { getDeviceLimit } from '../../actions/deviceActions';
import { getUserOrganization, startUpgrade, cancelUpgrade, completeUpgrade } from '../../actions/organizationActions';
import CardSection from './cardsection';
import Loader from '../common/loader';

const plans = [
  {
    name: 'Starter',
    price: '$29/month for first 50 devices',
    features: 'Basic features',
    value: 'os'
  },
  {
    name: 'Professional',
    price: '$249/month for first 250 devices',
    features: '+ Extra features',
    value: 'professional'
  },
  {
    name: 'Enterprise',
    price: 'Custom pricing, unlimited devices',
    features: '+ Full features + SLA support',
    value: 'enterprise'
  }
];

export const Upgrade = ({ cancelUpgrade, completeUpgrade, getDeviceLimit, getUserOrganization, history, org, setSnackbar, startUpgrade }) => {
  const plan = plans.find(plan => plan.value === (org.trial ? 'os' : org.plan));
  const [upgraded, setUpgraded] = useState(false);
  const [updatedFormdata, setUpdatedFormdata] = useState({ plan: plan.value, name: plan.name });

  useEffect(() => {
    getUserOrganization();
  }, []);

  const handleUpgrade = async () =>
    completeUpgrade(org.id, updatedFormdata.plan).then(() => {
      setUpgraded(true);
      setTimeout(() => {
        getDeviceLimit();
        history.push('/settings/organization-and-billing');
      }, 3000);
    });

  const mailBodyText =
    'Organization%20ID%3A%20' +
    org.id +
    '%0AOrganization%20name%3A%20' +
    org.name +
    '%0A%0AI%20would%20like%20to%20discuss%20upgrading%20to%20Mender%20Enterprise.';

  return (
    <div style={{ maxWidth: '750px' }} className="margin-top-small">
      <h2 style={{ marginTop: '15px' }}>Upgrade now</h2>

      {upgraded ? (
        <div>
          <p>
            <b>Your upgrade was successful! </b>You are now signed up to the <b>{updatedFormdata.name}</b> plan.
          </p>

          <p>Redirecting you to your organization page...</p>

          <Loader show={true} />
        </div>
      ) : (
        <div>
          <p>Upgrade to one of our plans to connect more devices, continue using advanced features, and get access to support.</p>
          <p>
            Learn more about the different plans at{' '}
            <a href="https://mender.io/plans/pricing" target="_blank" rel="noopener noreferrer">
              mender.io/plans/pricing
            </a>
            .
          </p>

          <h3 className="margin-top">1. Choose a plan</h3>

          <div>
            {plans.map(item => (
              <div
                key={item.value}
                className={`planPanel ${updatedFormdata.plan === item.value ? 'active' : ''}`}
                onClick={() => setUpdatedFormdata({ plan: item.value, name: item.name })}
              >
                <h4>{item.name}</h4>
                <p>{item.price}</p>
                <span className="info">{item.features}</span>
              </div>
            ))}
          </div>

          <p className="info">
            <InfoOutlinedIcon style={{ fontSize: '14px', margin: '0 4px 4px 0', verticalAlign: 'middle' }} /> To ask about extending the device limit of a
            specific plan,{' '}
            <a href="mailto:contact@mender.io" target="_blank" rel="noopener noreferrer">
              contact our sales team
            </a>
            .
          </p>

          {updatedFormdata.plan !== 'enterprise' ? (
            <div>
              <h3 className="margin-top-large">2. Enter your payment details</h3>
              <p>
                You are upgrading to{' '}
                <b>
                  Mender <span className="capitalized-start">{updatedFormdata.name}</span>
                </b>
              </p>

              <CardSection
                onCancel={() => Promise.resolve(cancelUpgrade(org.id))}
                onComplete={handleUpgrade}
                onSubmit={() => Promise.resolve(startUpgrade(org.id))}
                setSnackbar={setSnackbar}
                isSignUp={true}
              />
            </div>
          ) : (
            <div>
              <h3 className="margin-top-large">2. Get in touch with us</h3>
              <p>
                Interested in upgrading to <b>Mender Enterprise</b>? Our sales team can arrange a call with you to discuss your requirements and custom pricing.
              </p>
              <p>
                <a
                  href={`mailto:support@mender.io?subject=` + org.name + `: Enterprise upgrade&body=` + mailBodyText.toString()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MailIcon style={{ fontSize: '14px', margin: '0 4px 4px 0', verticalAlign: 'middle' }} /> Send a message to our sales team
                </a>
              </p>
            </div>
          )}
        </div>
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
