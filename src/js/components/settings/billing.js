import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// material ui
import { Button, Divider, LinearProgress, Tooltip } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';

import { getBillingStatement } from '../../actions/userActions';

import MonthlyBillingInformation from './monthlybillinginformation';
import PlanNotification from './plannotification';

const accuracy = 4;
const totalFreeCredit = 120;

const interactionList = [
  {
    title: 'Devices',
    billingInformation: [
      {
        title: 'Device activations:',
        key: 'activation',
        explanation: '# new devices connected to the server'
      },
      {
        title: 'Total active devices:',
        key: 'monthly_device',
        explanation: '# devices that were active during this period'
      }
    ]
  },
  {
    title: 'Deployments',
    billingInformation: [
      {
        title: 'Device deployments:',
        key: 'device_deployment',
        explanation: '# devices targeted by a deployment'
      }
    ]
  },
  {
    title: 'Data storage',
    billingInformation: [
      {
        title: 'GB of data stored:',
        key: 'data_storage',
        explanation: 'The software you have uploaded to the hosted Mender service'
      }
    ]
  },
  {
    title: 'Data transfer',
    billingInformation: [
      {
        title: 'GB of data transferred:',
        key: 'data_transfer',
        explanation: 'Data traffic that was sent between a device the hosted Mender service'
      }
    ]
  }
];

class Billing extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showUsage: false,
      timeframe: { month: 0, year: 0 },
      billingInformation: {
        interactions: [],
        timestamp: new Date(),
        total: 0
      }
    };
  }

  componentDidMount() {
    this.updateBillingStatement();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.billingInformation !== this.props.billingInformation) {
      const information = this.props.billingInformation;
      const interactions = interactionList.map(item => {
        item.billingInformation = item.billingInformation.map(infoItem => ({
          ...infoItem,
          unitFee: parseFloat(information[`${infoItem.key}_unit_fee`].toFixed(accuracy)),
          total: parseFloat(information[`${infoItem.key}_total_cost`].toFixed(accuracy)),
          quantity: parseFloat(information[`${infoItem.key}_usage`].toFixed(accuracy))
        }));
        return item;
      });
      this.setState({
        billingInformation: {
          interactions,
          timestamp: new Date(information.timestamp),
          total: information.summary_total_cost.toFixed(2)
        }
      });
    }
  }

  updateBillingStatement(date = new Date()) {
    const self = this;
    const timeframe = { month: date.getMonth(), year: date.getFullYear() };
    self.setState({ timeframe }, () => self.props.getBillingStatement(timeframe));
  }

  changeTimeframe(offset) {
    const { timeframe } = this.state;
    // +1 needed here to align moment with js dates
    const updatedDate = moment(`${timeframe.month + 1}-15-${timeframe.year}`);
    updatedDate.add(offset, 'months');
    this.updateBillingStatement(updatedDate.toDate());
  }

  render() {
    const self = this;
    const { currentUser, deviceCount, deviceLimit, isHosted, org } = self.props;
    const { billingInformation, showUsage, timeframe } = self.state;
    const userCreationDate = new Date(currentUser.created_ts);
    const currentPlan = isHosted ? org && org.plan : 'enterprise';
    const expirationDate = moment(userCreationDate).add(1, 'years');
    const freeCreditConsumed = (100 / totalFreeCredit) * (totalFreeCredit + billingInformation.total);
    const freeCreditRunningOut = freeCreditConsumed > 90;
    return (
      <div className="billing">
        <div className="information-overview">
          <h4 className="text-color">Billing information</h4>
          <div className="margin-top margin-bottom-small">
            <div className="explanatory-text billing-subtitle">Organization name:</div>
            <div>{org.name}</div>
          </div>
          <Divider />
          <PlanNotification currentPlan={currentPlan} />
          {!!deviceLimit && (
            <>
              <div className="margin-top margin-bottom-small">
                <div className="flexbox billing-subtitle">
                  <div className="explanatory-text margin-right-large">Device limit:</div>
                  <div>{`${deviceCount}/${deviceLimit}`}</div>
                </div>
                <LinearProgress color="primary" classes={{ root: 'progress thick' }} value={(100 / deviceLimit) * deviceCount} variant="determinate" />
                <div>
                  <span className="explanatory-text">To increase your device limit contact us at </span>
                  <a href="mailto:support@mender.io">support@mender.io</a>.
                </div>
              </div>
              <Divider />
            </>
          )}
          {billingInformation.total < 0 && (
            <>
              <div className="margin-top margin-bottom">
                <div className="explanatory-text billing-subtitle">Free credit:</div>
                <div className="bordered credit-container">
                  <div className={`flexbox centered ${freeCreditRunningOut ? 'failure' : ''}`} style={{ justifyContent: 'flex-start' }}>
                    <b>{`Credit remaining:  $${Math.abs(billingInformation.total)}`}</b>
                    {freeCreditRunningOut && (
                      <>
                        <Tooltip
                          arrow={true}
                          title={<p>When you run out of credit, you will start to be billed monthly. Minimum monthly fee is $10.00.</p>}
                          placement="top"
                        >
                          <WarningIcon className="margin-left-small" />
                        </Tooltip>
                      </>
                    )}
                  </div>
                  <LinearProgress
                    color="secondary"
                    classes={{ root: freeCreditRunningOut ? 'progress credit-warning' : 'progress' }}
                    value={freeCreditConsumed}
                    variant="determinate"
                  />
                  <div className="explanatory-text">{`Expires: ${moment(expirationDate).format('MMMM Do Y')}`}</div>
                </div>
              </div>
              <Divider />
            </>
          )}
          <div className="explanatory-text margin-top">
            <p className="margin-bottom">
              To update your billing details or for any other support questions, contact us at <a href="mailto:support@mender.io">support@mender.io</a>.
            </p>
            <p>
              For complete information and full definitions of these fees and how they are calculated, see{' '}
              <a href="https://mender.io/products/pricing" target="_blank">
                https://mender.io/products/pricing
              </a>
              .
            </p>
            <p>
              You can also{' '}
              <a href="https://mender.io" target="_blank">
                download the full PDF of unit prices
              </a>{' '}
              for 1-100,000 devices.
            </p>
          </div>
        </div>
        <div className="usage-report">
          {!showUsage && (
            <div className="overlay flexbox column centered">
              <div className="confirmation-information margin-bottom explanatory-text">
                <h3 className="margin-bottom">View your usage for the current billing period?</h3>
                <p>Note: this feature may show numbers that differ from your actual invoice.</p>
              </div>
              <Button variant="contained" onClick={() => self.setState({ showUsage: true })}>
                View usage
              </Button>
            </div>
          )}
          <MonthlyBillingInformation
            billingInformation={billingInformation}
            changeTimeframe={offset => self.changeTimeframe(offset)}
            creationDate={userCreationDate}
            isVisible={showUsage}
            timeframe={timeframe}
          />
        </div>
      </div>
    );
  }
}

const actionCreators = { getBillingStatement };

const mapStateToProps = state => {
  return {
    billingInformation: state.users.billingStatement,
    currentUser: state.users.byId[state.users.currentUser],
    deviceCount: state.devices.byStatus.accepted.total,
    deviceLimit: state.devices.limit,
    isHosted: state.app.features.isHosted,
    org: state.users.organization
  };
};
export default connect(mapStateToProps, actionCreators)(Billing);
