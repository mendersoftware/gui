import React from 'react';
import { connect } from 'react-redux';

import { deleteAuthset, updateDeviceAuth } from '../../actions/deviceActions';

import { setSnackbar } from '../../actions/appActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import Authsetlist from './authsetlist';
import ConfirmDecommission from './confirmdecommission';
import { preformatWithRequestID } from '../../helpers';

// material ui
import { Button } from '@material-ui/core';
import { InfoOutlined as InfoIcon, Delete as TrashIcon } from '@material-ui/icons';

export class Authsets extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      loading: false
    };
  }

  _updateDeviceAuthStatus(device_id, auth_id, status) {
    var self = this;
    self.setState({ loading: auth_id });
    status = status === 'accept' ? DEVICE_STATES.accepted : status === 'reject' ? DEVICE_STATES.rejected : status;
    let changeRequest;
    if (status === 'dismiss') {
      changeRequest = self.props.deleteAuthset(device_id, auth_id);
    } else {
      // call API to update authset
      changeRequest = self.props.updateDeviceAuth(device_id, auth_id, status);
    }
    return changeRequest
      .then(() => {
        // if only authset, close dialog and refresh!
        if (self.props.device.auth_sets.length <= 1) {
          self.props.dialogToggle('authsets');
        } else {
          // refresh authset list
          self._refreshAuth(device_id);
          // on finish, change "loading" back to null
          self.setState({ loading: null });
        }
        self.props.setSnackbar('Device authorization status was updated successfully');
      })
      .catch(err => {
        var errMsg = err ? (err.res ? err.res.error.message : err.message) : '';
        console.log(errMsg);
        self.props.setSnackbar(
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
    this.props.decommission(this.props.device.id);
  }

  _refreshAuth(device_id) {
    var self = this;
    return self.props.getDeviceAuth(device_id).catch(err => console.log(`Error: ${err}`));
  }

  render() {
    var activeList = (
      <Authsetlist
        limitMaxed={this.props.limitMaxed}
        total={this.props.device.auth_sets.length}
        confirm={(...args) => this._updateDeviceAuthStatus(...args)}
        loading={this.state.loading}
        device={this.props.device}
        active={true}
        authsets={this.props.active}
      />
    );
    var inactiveList = (
      <Authsetlist
        limitMaxed={this.props.limitMaxed}
        total={this.props.device.auth_sets.length}
        confirm={(...args) => this._updateDeviceAuthStatus(...args)}
        loading={this.state.loading}
        device={this.props.device}
        hideHeader={this.props.active.length}
        authsets={this.props.inactive}
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
        {this.props.device.status === DEVICE_STATES.accepted || this.props.device.status === DEVICE_STATES.rejected ? decommission : null}

        <div className="margin-bottom-small" style={{ fontSize: '15px', padding: '14px 40px 0px 20px', border: '1px solid #f1f2f3', width: 'fit-content' }}>
          <span className="bold margin-right">{this.props.id_attribute || 'Device ID'}</span>
          <span>{this.props.id_value}</span>
          <p>
            <span className="bold margin-right">Device status</span>
            <span className="capitalized inline-block">{this.props.device.status}</span>
          </p>
        </div>

        <div className="clear">
          {this.props.active.length ? activeList : null}

          <div className="margin-top-large margin-bottom auto" />

          {this.props.inactive.length ? (
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

const actionCreators = { deleteAuthset, updateDeviceAuth, setSnackbar };

const mapStateToProps = (state, ownProps) => {
  const device = state.devices.byId[ownProps.device.id];
  let authsets = { active: [], inactive: [] };
  authsets = device.auth_sets
    ? device.auth_sets.reduce(
        // for each authset compare the device status and if it matches authset status, put it in correct listv
        (accu, authset) => {
          if (authset.status === device.status) {
            accu.active.push(authset);
          } else {
            accu.inactive.push(authset);
          }
          return accu;
        },
        { active: [], inactive: [] }
      )
    : authsets;
  return {
    device,
    ...authsets
  };
};

export default connect(
  mapStateToProps,
  actionCreators
)(Authsets);
