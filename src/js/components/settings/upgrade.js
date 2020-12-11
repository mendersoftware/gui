import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import moment from 'moment';
import { InfoOutlined as InfoOutlinedIcon, Mail as MailIcon } from '@material-ui/icons';
import { setSnackbar } from '../../actions/appActions';
import { getDeviceLimit } from '../../actions/deviceActions';
import { getUserOrganization, startUpgrade, cancelUpgrade, completeUpgrade } from '../../actions/organizationActions';
import CardSection from './cardsection';
import Loader from '../common/loader';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';

const plans = [
  {
    name: 'Starter',
    offer: true,
    price: '$29/month for first 50 devices',
    offerprice: '$23/month for first 50 devices',
    price2: 'for first 6 months;\n$29/month thereafter',
    features: 'Basic features',
    value: 'os'
  },
  {
    name: 'Professional',
    offer: true,
    price: '$249/month for first 250 devices',
    offerprice: '$200/month for first 50 devices',
    price2: 'for first 6 months;\n$249/month thereafter',
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
  const offerValid = moment().isBefore('2021-01-01');

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

  const offerTag = (
    <span className="offerTag">
      <LocalOfferIcon /> End of year offer
    </span>
  );

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
                <h4>
                  {item.name} {item.offer && org.trial && offerValid ? offerTag : null}
                </h4>
                <p>
                  {item.offer && org.trial && offerValid ? <span className="link-color bold">{item.offerprice}</span> : <span>{item.price}</span>}
                  {item.offer && org.trial && offerValid ? (
                    <span className="pre-line">
                      <br />
                      {item.price2}
                    </span>
                  ) : null}
                </p>
                <span className="info">{item.features}</span>
              </div>
            ))}
          </div>

          {org.trial && offerValid ? (
            <p className="offerBox">
              {offerTag} – upgrade before December 31st to get a 20% discount for 6 months on Mender Starter and Mender Professional plans. The discount will be
              automatically applied to your account.
            </p>
          ) : null}
          <p className="info">
            <InfoOutlinedIcon style={{ fontSize: '14px', margin: '0 4px 4px 0', verticalAlign: 'middle' }} />
            If you have any questions about the plan pricing or device limits,{' '}
            <a href="mailto:contact@mender.io" target="_blank" rel="noopener noreferrer">
              contact our team
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
                  href={`mailto:contact@mender.io?subject=` + org.name + `: Enterprise upgrade&body=` + mailBodyText.toString()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MailIcon style={{ fontSize: '14px', margin: '0 4px 4px 0', verticalAlign: 'middle' }} /> Send a message to our team
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
