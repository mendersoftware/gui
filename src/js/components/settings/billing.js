import React from 'react';

// material ui
import { Divider, List, ListItem, ListItemText, Button } from '@material-ui/core';

import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';
import MonthlyBillingInformation from './monthlybillinginformation';

const information = {
  activation_total_cost: 19356.76,
  activation_unit_fee: 0.39,
  activation_usage: 50111,
  balance: -19700,
  data_storage_total_cost: 0,
  data_storage_unit_fee: 0.03,
  data_storage_usage: 0.057,
  data_transfer_total_cost: 0.05,
  data_transfer_unit_fee: 0.095,
  data_transfer_usage: 0.577,
  device_deployment_total_cost: 6489.42,
  device_deployment_unit_fee: 0.04,
  device_deployment_usage: 151000,
  monthly_device_total_cost: 2150.75,
  monthly_device_unit_fee: 0.04,
  monthly_device_usage: 50111,
  summary_total_cost: 27996.98,
  tenant_name: 'Mender',
  timestamp: '2019-08-07T18:29:28.459346'
};

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
      billingInformation: {
        interactions: [],
        timeframe: { month: 0, year: 0 },
        timestamp: new Date(),
        total: 0
      }
    };
  }

  componentDidMount() {
    this.updateBillingStatement();
  }

  updateBillingStatement(date = new Date()) {
    const self = this;
    const timeframe = { month: date.getMonth(), year: date.getFullYear() };
    // AppActions.getBillingStatus(timeframe).then(information => {
    AppActions.getBillingStatement(timeframe).then(() => {
      const interactions = interactionList.map(item => {
        item.billingInformation = item.billingInformation.map(infoItem => ({
          ...infoItem,
          unitFee: information[`${infoItem.key}_unit_fee`],
          total: information[`${infoItem.key}_total_cost`],
          quantity: information[`${infoItem.key}_usage`]
        }));
        return item;
      });

      self.setState({
        billingInformation: {
          interactions,
          timeframe,
          timestamp: new Date(information.timestamp),
          total: information.summary_total_cost
        }
      });
    });
  }

  changeTimeframe(offset) {
    let { updatedDate } = this.state.billingInformation;
    updatedDate.setMonth(updatedDate.getMonth() + offset);
    this.updateBillingStatement(updatedDate);
  }

  render() {
    const self = this;
    const { billingInformation, showUsage } = self.state;
    const deviceCount = AppStore.getTotalAcceptedDevices();
    const deviceLimit = AppStore.getDeviceLimit();
    const creationDate = new Date(AppStore.getCurrentUser().created_ts);
    const org = AppStore.getOrganization();
    const leftoverFreeCredit = billingInformation.summary_total_cost;
    const currentPlan = 'Mender Professional';
    return (
      <div className="billing">
        <div>
          <h4>Billing information</h4>
          <List>
            <ListItem key="name" disabled={true}>
              <ListItemText primary="Organization name:" secondary={org.name} />
            </ListItem>
            <Divider />
            <ListItem key="plan" disabled={true}>
              <ListItemText primary="Current plan:" secondary={currentPlan || 'Mender Professional'} />
            </ListItem>
            <Divider />
            {deviceLimit && (
              <>
                <ListItem key="limit" disabled={true}>
                  <ListItemText primary="Device limit:" secondary={`${deviceCount}/${deviceLimit}`} />
                </ListItem>
                <Divider />
              </>
            )}
            {leftoverFreeCredit < 0 && (
              <>
                <ListItem key="credits" disabled={true}>
                  <ListItemText primary="Free credit" secondary={leftoverFreeCredit} />
                </ListItem>
                <Divider />
              </>
            )}
          </List>
          <p>
            To update your billing details or for any other support questions, contact us at <a href="mailto:support@mender.io">support@mender.io</a>.
          </p>
          <p>
            For complete information and full definitions of these fees and how they are calculated, see{' '}
            <a href="https://mender.io/terms/pricing" target="_blank">
              https://mender.io/terms/pricing
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
        <div className="usage-report">
          {!showUsage && (
            <div className="overlay flexbox column centered">
              <div className="confirmation-information margin-bottom">
                <h3 className="muted margin-bottom">View your usage for the current billing period?</h3>
                <p className="muted">Note: this feature may show numbers that differ from your actual invoice.</p>
                <p className="muted">If you receive a discounted rate, it will NOT be taken into account here and the costs shown will be inaccurate.</p>
              </div>
              <Button variant="contained" onClick={() => self.setState({ showUsage: true })}>
                View usage
              </Button>
            </div>
          )}
          <MonthlyBillingInformation
            billingInformation={billingInformation}
            changeTimeframe={offset => self.changeTimeframe(offset)}
            creationDate={creationDate}
            isVisible={showUsage}
          />
        </div>
      </div>
    );
  }
}

export default Billing;
