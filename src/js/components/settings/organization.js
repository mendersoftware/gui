import React from 'react';
import { connect } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactTooltip from 'react-tooltip';
// material ui
import { Button, List, ListItem, ListItemText } from '@material-ui/core';
import { FileCopy as CopyPasteIcon, Info as InfoIcon } from '@material-ui/icons';

import { getUserOrganization } from '../../actions/userActions';
import { PLANS as plans } from '../../constants/appConstants';

import ExpandableAttribute from '../common/expandable-attribute';

export class MyOrganization extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      copied: false
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
  render() {
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
        '%0A%0AI%20would%20like%20to%20make%20a%20change%20to%20my%20billing%20details.',
      cancel:
        'Organization%20ID%3A%20' +
        org.id +
        '%0AOrganization%20name%3A%20' +
        org.name +
        '%0APlan%20name%3A%20' +
        plans[currentPlan] +
        '%0A%0APlease%20cancel%20my%20subscription.%0AReason%20%5Boptional%5D%3A'
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
              <a href={`mailto:support@mender.io?subject=` + org.name + `: Cancel subscription&body=` + mailBodyTexts.cancel.toString()} target="_blank">
                Cancel subscription
              </a>
            </p>
          </div>
        ) : null}
      </div>
    );
  }
}

const actionCreators = { getUserOrganization };

const mapStateToProps = state => {
  return {
    isHosted: state.app.features.isHosted,
    org: state.users.organization
  };
};

export default connect(mapStateToProps, actionCreators)(MyOrganization);
