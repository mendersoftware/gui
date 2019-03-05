import React from 'react';

import AppActions from '../../actions/app-actions';
import Authsetlist from './authsetlist';
import ConfirmDecommission from './confirmdecommission';
import { preformatWithRequestID } from '../../helpers';

// material ui
import Button from '@material-ui/core/Button';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import TrashIcon from '@material-ui/icons/Delete';

export default class Authsets extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      active: [],
      inactive: [],
      device: this.props.device
    };
  }

  componentDidMount() {
    this._getActiveAuthsets(this.state.device.auth_sets);
  }

  _getActiveAuthsets(authsets) {
    // for each authset compare the device status and if it matches authset status, put it in correct listv
    var self = this;
    const state = authsets.reduce(
      (accu, authset) => {
        if (authset.status === self.state.device.status) {
          accu.active.push(authset);
        } else {
          accu.inactive.push(authset);
        }
        return accu;
      },
      { active: [], inactive: [] }
    );
    self.setState(state);
  }

  _updateDeviceAuthStatus(device_id, auth_id, status) {
    var self = this;
    self.setState({ loading: auth_id });
    status = status === 'accept' ? 'accepted' : status === 'reject' ? 'rejected' : status;
    let changeRequest;
    if (status === 'dismiss') {
      changeRequest = AppActions.deleteAuthset(device_id, auth_id);
    } else {
      // call API to update authset
      changeRequest = AppActions.updateDeviceAuth(device_id, auth_id, status);
    }
    return changeRequest
      .then(() => {
        // if only authset, close dialog and refresh!
        if (self.state.device.auth_sets.length <= 1) {
          self.props.dialogToggle('authsets');
        } else {
          // refresh authset list
          self._refreshAuth(device_id);
          // on finish, change "loading" back to null
          self.setState({ loading: null });
        }
        AppActions.setSnackbar('Device authorization status was updated successfully');
      })
      .catch(err => {
        var errMsg = err.res.error.message || '';
        console.log(errMsg);
        AppActions.setSnackbar(
          preformatWithRequestID(err.res, `There was a problem updating the device authorization status: ${errMsg}`),
          null,
          'Copy to clipboard'
        );
      });
  }

  _showConfirm() {
    var decommission = !this.state.decommission;
    this.setState({ decommission: decommission });
  }

  _decommissionHandler() {
    //handle decommission, close dialog when done
    this.props.decommission(this.state.device.id);
  }

  _refreshAuth(device_id) {
    var self = this;
    return AppActions.getDeviceAuth(device_id)
      .then(device => {
        self.setState({ device });
        self._getActiveAuthsets(device.auth_sets);
      })
      .catch(err => console.log(`Error: ${err}`));
  }

  render() {
    var activeList = (
      <Authsetlist
        limitMaxed={this.props.limitMaxed}
        total={this.state.device.auth_sets.length}
        confirm={(...args) => this._updateDeviceAuthStatus(...args)}
        loading={this.state.loading}
        device={this.state.device}
        active={true}
        authsets={this.state.active}
      />
    );
    var inactiveList = (
      <Authsetlist
        limitMaxed={this.props.limitMaxed}
        total={this.state.device.auth_sets.length}
        confirm={(...args) => this._updateDeviceAuthStatus(...args)}
        loading={this.state.loading}
        device={this.state.device}
        hideHeader={this.state.active.length}
        authsets={this.state.inactive}
      />
    );

    var decommission = (
      <div className="float-right">
        <Button color="secondary" onClick={() => this._showConfirm()} icon={<TrashIcon style={{ height: '18px', width: '18px', verticalAlign: 'middle' }} />}>
          Decommission device
        </Button>
      </div>
    );
    if (this.state.decommission) {
      decommission = <ConfirmDecommission cancel={() => this._showConfirm()} decommission={() => this._decommissionHandler()} />;
    }

    return (
      <div style={{ minWidth: '900px' }}>
        {this.state.device.status === 'accepted' || this.state.device.status === 'rejected' ? decommission : null}

        <div className="margin-bottom-small" style={{ fontSize: '15px', padding: '14px 40px 0px 20px', border: '1px solid #f1f2f3', width: 'fit-content' }}>
          <span className="bold margin-right">{this.props.id_attribute || 'Device ID'}</span>
          <span>{this.props.id_value}</span>
          <p>
            <span className="bold margin-right">Device status</span>
            <span className="capitalized inline-block">{this.state.device.status}</span>
          </p>
        </div>

        <div className="clear">
          {this.state.active.length ? activeList : null}

          <div className="margin-top-large margin-bottom auto" />

          {this.state.inactive.length ? (
            <div>
              <h4 className="align-center">Inactive authentication sets</h4>
              {inactiveList}
            </div>
          ) : null}

          {this.props.limitMaxed ? (
            <div className="warning">
              <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
              You have reached your limit of authorized devices.
              <p>
                Contact us by email at <a href="mailto:support@hosted.mender.io">support@hosted.mender.io</a> to request a higher limit.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
