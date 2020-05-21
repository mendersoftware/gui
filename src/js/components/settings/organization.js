import React from 'react';
import { connect } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactTooltip from 'react-tooltip';
// material ui
import { Button, List, ListItem, ListItemText, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { FileCopy as CopyPasteIcon, Info as InfoIcon } from '@material-ui/icons';

import { getUserOrganization } from '../../actions/userActions';
import { cancelRequest } from '../../actions/organizationActions';
import { setSnackbar } from '../../actions/appActions';
import { PLANS as plans } from '../../constants/appConstants';
import CancelRequestConfirmationDialog from './dialogs/cancelrequestconfirmation';

import ExpandableAttribute from '../common/expandable-attribute';

const cancelSubscriptionReasons = [
  'Just learning about Mender',
  'Decided to use Mender on-premise',
  'Decided to use a different OTA update manager',
  'Too expensive',
  'Lack of features',
  'Was not able to get my device working properly with Mender',
  'Security concerns',
  'I am using a different hosted Mender account',
  'My project is delayed or cancelled',
  'Other'
];

export class MyOrganization extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      copied: false,
      cancelSubscription: false,
      cancelSubscriptionFormId: new Date(),
      cancelSubscriptionReason: '',
      showCancelRequestConfirmationDialog: false
    };
    this.cancelSubscriptionReasons = cancelSubscriptionReasons.map(v => ({ label: v, value: v }));
  }

  componentDidMount() {
    this.props.getUserOrganization();
    this.setState({});
  }

  _copied() {
    var self = this;
    self.setState({ copied: true });
    setTimeout(() => {
      self.setState({ copied: false });
    }, 5000);
  }

  _setCancelSubscriptionReason(evt) {
    this.setState({ cancelSubscriptionReason: evt.target.value });
  }

  _cancelSubscriptionSubmit() {
    this.props.cancelRequest(this.props.org.id, this.state.cancelSubscriptionReason).then(() => {
      this.setState({ showCancelRequestConfirmationDialog: false });
      this.handleCancelSubscription();
      this.props.setSnackbar('The cancellation request has been sent correctly!', 5000, '');
    });
  }

  handleCancelSubscription(e) {
    if (e !== undefined) {
      e.preventDefault();
    }
    let uniqueId = this.state.emailFormId;
    if (this.state.editEmail) {
      uniqueId = new Date();
    }
    this.setState({ cancelSubscription: !this.state.cancelSubscription, cancelSubscriptionFormId: uniqueId });
  }

  render() {
    var self = this;
    const { org, isHosted } = this.props;
    const currentPlan = isHosted ? org && org.plan : 'enterprise';
    const mailBodyTexts = {
      upgrade:
        'Organization%20ID%3A%20' +
        org.id +
        '%0AOrganization%20name%3A%20' +
        org.name +
        '%0APlan%20name%3A%20' +
        plans[currentPlan] +
        '%0A%0AI%20would%20like%20to%20make%20a%20change%20to%20my%20Mender%20plan.',
      billing:
        'Organization%20ID%3A%20' +
        org.id +
        '%0AOrganization%20name%3A%20' +
        org.name +
        '%0APlan%20name%3A%20' +
        plans[currentPlan] +
        '%0A%0AI%20would%20like%20to%20make%20a%20change%20to%20my%20billing%20details.'
    };
    const orgHeader = (
      <div>
        <h4 style={{ display: 'inline', paddingRight: '10px' }}>Token</h4>
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
          <h3>Tenant token</h3>
          <p style={{ color: '#DECFD9', margin: '1em 0' }}>
            This token is unique for your organization and ensures that only devices that you own are able to connect to your account.
          </p>
        </ReactTooltip>
      </div>
    );
    return (
      <div className="margin-top-small">
        <h2 style={{ marginTop: '15px' }}>My organization</h2>

        {org ? (
          <div>
            <List>
              <ListItem style={{ maxWidth: '500px' }} divider={true} key="name" disabled={true}>
                <ListItemText primary="Organization name" secondary={org.name} />
              </ListItem>
              <div className="flexbox" style={{ alignItems: 'flex-end' }}>
                <ExpandableAttribute
                  style={{ width: '500px', display: 'inline-block' }}
                  key="org_token"
                  primary={orgHeader}
                  secondary={org.tenant_token}
                  textClasses={{ secondary: 'break-all inventory-text tenant-token-text' }}
                />
                <CopyToClipboard text={org.tenant_token} onCopy={() => this._copied()}>
                  <Button style={{ margin: '0 15px 15px' }} startIcon={<CopyPasteIcon />}>
                    Copy to clipboard
                  </Button>
                </CopyToClipboard>
                <div>
                  <p style={{ marginBottom: '30px' }}>{this.state.copied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
                </div>
              </div>
              <ListItem style={{ maxWidth: '500px' }} divider={true} key="plan" disabled={true}>
                <ListItemText primary="Current plan" secondary={plans[currentPlan]} />
              </ListItem>
            </List>
            <p className="margin-top margin-left-small margin-right-small">
              <a href={`mailto:support@mender.io?subject=` + org.name + `: Change plan&body=` + mailBodyTexts.upgrade.toString()} target="_blank">
                Upgrade your plan
              </a>{' '}
              or compare product plans at{' '}
              <a href="https://mender.io/pricing" target="_blank">
                mender.io/pricing
              </a>
              .
            </p>
            <p className="margin-left-small margin-right-small">
              <a href={`mailto:support@mender.io?subject=` + org.name + `: Update billing&body=` + mailBodyTexts.billing.toString()} target="_blank">
                Request to update your billing details
              </a>
            </p>
            <p className="margin-left-small margin-right-small">
              <a href="" onClick={e => self.handleCancelSubscription(e)}>
                Cancel subscription
              </a>
            </p>
            {this.state.showCancelRequestConfirmationDialog && (
              <CancelRequestConfirmationDialog
                open={this.state.showCancelRequestConfirmationDialog}
                onCancel={() => self.setState({ showCancelRequestConfirmationDialog: false })}
                onSubmit={() => this._cancelSubscriptionSubmit()}
              />
            )}
            {this.state.cancelSubscription && (
              <div className="margin-left-small margin-right-small">
                <p className="margin-top-large">
                  The request won&#39;t be fulfilled immediately.
                  <br />
                  Our Support Team will act upon it and be back to you soon.
                </p>
                <p>Please select the reason for your cancellation to help us improve our service:</p>
                <div className="flexbox space-between">
                  <FormControl id="reason-form">
                    <InputLabel id="reason-selection-label">Reason</InputLabel>
                    <Select
                      labelId="reason-selection-label"
                      id={`reason-selector-${this.cancelSubscriptionReasons}.length}`}
                      value={this.state.cancelSubscriptionReason}
                      validations="isLength:1"
                      onChange={evt => this._setCancelSubscriptionReason(evt)}
                      required={true}
                    >
                      {this.cancelSubscriptionReasons.map(item => (
                        <MenuItem key={item.value} value={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => self.setState({ showCancelRequestConfirmationDialog: true })}
                    disabled={this.state.cancelSubscriptionReason == ''}
                  >
                    Submit the request
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  }
}

const actionCreators = { getUserOrganization, setSnackbar, cancelRequest };

const mapStateToProps = state => {
  return {
    isHosted: state.app.features.isHosted,
    org: state.users.organization
  };
};

export default connect(mapStateToProps, actionCreators)(MyOrganization);
