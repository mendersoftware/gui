import React from 'react';
import Time from 'react-time';
import ReactTooltip from 'react-tooltip';
import { AuthButton } from '../helptips/helptooltips';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';
import Authsets from './authsets';
import ExpandableDeviceAttribute from './expandable-device-attribute';
import Loader from '../common/loader';
import pluralize from 'pluralize';
import copy from 'copy-to-clipboard';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Icon from '@material-ui/core/Icon';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';

import BlockIcon from '@material-ui/icons/Block';
import CheckIcon from '@material-ui/icons/Check';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import InfoIcon from '@material-ui/icons/Info';
import HelpIcon from '@material-ui/icons/Help';
import LinkIcon from '@material-ui/icons/Link';
import ReplayIcon from '@material-ui/icons/Replay';
import WarningIcon from '@material-ui/icons/Warning';

import { preformatWithRequestID } from '../../helpers';
import { advanceOnboarding, getOnboardingStepCompleted } from '../../utils/onboardingmanager';

const iconStyle = { margin: 12 };

const states = {
  pending: {
    text: 'Accept, reject or dismiss the device?',
    statusIcon: <Icon className="pending-icon" style={iconStyle} />
  },
  accepted: {
    text: 'Reject, dismiss or decommission this device?',
    statusIcon: <CheckCircleIcon className="green" style={iconStyle} />
  },
  rejected: {
    text: 'Accept, dismiss or decommission this device',
    statusIcon: <BlockIcon className="red" style={iconStyle} />
  },
  preauthorized: {
    text: 'Remove this device from preauthorization?',
    statusIcon: <CheckIcon style={iconStyle} />
  }
};

export default class ExpandedDevice extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
    location: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      artifacts: AppStore.getArtifactsRepo(),
      authsets: false,
      docsVersion: AppStore.getDocsVersion(),
      schedule: false,
      selectedGroup: {
        payload: '',
        text: ''
      },
      showHelptips: AppStore.showHelptips(),
      showInput: false,
      user: AppStore.getCurrentUser()
    };
  }

  componentDidMount() {
    this._getArtifacts();
  }

  _getArtifacts() {
    var self = this;
    if (this.props.device.status === 'accepted') {
      AppActions.getArtifacts()
        .then(artifacts =>
          setTimeout(() => {
            self.setState({ artifacts });
          }, 300)
        )
        .catch(err => console.log(err.error || 'Please check your connection'));
    }
  }

  dialogToggle(ref) {
    var state = {};
    state[ref] = !this.state[ref];
    this.setState({ filterByArtifact: null });
  }

  toggleAuthsets(authsets = !this.state.authsets) {
    this.setState({ authsets });
    this.props.pause();
    this.props.refreshDevices();
  }

  _updateParams(val, attr) {
    // updating params from child schedule form
    var tmp = {};
    tmp[attr] = val;
    this.setState(tmp);
  }

  _clickListItem() {
    AppActions.setSnackbar('');
    this.setState({ schedule: false });
  }


  _handleStopProp(e) {
    e.stopPropagation();
  }

  _deploymentParams(val, attr) {
    // updating params from child schedule form
    var tmp = {};
    tmp[attr] = val;
    this.setState(tmp);

    // check that device type matches
    var filteredDevs = null;
    if (attr === 'artifact' && val) {
      const device_type = this.props.device.attributes.find(item => item.name === 'device_type').value;
      for (var i = 0; i < val.device_types_compatible.length; i++) {
        if (val.device_types_compatible[i] === device_type) {
          filteredDevs = [this.props.device];
          break;
        }
      }
    }
    this.setState({ filterByArtifact: filteredDevs });
  }
  _clickLink() {
    window.location.assign(`https://docs.mender.io/${this.state.docsVersion}/client-configuration/configuration-file/polling-intervals`);
  }
  _copyLinkToClipboard() {
    var location = window.location.href.substring(0, window.location.href.indexOf('/devices') + '/devices'.length);
    copy(`${location}/id=${this.props.device.id}`);
    AppActions.setSnackbar('Link copied to clipboard');
  }

  _scheduleDeploymentFor(device) {
    if (!AppStore.getOnboardingComplete()) {
      if (!getOnboardingStepCompleted('upload-prepared-artifact-tip')) {
        advanceOnboarding('upload-prepared-artifact-tip');
      }
    }
    AppActions.selectDevice(device);
    this.setState({ schedule: true });
  }

  _decommissionDevice(device_id) {
    var self = this;
    return AppActions.decommissionDevice(device_id)
      .then(() => {
        // close dialog!
        self.toggleAuthsets(false);
        // close expanded device
        // trigger reset of list!
        AppActions.setSnackbar('Device was decommissioned successfully');
      })
      .catch(err => {
        var errMsg = err.res.error.message || '';
        console.log(errMsg);
        AppActions.setSnackbar(preformatWithRequestID(err.res, `There was a problem decommissioning the device: ${errMsg}`), null, 'Copy to clipboard');
      })
      .finally(() => self.props.refreshDevices());
  }

  render() {
    var status = this.props.device.status;

    var deviceIdentity = [<ExpandableDeviceAttribute key="id_checksum" primary="Device ID" secondary={(this.props.device || {}).id || '-'} />];

    if ((this.props.device || {}).identity_data) {
      var data = typeof this.props.device.identity_data == 'object' ? this.props.device.identity_data : JSON.parse(this.props.device.identity_data);
      deviceIdentity = Object.entries(data).reduce((accu, item) => {
        accu.push(<ExpandableDeviceAttribute key={item[0]} primary={item[0]} secondary={item[1]} />);
        return accu;
      }, deviceIdentity);
    }

    if ((this.props.device || {}).created_ts) {
      var createdTime = <Time value={this.props.device.created_ts} format="YYYY-MM-DD HH:mm" />;
      deviceIdentity.push(
        <ExpandableDeviceAttribute key="connectionTime" primary={status === 'preauthorized' ? 'Date added' : 'First request'} secondary={createdTime} />
      );
    }

    var deviceInventory = [];

    var waiting = false;
    if (typeof this.props.attrs !== 'undefined' && this.props.attrs.length > 0) {
      var sortedAttributes = this.props.attrs.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      deviceInventory = sortedAttributes.reduce((accu, attribute, i) => {
        var secondaryText = attribute.value instanceof Array ? attribute.value.toString() : attribute.value;
        accu.push(<ExpandableDeviceAttribute key={i} primary={attribute.name} secondary={secondaryText} textClasses={{ secondary: 'inventory-text' }} />);
        return accu;
      }, deviceInventory);
    } else {
      waiting = true;
      deviceInventory.push(
        <div className="waiting-inventory" key="waiting-inventory">
          <div
            onClick={e => this._handleStopProp(e)}
            id="inventory-info"
            className="tooltip info"
            style={{ top: '8px', right: '8px' }}
            data-tip
            data-for="inventory-wait"
            data-event="click focus"
          >
            <InfoIcon />
          </div>
          <ReactTooltip id="inventory-wait" globalEventOff="click" place="top" type="light" effect="solid" className="react-tooltip">
            <h3>Waiting for inventory data</h3>
            <p>Inventory data not yet received from the device - this can take up to 30 minutes with default installation.</p>
            <p>
              Also see the documentation for{' '}
              <a onClick={() => this._clickLink()} href="https://docs.mender.io/client-configuration/configuration-file/polling-intervals">
                Polling intervals
              </a>
              .
            </p>
          </ReactTooltip>

          <p>Waiting for inventory data from the device</p>
          <Loader show={true} waiting={true} />
        </div>
      );
    }

    var deviceInventory2 = [];
    if (deviceInventory.length > deviceIdentity.length) {
      deviceInventory2 = deviceInventory.splice(deviceInventory.length / 2 + (deviceInventory.length % 2), deviceInventory.length);
    }

    const statusIcon = states[status].statusIcon;

    var hasPending = '';
    if (status === 'accepted' && this.props.device.auth_sets.length > 1) {
      hasPending = this.props.device.auth_sets.reduce((accu, set) => {
        return set.status === 'pending' ? 'This device has a pending authentication set' : accu;
      }, '');
    }

    const authLabelText = hasPending ? hasPending : states[status].text || states.default.text;

    const buttonStyle = { textTransform: 'none', textAlign: 'left' };

    const ForwardingLink = React.forwardRef((props, ref) => <Link {...props} innerRef={ref} />);
    ForwardingLink.displayName = 'ForwardingLink';

    var deviceInfo = (
      <div key="deviceinfo">
        <div className="device-identity bordered">
          <div className="margin-bottom-small">
            <h4 className="margin-bottom-none">Device identity</h4>
            <List className="list-horizontal-flex">{deviceIdentity}</List>
          </div>

          <div className="margin-bottom-small flexbox" style={{ flexDirection: 'row' }}>
            <span style={{ display: 'flex', minWidth: 180, justifyContent: 'space-evenly', alignItems: 'center', marginRight: '2vw' }}>
              {statusIcon}
              <span className="inline-block">
                <Typography variant="subtitle2" style={Object.assign({}, buttonStyle, { textTransform: 'capitalize' })}>
                  Device status
                </Typography>
                <Typography variant="body1" style={Object.assign({}, buttonStyle, { textTransform: 'capitalize' })}>
                  {status}
                </Typography>
              </span>
            </span>

            <Button
              onClick={() => {
                this.toggleAuthsets(true);
                AppActions.setSnackbar('');
              }}
            >
              {hasPending ? <WarningIcon className="auth" /> : null}
              <span className="inline-block">
                <Typography variant="subtitle2" style={buttonStyle}>
                  {authLabelText}
                </Typography>
                <Typography variant="body1" className="muted" style={buttonStyle}>
                  Click to adjust authorization status for this device
                </Typography>
              </span>
            </Button>
          </div>
        </div>

        {this.props.attrs || status === 'accepted' ? (
          <div className="device-inventory bordered">
            <div className={this.props.unauthorized ? 'hidden' : 'report-list'}>
              <h4 className="margin-bottom-none">Device inventory</h4>
              <List>{deviceInventory}</List>
            </div>

            <div className={this.props.unauthorized ? 'hidden' : 'report-list'}>
              <List style={{ marginTop: '34px' }}>{deviceInventory2}</List>
            </div>
          </div>
        ) : null}

        {status === 'accepted' && !waiting ? (
          <div className="device-actions" style={{ marginTop: '24px' }}>
            <Button onClick={() => this._copyLinkToClipboard()}>
              <LinkIcon className="rotated buttonLabelIcon" />
              Copy link to this device
            </Button>
            {status === 'accepted' ? (
              <span className="margin-left">
                <Button
                  to={`/deployments?open=true&deviceId=${this.props.device.id}`}
                  component={ForwardingLink}
                >
                  <ReplayIcon className="rotated buttonLabelIcon" />
                  Create a deployment for this device
                </Button>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    );

    var authsetActions = [
      <Button key="authset-button-1" style={{ marginRight: '10px', display: 'inline-block' }} onClick={() => this.toggleAuthsets(false)}>
        Close
      </Button>
    ];

    var authsetTitle = (
      <div style={{ width: 'fit-content', position: 'relative' }}>
        {this.props.device.status === 'pending'
          ? `Authorization ${pluralize('request', this.props.device.auth_sets.length)} for this device`
          : 'Authorization status for this device'}
        <div
          onClick={e => this._handleStopProp(e)}
          id="inventory-info"
          className="tooltip info"
          style={{ top: '28px', right: '-18px' }}
          data-tip
          data-for="inventory-wait"
          data-event="click focus"
        >
          <InfoIcon />
        </div>
        <ReactTooltip id="inventory-wait" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
          <h3>Device authorization status</h3>
          <p>
            Each device sends an authentication request containing its identity attributes and its current public key. You can accept, reject or dismiss these
            requests to determine the authorization status of the device.
          </p>
          <p>
            In cases such as key rotation, each device may have more than one identity/key combination listed. See the documentation for more on{' '}
            <a onClick={() => this._clickLink()} href="https://docs.mender.io/architecture/device-authentication">
              Device authentication
            </a>
            .
          </p>
        </ReactTooltip>
      </div>
    );

    return (
      <div className={this.props.className}>
        {deviceInfo}

        {this.state.showHelptips && status === 'pending' ? (
          <div>
            <div
              id="onboard-4"
              className={this.props.highlightHelp ? 'tooltip help highlight' : 'tooltip help'}
              data-tip
              data-for="auth-button-tip"
              data-event="click focus"
              style={{ left: '580px', top: '178px' }}
            >
              <HelpIcon />
            </div>
            <ReactTooltip id="auth-button-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
              <AuthButton devices={[this.props.device]} />
            </ReactTooltip>
          </div>
        ) : null}

        <Dialog
          open={this.state.authsets}
          fullWidth={true}
          maxWidth="lg"
          style={{
            paddingTop: '0',
            fontSize: '13px',
            overflow: 'hidden'
          }}
        >
          <DialogTitle>{authsetTitle}</DialogTitle>
          <DialogContent>
            <Authsets
              dialogToggle={() => this.toggleAuthsets(false)}
              decommission={id => this._decommissionDevice(id)}
              device={this.props.device}
              id_attribute={this.props.id_attribute}
              id_value={this.props.id_value}
              limitMaxed={this.props.limitMaxed}
            />
          </DialogContent>
          <DialogActions>{authsetActions}</DialogActions>
        </Dialog>
      </div>
    );
  }
}
