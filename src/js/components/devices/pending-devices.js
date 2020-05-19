import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import Time from 'react-time';
import pluralize from 'pluralize';

// material ui
import { Button } from '@material-ui/core';

import { InfoOutlined as InfoIcon } from '@material-ui/icons';

import { getAllDevicesByStatus, getDevicesByStatus, setDeviceFilters, updateDeviceAuth } from '../../actions/deviceActions';
import { setSnackbar } from '../../actions/appActions';

import { DEVICE_LIST_MAXIMUM_LENGTH, DEVICE_STATES } from '../../constants/deviceConstants';
import { preformatWithRequestID } from '../../helpers';
import { getOnboardingComponentFor, advanceOnboarding, getOnboardingStepCompleted } from '../../utils/onboardingmanager';
import Loader from '../common/loader';
import RelativeTime from '../common/relative-time';
import { DevicePendingTip } from '../helptips/onboardingtips';
import DeviceList from './devicelist';
import Filters from './filters';

const refreshDeviceLength = 10000;

export class Pending extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      pageNo: 1,
      pageLength: 20,
      selectedRows: [],
      authLoading: 'all',
      pageLoading: true
    };
    if (!props.pendingDeviceIds.length) {
      props.getAllDevicesByStatus(DEVICE_STATES.pending);
    }
  }

  componentDidMount() {
    this.timer = setInterval(() => this._getDevices(), refreshDeviceLength);
    this._getDevices(true);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.count !== this.props.count || (prevProps.currentTab !== this.props.currentTab && this.props.currentTab.indexOf('Pending') !== -1)) {
      this.props.setDeviceFilters([]);
      this._getDevices();
    }
    const self = this;
    if (!self.props.devices.length && self.props.count && self.state.pageNo !== 1) {
      //if devices empty but count not, put back to first page
      self._handlePageChange(1);
    }
  }

  shouldComponentUpdate(nextProps) {
    return (
      !this.props.devices.every((device, index) => device === nextProps.devices[index]) ||
      this.props.globalSettings.id_attribute !== nextProps.globalSettings.id_attribute ||
      true
    );
  }

  /*
   * Devices to show
   */
  _getDevices(shouldUpdate = false, filters = []) {
    var self = this;
    self.setState({ pageNo: filters.length ? 1 : self.state.pageNo, pageLength: filters.length ? DEVICE_LIST_MAXIMUM_LENGTH : self.state.pageLength }, () =>
      self.props
        .getDevicesByStatus(DEVICE_STATES.pending, this.state.pageNo, this.state.pageLength, shouldUpdate)
        .catch(error => {
          console.log(error);
          var errormsg = error.error || 'Please check your connection.';
          self.props.setSnackbar(errormsg, 5000, '');
          console.log(errormsg);
        })
        .finally(() => {
          self.setState({ pageLoading: false, authLoading: null });
        })
    );
  }

  _sortColumn() {
    console.log('sort');
  }

  _handlePageChange(pageNo) {
    var self = this;
    self.setState({ selectedRows: [], currentPage: pageNo, pageLoading: true, expandRow: null, pageNo: pageNo }, () => self._getDevices(true));
  }

  _getDevicesFromSelectedRows() {
    // use selected rows to get device from corresponding position in devices array
    const self = this;
    const devices = self.state.selectedRows.map(row => self.props.fullDevices[row]);
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
    this.props.setSnackbar(doneText + skipText);
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
      return self.props
        .updateDeviceAuth(device.id, device.auth_sets[0].id, DEVICE_STATES.accepted)
        .then(() => count++)
        .catch(err => {
          var errMsg = err.res.error.message || '';
          console.log(errMsg);
          // break if an error occurs, display status up til this point before error message
          self._getSnackbarMessage(skipped, count);
          setTimeout(() => {
            self.props.setSnackbar(
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
    if (!this.props.onboardingComplete) {
      advanceOnboarding('devices-pending-accepting-onboarding');
    }
    this.setState({ selectedRows: selection });
  }

  render() {
    const self = this;
    const {
      acceptedDevices,
      count,
      devices,
      deviceLimit,
      disabled,
      filters,
      globalSettings,
      highlightHelp,
      onboardingComplete,
      openSettingsDialog,
      showHelptips,
      showOnboardingTips
    } = self.props;
    var limitMaxed = deviceLimit ? deviceLimit <= acceptedDevices : false;
    var limitNear = deviceLimit ? deviceLimit < acceptedDevices + devices.length : false;
    var selectedOverLimit = deviceLimit ? deviceLimit < acceptedDevices + this.state.selectedRows.length : false;

    const columnHeaders = [
      {
        title: globalSettings.id_attribute || 'Device ID',
        name: 'device_id',
        customize: openSettingsDialog,
        style: { flexGrow: 1 }
      },
      {
        title: 'First request',
        name: 'first_request',
        render: device => (device.created_ts ? <Time value={device.created_ts} format="YYYY-MM-DD HH:mm" /> : '-')
      },
      {
        title: 'Last check-in',
        name: 'last_checkin',
        render: device => <RelativeTime updateTime={device.updated_ts} />
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
          {limitNear && !limitMaxed ? <span>You are nearing</span> : null} your limit of authorized devices: {acceptedDevices} of {deviceLimit}
        </p>
      ) : null;

    const deviceConnectingProgressed = getOnboardingStepCompleted('devices-pending-onboarding');
    let onboardingComponent = null;
    if (showHelptips && !onboardingComplete) {
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
      if (acceptedDevices && !window.sessionStorage.getItem('pendings-redirect')) {
        window.sessionStorage.setItem('pendings-redirect', true);
        return <Redirect to="/devices" />;
      }
    }

    return (
      <div className="tab-container">
        {!!count && (
          <div className="align-center">
            <h3 className="inline-block margin-right">
              {count} {pluralize('devices', count)} pending authorization
            </h3>
            {!this.state.authLoading && <Filters identityOnly={true} onFilterChange={filters => self._getDevices(true, filters)} />}
          </div>
        )}
        <Loader show={this.state.authLoading} />
        {devices.length && (!this.state.pageLoading || this.state.authLoading !== 'all') ? (
          <div className="padding-bottom" ref={ref => (this.deviceListRef = ref)}>
            {deviceLimitWarning}
            <DeviceList
              {...self.props}
              {...self.state}
              className="pending"
              columnHeaders={columnHeaders}
              limitMaxed={limitMaxed}
              onSelect={selection => self.onRowSelection(selection)}
              onChangeRowsPerPage={pageLength => self.setState({ pageNo: 1, pageLength }, () => self._handlePageChange(1))}
              onPageChange={e => self._handlePageChange(e)}
              pageTotal={count}
              refreshDevices={shouldUpdate => self._getDevices(shouldUpdate)}
            />
          </div>
        ) : (
          <div>
            {showHelptips && showOnboardingTips && !onboardingComplete && !deviceConnectingProgressed ? (
              <DevicePendingTip />
            ) : (
              <div className={this.state.authLoading ? 'hidden' : 'dashboard-placeholder'}>
                <p>
                  {filters.length
                    ? `There are no pending devices matching the selected ${pluralize('filters', filters.length)}`
                    : 'There are no devices pending authorization'}
                </p>
                {highlightHelp ? (
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
                disabled={disabled || limitMaxed || selectedOverLimit}
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

const actionCreators = { getAllDevicesByStatus, getDevicesByStatus, setDeviceFilters, setSnackbar, updateDeviceAuth };

const mapStateToProps = state => {
  return {
    acceptedDevices: state.devices.byStatus.accepted.total || 0,
    count: state.devices.byStatus.pending.total,
    devices: state.devices.selectedDeviceList.slice(0, DEVICE_LIST_MAXIMUM_LENGTH),
    deviceLimit: state.devices.limit,
    filters: state.devices.filters || [],
    fullDevices: state.devices.selectedDeviceList.map(id => state.devices.byId[id]),
    globalSettings: state.users.globalSettings,
    highlightHelp: !state.devices.byStatus.accepted.total,
    onboardingComplete: state.users.onboarding.complete,
    pendingDeviceIds: state.devices.byStatus.pending.deviceIds,
    showHelptips: state.users.showHelptips,
    showOnboardingTips: state.users.onboarding.showTips
  };
};

export default connect(mapStateToProps, actionCreators)(Pending);
