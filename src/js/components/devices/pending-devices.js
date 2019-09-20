import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import Time from 'react-time';
import pluralize from 'pluralize';

// material ui
import Button from '@material-ui/core/Button';

import InfoIcon from '@material-ui/icons/InfoOutlined';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import { preformatWithRequestID } from '../../helpers';
import Loader from '../common/loader';
import { DevicePendingTip } from '../helptips/onboardingtips';
import DeviceList from './devicelist';
import { getOnboardingComponentFor, advanceOnboarding, getOnboardingStepCompleted } from '../../utils/onboardingmanager';

export default class Pending extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      count: AppStore.getTotalPendingDevices(),
      devices: AppStore.getPendingDevices(),
      pageNo: 1,
      pageLength: 20,
      selectedRows: [],
      showHelptips: AppStore.showHelptips(),
      refreshDeviceLength: 10000,
      authLoading: 'all',
      pageLoading: true
    };
  }

  componentWillMount() {
    AppStore.changeListener(this._onChange.bind(this));
  }
  componentDidMount() {
    this.timer = setInterval(() => this._getDevices(), this.state.refreshDeviceLength);
    this._getDevices();
  }
  componentWillUnmount() {
    AppStore.removeChangeListener(this._onChange.bind(this));
    clearInterval(this.timer);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.count !== this.props.count || (prevProps.currentTab !== this.props.currentTab && this.props.currentTab.indexOf('Pending') !== -1)) {
      this._getDevices();
    }
  }

  shouldComponentUpdate(_, nextState) {
    return !this.state.devices.every((device, index) => device === nextState.devices[index]) || true;
  }

  _onChange() {
    const self = this;
    let state = {
      devices: AppStore.getPendingDevices(),
      count: AppStore.getTotalPendingDevices()
    };
    if (!state.devices.length && state.count) {
      //if devices empty but count not, put back to first page
      self._handlePageChange(1);
    } else {
      self.setState(state);
    }
  }

  /*
   * Devices to show
   */
  _getDevices() {
    var self = this;
    AppActions.getDevicesByStatus('pending', this.state.pageNo, this.state.pageLength)
      // TODO: get inventory data for all devices retrieved here to get proper updated_ts
      .catch(error => {
        console.log(error);
        var errormsg = error.error || 'Please check your connection.';
        AppActions.setSnackbar(errormsg, 5000, '');
        console.log(errormsg);
      })
      .finally(() => {
        self.setState({ pageLoading: false, authLoading: null });
      });
  }

  _sortColumn() {
    console.log('sort');
  }

  _handlePageChange(pageNo) {
    var self = this;
    self.setState({ selectedRows: [], currentPage: pageNo, pageLoading: true, expandRow: null, pageNo: pageNo }, () => {
      self._getDevices();
    });
  }

  _getDevicesFromSelectedRows() {
    // use selected rows to get device from corresponding position in devices array
    const self = this;
    const devices = self.state.selectedRows.map(row => self.state.devices[row]);
    return devices;
  }

  _getSnackbarMessage(skipped, done) {
    pluralize.addIrregularRule('its', 'their');
    var skipText = skipped
      ? `${skipped} ${pluralize('devices', skipped)} ${pluralize('have', skipped)} more than one pending authset. Expand ${pluralize(
        'this',
        skipped
      )} ${pluralize('device', skipped)} to individually adjust ${pluralize('their', skipped)} authorization status. `
      : '';
    var doneText = done ? `${done} ${pluralize('device', done)} ${pluralize('was', done)} updated successfully. ` : '';
    AppActions.setSnackbar(doneText + skipText);
  }

  _authorizeDevices() {
    var self = this;
    var devices = this._getDevicesFromSelectedRows();
    self.setState({ authLoading: true });
    var skipped = 0;
    var count = 0;

    // for each device, get id and id of authset & make api call to accept
    // if >1 authset, skip instead
    const deviceAuthUpdates = devices.map(device => {
      if (device.auth_sets.length !== 1) {
        skipped++;
        return Promise.resolve();
      }
      // api call device.id and device.authsets[0].id
      return AppActions.updateDeviceAuth(device.id, device.auth_sets[0].id, 'accepted')
        .then(() => count++)
        .catch(err => {
          var errMsg = err.res.error.message || '';
          console.log(errMsg);
          // break if an error occurs, display status up til this point before error message
          self._getSnackbarMessage(skipped, count);
          setTimeout(() => {
            AppActions.setSnackbar(
              preformatWithRequestID(err.res, `The action was stopped as there was a problem updating a device authorization status: ${errMsg}`),
              null,
              'Copy to clipboard'
            );
            self.setState({ selectedRows: [] });
            self.props.restart();
          }, 4000);
          self.break;
        });
    });
    return Promise.all(deviceAuthUpdates).then(() => {
      self._getSnackbarMessage(skipped, count);
      // refresh devices by calling function in parent
      self.props.restart();
      self.setState({ selectedRows: [] });
    });
  }

  onRowSelection(selection) {
    if (!AppStore.getOnboardingComplete()) {
      advanceOnboarding('devices-pending-accepting-onboarding');
    }
    this.setState({ selectedRows: selection });
  }

  render() {
    const self = this;
    var limitMaxed = this.props.deviceLimit ? this.props.deviceLimit <= this.props.acceptedDevices : false;
    var limitNear = this.props.deviceLimit ? this.props.deviceLimit < this.props.acceptedDevices + this.state.devices.length : false;
    var selectedOverLimit = this.props.deviceLimit ? this.props.deviceLimit < this.props.acceptedDevices + this.state.selectedRows.length : false;

    const columnHeaders = [
      {
        title: (AppStore.getGlobalSettings() || {}).id_attribute || 'Device ID',
        name: 'device_id',
        customize: () => self.props.openSettingsDialog(),
        style: { flexGrow: 1 }
      },
      {
        title: 'First request',
        name: 'first_request',
        render: device => (device.created_ts ? <Time value={device.created_ts} format="YYYY-MM-DD HH:mm" /> : '-')
      },
      {
        title: 'Last checkin',
        name: 'last_checkin',
        render: device => (device.updated_ts ? <Time value={device.updated_ts} format="YYYY-MM-DD HH:mm" /> : '-')
      },
      {
        title: 'Status',
        name: 'status',
        render: device => (device.status ? <div className="capitalized">{device.status}</div> : '-')
      }
    ];

    var deviceLimitWarning =
      limitMaxed || limitNear ? (
        <p className="warning">
          <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
          {limitMaxed ? <span>You have reached</span> : null}
          {limitNear && !limitMaxed ? <span>You are nearing</span> : null} your limit of authorized devices: {this.props.acceptedDevices} of{' '}
          {this.props.deviceLimit}
        </p>
      ) : null;

    const deviceConnectingProgressed = getOnboardingStepCompleted('devices-pending-onboarding');
    let onboardingComponent = null;
    if (AppStore.showHelptips() && !AppStore.getOnboardingComplete()) {
      if (this.deviceListRef) {
        const element = this.deviceListRef ? this.deviceListRef.getElementsByClassName('body')[0] : null;
        onboardingComponent = getOnboardingComponentFor('devices-pending-onboarding', {
          anchor: { left: 200, top: element ? element.offsetTop + element.offsetHeight : 170 }
        });
      }
      if (this.state.selectedRows && this.authorizeRef) {
        const anchor = {
          left: this.authorizeRef.offsetLeft - this.authorizeRef.offsetWidth / 2,
          top: this.authorizeRef.offsetParent.offsetTop - this.authorizeRef.offsetParent.offsetHeight - this.authorizeRef.offsetHeight / 2
        };
        onboardingComponent = getOnboardingComponentFor('devices-pending-accepting-onboarding', { place: 'left', anchor });
      }
      if (AppStore.getTotalAcceptedDevices() && !window.sessionStorage.getItem('pendings-redirect')) {
        window.sessionStorage.setItem('pendings-redirect', true);
        return <Redirect to="/devices" />;
      }
    }

    return (
      <div className="tab-container">
        <Loader show={this.state.authLoading} />

        {this.state.devices.length && (!this.state.pageLoading || this.state.authLoading !== 'all') ? (
          <div className="padding-bottom" ref={ref => (this.deviceListRef = ref)}>
            <h3 className="align-center">
              {this.state.count} {pluralize('devices', this.state.count)} pending authorization
            </h3>

            {deviceLimitWarning}

            <DeviceList
              {...self.props}
              {...self.state}
              className="pending"
              columnHeaders={columnHeaders}
              limitMaxed={limitMaxed}
              onSelect={selection => self.onRowSelection(selection)}
              onChangeRowsPerPage={pageLength => self.setState({ pageNo: 1, pageLength })}
              onPageChange={e => self._handlePageChange(e)}
              pageTotal={self.state.count}
              refreshDevices={() => self._getDevices()}
            />
          </div>
        ) : (
          <div>
            {self.state.showHelptips && !AppStore.getOnboardingComplete() && !deviceConnectingProgressed ? (
              <DevicePendingTip />
            ) : (
              <div className={this.state.authLoading ? 'hidden' : 'dashboard-placeholder'}>
                <p>There are no devices pending authorization</p>
                {this.props.highlightHelp ? (
                  <p>
                    Visit the <Link to="/help/getting-started">Help section</Link> to learn how to connect devices to the Mender server.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        )}

        {this.state.selectedRows.length ? (
          <div className="fixedButtons">
            <div className="float-right">
              {this.state.authLoading ? <Loader style={{ width: '100px', top: '7px', position: 'relative' }} table={true} waiting={true} show={true} /> : null}

              <span className="margin-right">
                {this.state.selectedRows.length} {pluralize('devices', this.state.selectedRows.length)} selected
              </span>
              <Button
                variant="contained"
                disabled={this.props.disabled || limitMaxed || selectedOverLimit}
                onClick={() => this._authorizeDevices()}
                buttonRef={ref => (this.authorizeRef = ref)}
                color="primary"
              >
                {`Authorize ${this.state.selectedRows.length} ${pluralize('devices', this.state.selectedRows.length)}`}
              </Button>
              {deviceLimitWarning}
            </div>
          </div>
        ) : null}
        {onboardingComponent ? onboardingComponent : null}
      </div>
    );
  }
}
