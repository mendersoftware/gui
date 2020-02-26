import React from 'react';
import { connect } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactTooltip from 'react-tooltip';
// material ui
import { Button, Divider, List, ListItem, ListItemText } from '@material-ui/core';
import { FileCopy as CopyPasteIcon, Info as InfoIcon } from '@material-ui/icons';

import { getUserOrganization } from '../../actions/userActions';
import PlanNotification from './plannotification';

export class MyOrganization extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      copied: false
    };
  }
  componentDidMount() {
    this.props.getUserOrganization();
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
    return (
      <div style={{ maxWidth: '750px' }} className="margin-top-small">
        <h2 style={{ marginTop: '15px' }}>My organization</h2>

        {org ? (
          <div>
            <List>
              <ListItem key="name" disabled={true}>
                <ListItemText primary="Organization name" secondary={org.name} />
              </ListItem>
              <Divider />
              <div className="material-list-item">
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
                  <p style={{ color: '#DECFD9', margin: '1em 0' }}>
                    Set this variable in <i>local.conf</i> in order to make the device recognize the organization to which it belongs.
                  </p>
                </ReactTooltip>

                <p style={{ wordBreak: 'break-all' }}>{org.tenant_token}</p>

                <CopyToClipboard text={org.tenant_token} onCopy={() => this._copied()}>
                  <Button style={{ marginTop: '15px' }} startIcon={<CopyPasteIcon />}>
                    Copy to clipboard
                  </Button>
                </CopyToClipboard>

                <p style={{ marginLeft: '14px' }}>{this.state.copied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
              </div>
              <Divider />
            </List>
            <PlanNotification
              className="margin-left-small margin-right-small"
              currentPlan={currentPlan}
              planClass="MuiTypography-body2 MuiTypography-colorTextSecondary"
            />
            <p className="margin-left-small margin-right-small">
              To update your billing details or for any other support questions, contact us at <a href="mailto:support@mender.io">support@mender.io</a>.
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
