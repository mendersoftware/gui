import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactTooltip from 'react-tooltip';
import AppActions from '../../actions/app-actions';

// material ui
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import InfoIcon from '@material-ui/icons/Info';

export default class MyOrganization extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      org: {
        tenant_token: ''
      },
      copied: false
    };
  }
  componentDidMount() {
    this._getUserOrganization();
  }
  _getUserOrganization() {
    var self = this;
    return AppActions.getUserOrganization()
      .then(org => self.setState({ org: org }))
      .catch(err => console.log(`Error: ${err}`));
  }

  _copied() {
    var self = this;
    self.setState({ copied: true });
    setTimeout(() => {
      self.setState({ copied: false });
    }, 5000);
  }
  render() {
    return (
      <div style={{ maxWidth: '750px' }} className="margin-top-small">
        <h2 style={{ marginTop: '15px' }}>My organization</h2>

        {this.state.org ? (
          <div>
            <List>
              <ListItem key="name" disabled={true}>
                <ListItemText primary="Organization name" secondary={this.state.org.name} />
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

                <p style={{ wordBreak: 'break-all' }}>{this.state.org.tenant_token}</p>

                <CopyToClipboard text={this.state.org.tenant_token} onCopy={() => this._copied()}>
                  <Button style={{ marginTop: '15px' }} icon={<Icon className="material-icons">content_paste</Icon>}>
                    Copy to clipboard
                  </Button>
                </CopyToClipboard>

                <p style={{ marginLeft: '14px' }}>{this.state.copied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
              </div>
              <Divider />
            </List>
          </div>
        ) : null}
      </div>
    );
  }
}
