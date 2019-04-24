import React from 'react';
import Time from 'react-time';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import Loader from '../common/loader';
import { setRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
import DeviceList from './devicelist';

export default class Rejected extends React.Component {
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
    if (prevProps.count !== this.props.count || (prevProps.currentTab !== this.props.currentTab && this.props.currentTab.indexOf('Rejected'))) {
      this._getDevices();
    }
  }

  /*
   * Devices to show
   */
  _getDevices() {
    var self = this;
    AppActions.getDevicesByStatus('rejected', this.state.pageNo, this.state.pageLength)
      .then(devices => {
        self.setState({ devices, pageLoading: false, authLoading: null, expandRow: null });
        if (!devices.length && self.props.count) {
          //if devices empty but count not, put back to first page
          self._handlePageChange(1);
        }
      })
      .catch(error => {
        console.log(error);
        var errormsg = error.error || 'Please check your connection.';
        self.setState({ pageLoading: false, authLoading: null });
        setRetryTimer(error, 'devices', `Rejected devices couldn't be loaded. ${errormsg}`, self.state.refreshDeviceLength);
      });
  }
  _sortColumn(col) {
    console.log(`sort: ${col}`);
  }

  _handlePageChange(pageNo) {
    var self = this;
    self.setState({ pageLoading: true, expandRow: null, pageNo: pageNo }, () => {
      self._getDevices();
    });
  }

  render() {
    var self = this;
    var limitMaxed = this.props.deviceLimit ? this.props.deviceLimit <= this.props.acceptedDevices : false;

    return (
      <div className="tab-container">
        <Loader show={this.state.authLoading === 'all'} />

        {this.state.devices.length && this.state.authLoading !== 'all' ? (
          <div className="padding-bottom">
            <h3 className="align-center">Rejected devices</h3>
            <DeviceList limitMaxed={limitMaxed} {...self.props} {...self.state} onPageChange={e => self._handlePageChange(e)} pageTotal={self.props.count} />
          </div>
        ) : (
          <div className={this.state.authLoading ? 'hidden' : 'dashboard-placeholder'}>
            <p>There are no rejected devices</p>
          </div>
        )}
      </div>
    );
  }
}
