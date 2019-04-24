import React from 'react';
import { Link } from 'react-router-dom';
import Time from 'react-time';
import ReactTooltip from 'react-tooltip';
import pluralize from 'pluralize';

// material ui
import Button from '@material-ui/core/Button';

import InfoIcon from '@material-ui/icons/InfoOutlined';
import HelpIcon from '@material-ui/icons/Help';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import { setRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
import { preformatWithRequestID } from '../../helpers';
import Loader from '../common/loader';
import { AuthDevices, ExpandAuth } from '../helptips/helptooltips';
import DeviceList from './devicelist';

export default class Pending extends React.Component {
  constructor(props, context) {
    super(props, context);
    const self = this;
    const globalSettings = AppStore.getGlobalSettings();
    this.state = {
      columnHeaders: [
        {
          title: (globalSettings || {}).id_attribute || 'Device ID',
          name: 'device_id',
          customize: () => self.props.openSettingsDialog()
        },
        {
          title: 'First request',
          name: 'first_request',
          render: device => (device.created_ts ? <Time value={device.created_ts} format="YYYY-MM-DD HH:mm" /> : '-')
        },
        {
          title: 'Last updated',
          name: 'last_updated',
          render: device => (device.updated_ts ? <Time value={device.updated_ts} format="YYYY-MM-DD HH:mm" /> : '-')
        },
        {
          title: 'Status',
          name: 'status',
          render: device => (device.status ? <div className="capitalized">{device.status}</div> : '-')
        }
      ],
      devices: [],
      pageNo: 1,
      pageLength: 20,
      selectedRows: [],
      showHelptips: AppStore.showHelptips(),
      authLoading: 'all'
    };
  }

  componentDidMount() {
    clearAllRetryTimers();
    this._getDevices();
  }

  componentWillUnmount() {
    clearAllRetryTimers();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.count !== this.props.count || (prevProps.currentTab !== this.props.currentTab && this.props.currentTab.indexOf('Pending') !== -1)) {
      this._getDevices();
    }
  }

  /*
   * Devices to show
   */
  _getDevices() {
    var self = this;
    AppActions.getDevicesByStatus('pending', this.state.pageNo, this.state.pageLength)
      .then(devices => {
        self.setState({ devices, pageLoading: false, authLoading: null, expandRow: null });
        if (!devices.length && self.props.count) {
          //if devices empty but count not, put back to first page
          self._handlePageChange(1);
        }
      })
      .catch(err => {
        console.log(err);
        var errormsg = err.error || 'Please check your connection.';
        self.setState({ pageLoading: false, authLoading: null });
        setRetryTimer(err, 'devices', `Pending devices couldn't be loaded. ${errormsg}`, self.state.refreshDeviceLength);
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
    this.setState({ selectedRows: selection });
  }

  render() {
    const self = this;
    var limitMaxed = this.props.deviceLimit ? this.props.deviceLimit <= this.props.acceptedDevices : false;
    var limitNear = this.props.deviceLimit ? this.props.deviceLimit < this.props.acceptedDevices + this.state.devices.length : false;
    var selectedOverLimit = this.props.deviceLimit ? this.props.deviceLimit < this.props.acceptedDevices + this.state.selectedRows.length : false;

    var deviceLimitWarning =
      limitMaxed || limitNear ? (
        <p className="warning">
          <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
          {limitMaxed ? <span>You have reached</span> : null}
          {limitNear && !limitMaxed ? <span>You are nearing</span> : null} your limit of authorized devices: {this.props.acceptedDevices} of{' '}
          {this.props.deviceLimit}
        </p>
      ) : null;

    return (
      <div className="tab-container">
        <Loader show={this.state.authLoading} />

        {self.state.showHelptips && this.state.devices.length ? (
          <div>
            <div
              id="onboard-2"
              className={this.props.highlightHelp ? 'tooltip help highlight' : 'tooltip help'}
              data-tip
              data-for="review-devices-tip"
              data-event="click focus"
              style={{ left: '60%', top: '35px' }}
            >
              <HelpIcon />
            </div>
            <ReactTooltip id="review-devices-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
              <AuthDevices devices={this.state.devices.length} />
            </ReactTooltip>
          </div>
        ) : null}

        {this.state.devices.length && this.state.authLoading !== 'all' ? (
          <div className="padding-bottom">
            <h3 className="align-center">
              {this.props.count} {pluralize('devices', this.props.count)} pending authorization
            </h3>

            {deviceLimitWarning}

            <DeviceList
              columnHeaders={self.state.columnHeaders}
              {...self.props}
              {...self.state}
              onSelect={selection => self.onRowSelection(selection)}
              onPageChange={e => self._handlePageChange(e)}
              pageTotal={self.props.count}
            />
          </div>
        ) : (
          <div className={this.state.authLoading ? 'hidden' : 'dashboard-placeholder'}>
            <p>There are no devices pending authorization</p>
            {this.props.highlightHelp ? (
              <p>
                Visit the <Link to="/help/connecting-devices">Help section</Link> to learn how to connect devices to the Mender server.
              </p>
            ) : null}
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
                color="primary"
              >
                {`Authorize ${this.state.selectedRows.length} ${pluralize('devices', this.state.selectedRows.length)}`}
              </Button>
              {deviceLimitWarning}
            </div>
          </div>
        ) : null}

        {self.state.showHelptips && this.state.devices.length ? (
          <div>
            <div
              id="onboard-3"
              className="tooltip highlight help"
              data-tip
              data-for="expand-auth-tip"
              data-event="click focus"
              style={{ left: '16%', top: '170px' }}
            >
              <HelpIcon />
            </div>
            <ReactTooltip id="expand-auth-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
              <ExpandAuth />
            </ReactTooltip>
          </div>
        ) : null}
      </div>
    );
  }
}
