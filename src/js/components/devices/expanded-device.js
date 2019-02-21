import React from 'react';
import Time from 'react-time';
import ReactTooltip from 'react-tooltip';
import { AuthButton } from '../helptips/helptooltips';
import PropTypes from 'prop-types';

import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';
import ScheduleForm from '../deployments/scheduleform';
import Authsets from './authsets';
import Loader from '../common/loader';
import pluralize from 'pluralize';
import cookie from 'react-cookie';
import copy from 'copy-to-clipboard';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Icon from '@material-ui/core/Icon';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import InfoIcon from '@material-ui/icons/Info';
import HelpIcon from '@material-ui/icons/Help';

import { preformatWithRequestID } from '../../helpers';

export default class ExpandedDevice extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
    location: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      showInput: false,
      selectedGroup: {
        payload: '',
        text: ''
      },
      schedule: false,
      authsets: false,
      artifacts: AppStore.getArtifactsRepo(),
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
    var self = this;
    var state = {};
    state[ref] = !this.state[ref];
    this.setState(state, () => {
      if (ref === 'authsets') {
        self.props.pause();
      }
    });
    this.setState({ filterByArtifact: null, artifact: null });
  }

  _updateParams(val, attr) {
    // updating params from child schedule form
    var tmp = {};
    tmp[attr] = val;
    this.setState(tmp);
  }

  _clickListItem() {
    AppActions.setSnackbar('');
    this.dialogToggle('schedule');
  }

  _showAuthsets() {
    AppActions.setSnackbar('');
    this.dialogToggle('authsets');
  }

  _onScheduleSubmit() {
    var self = this;
    var newDeployment = {
      devices: [this.props.device.id],
      name: this.props.device.id,
      artifact_name: this.state.artifact.name
    };
    this.dialogToggle('schedule');
    return AppActions.createDeployment(newDeployment)
      .then(data => {
        // get id, if showhelptips & no onboarded cookie, this is user's first deployment - add id cookie
        var lastslashindex = data.lastIndexOf('/');
        var id = data.substring(lastslashindex + 1);

        // onboarding
        if (self.props.showHelpTips && !cookie.load(`${self.state.user.id}-onboarded`) && !cookie.load(`${self.state.user.id}-deploymentID`)) {
          cookie.save(`${self.state.user.id}-deploymentID`, id);
        }

        AppActions.setSnackbar('Deployment created successfully. Redirecting...', 5000);
        var params = { route: 'deployments' };
        setTimeout(() => {
          self.context.router.history.push(params.route);
        }, 1200);
      })
      .catch(err => {
        try {
          var errMsg = err.res.body.error || '';
          AppActions.setSnackbar(preformatWithRequestID(err.res, `Error creating deployment. ${errMsg}`), null, 'Copy to clipboard');
        } catch (e) {
          console.log(e);
        }
      });
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
      for (var i = 0; i < val.device_types_compatible.length; i++) {
        if (val.device_types_compatible[i] === this.props.device_type) {
          filteredDevs = [this.props.device];
          break;
        }
      }
    }
    this.setState({ filterByArtifact: filteredDevs });
  }
  _clickLink() {
    window.location.assign(`https://docs.mender.io/${this.props.docsVersion}/client-configuration/configuration-file/polling-intervals`);
  }
  _copyLinkToClipboard() {
    var location = window.location.href.substring(0, window.location.href.indexOf('/devices') + '/devices'.length);
    copy(`${location}/id=${this.props.device.id}`);
    AppActions.setSnackbar('Link copied to clipboard');
  }

  _decommissionDevice(device_id) {
    var self = this;
    return AppActions.decommissionDevice(device_id)
      .then(() => {
        // close dialog!
        self.dialogToggle('authsets');
        // close expanded device
        // trigger reset of list!
        AppActions.setSnackbar('Device was decommissioned successfully');
      })
      .catch(err => {
        var errMsg = err.res.error.message || '';
        console.log(errMsg);
        AppActions.setSnackbar(preformatWithRequestID(err.res, `There was a problem decommissioning the device: ${errMsg}`), null, 'Copy to clipboard');
      });
  }

  render() {
    var status = this.props.device.status;

    var deviceIdentity = [];
    deviceIdentity.push(
      <ListItem key="id_checksum" disabled={true}>
        <ListItemText primary="Device ID" secondary={(this.props.device || {}).id || ''} />
      </ListItem>
    );

    if ((this.props.device || {}).identity_data) {
      var data = typeof this.props.device.identity_data == 'object' ? this.props.device.identity_data : JSON.parse(this.props.device.identity_data);
      for (var k in data) {
        deviceIdentity.push(
          <ListItem key={k} disabled={true}>
            <ListItemText primary={k} secondary={data[k]} />
          </ListItem>
        );
      }
    }

    if ((this.props.device || {}).created_ts) {
      deviceIdentity.push(
        <div key="connectionTime">
          <ListItem disabled={true}>
            <ListItemText
              primary={status === 'preauthorized' ? 'Date added' : 'First request'}
              secondary={
                <div>
                  <Time value={this.props.device.created_ts} format="YYYY-MM-DD HH:mm" />
                </div>
              }
            />
          </ListItem>
        </div>
      );
    }

    var deviceInventory = [];

    var waiting = false;
    if (typeof this.props.attrs !== 'undefined' && this.props.attrs.length > 0) {
      var sortedAttributes = this.props.attrs.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      for (var i = 0; i < sortedAttributes.length; i++) {
        var secondaryText = sortedAttributes[i].value instanceof Array ? sortedAttributes[i].value.toString() : sortedAttributes[i].value;
        deviceInventory.push(
          <div key={i}>
            <ListItem disabled={true}>
              <ListItemText primary={sortedAttributes[i].name} secondary={secondaryText} />
            </ListItem>
            <Divider />
          </div>
        );
      }
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

    var statusIcon = '';
    switch (status) {
    case 'accepted':
      statusIcon = (
        <Icon className="material-icons green" style={{ margin: '12px 0 12px 12px' }}>
            check_circle
        </Icon>
      );
      break;
    case 'pending':
      statusIcon = <div className="pending-icon" style={{ margin: '12px 0 12px 12px' }} />;
      break;
    case 'rejected':
      statusIcon = (
        <Icon className="material-icons red" style={{ margin: '12px 0 12px 12px' }}>
            block
        </Icon>
      );
      break;
    case 'preauthorized':
      statusIcon = (
        <Icon className="material-icons" style={{ margin: '12px 0 12px 12px' }}>
            check
        </Icon>
      );
      break;
    }

    var formatStatus = <span className="text-color">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;

    var hasPending = '';
    if (status === 'accepted' && this.props.device.auth_sets.length > 1) {
      hasPending = this.props.device.auth_sets.reduce((accu, set) => {
        return set.status === 'pending' ? 'This device has a pending authentication set' : accu;
      }, '');
    }

    const states = {
      pending: 'Accept, reject or dismiss the device?',
      accepted: 'Reject, dismiss or decommission this device?',
      rejected: 'Accept, dismiss or decommission this device',
      default: 'Remove this device from preauthorization?'
    };

    const authLabelText = hasPending ? hasPending : states[status] || states.default;

    var authLabel = <span style={{ fontSize: '14px' }}>{authLabelText}</span>;

    var deviceInfo = (
      <div key="deviceinfo">
        <div id="device-identity" className="report-list bordered">
          <h4 className="margin-bottom-none">Device identity</h4>
          <List className="list-horizontal-display">{deviceIdentity}</List>

          <List className="block list-horizontal-display">
            <ListItem key="statusButton" disabled={true}>
              <ListItemAvatar>{statusIcon}</ListItemAvatar>
              <ListItemText primary={'Device status'} secondary={formatStatus} />
            </ListItem>

            <ListItem key="authsetsButton" disabled={false} onClick={() => this._showAuthsets()}>
              {hasPending ? (
                <ListItemAvatar>
                  <Icon className="material-icons auth" style={{ marginTop: 12, marginBottom: 6 }}>
                    warning
                  </Icon>
                </ListItemAvatar>
              ) : null}

              <ListItemText primary={authLabel} secondary={'Click to adjust authorization status for this device'} />
            </ListItem>
          </List>
        </div>

        {this.props.attrs || status === 'accepted' ? (
          <div id="device-inventory" className="bordered">
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
          <div id="device-actions" className="report-list">
            <List className="list-horizontal-display" style={{ marginTop: '24px' }}>
              <ListItem key="copylink" onClick={() => this._copyLinkToClipboard()}>
                <ListItemAvatar>
                  <Icon className="material-icons update" style={{ margin: '12px 0 12px 12px' }}>
                    link
                  </Icon>
                </ListItemAvatar>
                <ListItemText primary="Copy link to this device" />
              </ListItem>
              <ListItem key="updateButton" className={status === 'accepted' ? null : 'hidden'} onClick={() => this._clickListItem()}>
                <ListItemAvatar>
                  <Icon className="material-icons update" style={{ margin: '12px 0 12px 12px' }}>
                    replay
                  </Icon>
                </ListItemAvatar>
                <ListItemText primary="Create a deployment for this device" />
              </ListItem>
            </List>
          </div>
        ) : null}
      </div>
    );

    var scheduleActions = [
      <div key="schedule-action-button-1" style={{ marginRight: '10px', display: 'inline-block' }}>
        <Button onClick={() => this.dialogToggle('schedule')}>Cancel</Button>
      </div>,
      <Button
        variant="contained"
        key="schedule-action-button-2"
        primary="true"
        disabled={!this.state.filterByArtifact}
        onClick={() => this._onScheduleSubmit()}
        ref="save"
      >
        Create deployment
      </Button>
    ];

    var authsetActions = [
      <div key="authset-button-1" style={{ marginRight: '10px', display: 'inline-block' }}>
        <Button onClick={() => this.dialogToggle('authsets')}>Close</Button>
      </div>
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
      <div>
        {deviceInfo}

        {this.props.showHelptips && status === 'pending' ? (
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

        <Dialog open={this.state.schedule}>
          <DialogTitle>Create a deployment</DialogTitle>
          <DialogContent style={{ overflow: 'hidden' }}>
            <ScheduleForm
              deploymentDevices={[this.props.device]}
              filteredDevices={this.state.filterByArtifact}
              deploymentSettings={(...args) => this._deploymentParams(...args)}
              artifact={this.state.artifact}
              artifacts={this.state.artifacts}
              device={this.props.device}
              deploymentSchedule={this._updateParams}
              groups={this.props.groups}
            />
          </DialogContent>
          <DialogActions>{scheduleActions}</DialogActions>
        </Dialog>

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
              dialogToggle={() => this.dialogToggle('authsets')}
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
