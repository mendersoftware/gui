import React from 'react';
import { connect } from 'react-redux';
import { Elements } from '@stripe/react-stripe-js';

import { InfoOutlined as InfoOutlinedIcon, Mail as MailIcon } from '@material-ui/icons';
import { getDeviceLimit } from '../../actions/deviceActions';
import { getUserOrganization } from '../../actions/organizationActions';

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

let stripePromise = null;

export class Upgrade extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      disabled: false,
      updatedFormdata: { plan: 'os', name: 'Starter' }
    };
  }

  componentDidMount() {
    const { getUserOrganization, stripeAPIKey } = this.props;
    getUserOrganization();
    // Make sure to call `loadStripe` outside of a component’s render to avoid recreating
    // the `Stripe` object on every render - but don't initialize twice.
    if (stripePromise) {
      return;
    }
    import(/* webpackChunkName: "stripe" */ '@stripe/stripe-js').then(({ loadStripe }) => {
      stripePromise = stripeAPIKey ? loadStripe(stripeAPIKey) : null;
    });
  }

  changePlan(plan, name) {
    const updatedFormdata = { plan, name };
    this.setState({ updatedFormdata });
  }

  handleUpgrade() {
    this.setState({ upgraded: true });
    setTimeout(() => {
      this.props.getDeviceLimit();
      this.props.history.push('/settings/my-organization');
    }, 3000);
  }

  render() {
    const { org } = this.props;
    const mailBodyText =
      'Organization%20ID%3A%20' +
      org.id +
      '%0AOrganization%20name%3A%20' +
      org.name +
      '%0A%0AI%20would%20like%20to%20discuss%20upgrading%20to%20Mender%20Enterprise.';

    return (
      <Elements stripe={stripePromise}>
        <div style={{ maxWidth: '750px' }} className="margin-top-small">
          <h2 style={{ marginTop: '15px' }}>Upgrade now</h2>

          {this.state.upgraded ? (
            <div>
              <p>
                <b>Your upgrade was successful! </b>You are now signed up to the <b>{this.state.updatedFormdata.name}</b> plan.
              </p>

              <p>Redirecting you to your organization page...</p>

              <Loader show={true} />
            </div>
          ) : (
            <div>
              <p>Upgrade to one of our plans to connect more devices, continue using advanced features, and get access to support.</p>
              <p>
                Learn more about the different plans at{' '}
                <a href="https://mender.io/plans/pricing" target="_blank">
                  mender.io/plans/pricing
                </a>
                .
              </p>

              <h3 className="margin-top">1. Choose a plan</h3>

              <div>
                {plans.map(item => (
                  <div
                    key={item.value}
                    className={`planPanel ${this.state.updatedFormdata.plan === item.value ? 'active' : ''}`}
                    onClick={() => this.changePlan(item.value, item.name)}
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
                <a href="mailto:contact@mender.io" target="_blank">
                  contact our sales team
                </a>
                .
              </p>

              {this.state.updatedFormdata.plan !== 'enterprise' ? (
                <div>
                  <h3 className="margin-top-large">2. Enter your payment details</h3>
                  <p>
                    You are upgrading to{' '}
                    <b>
                      Mender <span className="capitalized-start">{this.state.updatedFormdata.name}</span>
                    </b>
                  </p>

                  <CardSection upgradeSuccess={() => this.handleUpgrade()} org={org} plan={this.state.updatedFormdata.plan} />
                </div>
              ) : (
                <div>
                  <h3 className="margin-top-large">2. Get in touch with us</h3>
                  <p>
                    Interested in upgrading to <b>Mender Enterprise</b>? Our sales team can arrange a call with you to discuss your requirements and custom
                    pricing.
                  </p>
                  <p>
                    <a href={`mailto:support@mender.io?subject=` + org.name + `: Enterprise upgrade&body=` + mailBodyText.toString()} target="_blank">
                      <MailIcon style={{ fontSize: '14px', margin: '0 4px 4px 0', verticalAlign: 'middle' }} /> Send a message to our sales team
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Elements>
    );
  }
}

const actionCreators = { getDeviceLimit, getUserOrganization };

const mapStateToProps = state => {
  return {
    org: state.organization.organization,
    stripeAPIKey: state.app.stripeAPIKey
  };
};

export default connect(mapStateToProps, actionCreators)(Upgrade);
