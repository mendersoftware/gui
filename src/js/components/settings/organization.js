import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactTooltip from 'react-tooltip';
import { Link } from 'react-router-dom';

// material ui
import { Button, List, LinearProgress, ListItem, ListItemText } from '@material-ui/core';
import { FileCopy as CopyPasteIcon, Info as InfoIcon } from '@material-ui/icons';

import { getUserOrganization } from '../../actions/userActions';
import { cancelRequest } from '../../actions/organizationActions';
import { PLANS as plans } from '../../constants/appConstants';
import CancelRequestDialog from './dialogs/cancelrequest';

import Alert from '../common/alert';
import ExpandableAttribute from '../common/expandable-attribute';

export class MyOrganization extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      copied: false,
      cancelSubscription: false,
      cancelSubscriptionConfirmation: false
    };
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

  _cancelSubscriptionSubmit(reason) {
    this.props.cancelRequest(this.props.org.id, reason).then(() => this.setState({ cancelSubscription: false, cancelSubscriptionConfirmation: true }));
  }

  handleCancelSubscription(e) {
    if (e !== undefined) {
      e.preventDefault();
    }
    this.setState({ cancelSubscription: !this.state.cancelSubscription });
  }

  render() {
    var self = this;
    const { org, isHosted, acceptedDevices, deviceLimit } = this.props;
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
              {isHosted && (
                <ListItem style={{ maxWidth: '500px' }} divider={true} key="plan" disabled={true}>
                  <ListItemText
                    primary="Current plan"
                    secondary={
                      <div className="flexbox space-between">
                        {plans[currentPlan]}
                        <a href="https://mender.io/plans/pricing" target="_blank">
                          Compare product plans
                        </a>
                      </div>
                    }
                  />
                </ListItem>
              )}
              {isHosted && org.trial && (
                <ListItem style={{ maxWidth: '500px' }} divider={true} key="trial" disabled={true}>
                  <ListItemText
                    primary="Trial"
                    secondary={
                      <div className="flexbox space-between">
                        Expires in {moment().from(moment(org.trial_expiration), true)}
                        <Link to="/settings/upgrade">Upgrade to a paid plan</Link>
                      </div>
                    }
                  />
                </ListItem>
              )}
              {isHosted && deviceLimit > 0 && (
                <ListItem style={{ maxWidth: '500px' }} divider={true} key="device_limit" disabled={true}>
                  <ListItemText
                    primary={`Device limit: ${acceptedDevices}/${deviceLimit}`}
                    secondary={
                      <div>
                        <LinearProgress
                          variant="determinate"
                          style={{ backgroundColor: '#c7c7c7', margin: '15px 0' }}
                          value={(acceptedDevices * 100) / deviceLimit}
                        />
                        {org.trial && (
                          <>
                            To increase your device limit, <Link to="/settings/upgrade">upgrade to a paid plan</Link>.
                          </>
                        )}
                      </div>
                    }
                  />
                </ListItem>
              )}
            </List>
            {isHosted && (
              <>
                <p className="margin-left-small margin-right-small">
                  <a href={`mailto:support@mender.io?subject=` + org.name + `: Update billing&body=` + mailBodyTexts.billing.toString()} target="_blank">
                    Request to update your billing details
                  </a>
                </p>
                {this.state.cancelSubscriptionConfirmation ? (
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
                    <a href="" onClick={e => self.handleCancelSubscription(e)}>
                      {org.trial ? 'End trial' : 'Cancel subscription'} and deactivate account
                    </a>
                  </p>
                )}
              </>
            )}
            {this.state.cancelSubscription && (
              <CancelRequestDialog onCancel={() => self.setState({ cancelSubscription: false })} onSubmit={value => this._cancelSubscriptionSubmit(value)} />
            )}
          </div>
        ) : null}
      </div>
    );
  }
}

const actionCreators = { getUserOrganization, cancelRequest };

const mapStateToProps = state => {
  return {
    isHosted: state.app.features.isHosted,
    org: state.users.organization,
    acceptedDevices: state.devices.byStatus.accepted.total,
    deviceLimit: state.devices.limit
  };
};

export default connect(mapStateToProps, actionCreators)(MyOrganization);
