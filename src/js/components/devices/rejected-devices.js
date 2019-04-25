import React from 'react';
import Time from 'react-time';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import Loader from '../common/loader';
import DeviceList from './devicelist';

export default class Rejected extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      count: AppStore.getTotalRejectedDevices(),
      devices: AppStore.getRejectedDevices(),
      pageNo: 1,
      pageLength: 20,
      refreshDeviceLength: 10000,
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
    if (prevProps.count !== this.props.count || (prevProps.currentTab !== this.props.currentTab && this.props.currentTab.indexOf('Rejected'))) {
      this._getDevices();
    }
  }

  shouldComponentUpdate(_, nextState) {
    return this.state.pageLoading != nextState.pageLoading || this.state.devices.some((device, index) => device !== nextState.devices[index]);
  }

  _onChange() {
    const self = this;
    let state = {
      devices: AppStore.getRejectedDevices(),
      count: AppStore.getTotalRejectedDevices()
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
    AppActions.getDevicesByStatus('rejected', this.state.pageNo, this.state.pageLength)
      // TODO: get inventory data for all devices retrieved here to get proper updated_ts
      .catch(error => {
        console.log(error);
        var errormsg = error.error || 'Please check your connection.';
        AppActions.setSnackbar(errormsg, 5000, '');
        console.log(errormsg);
      })
      .finally(() => {
        self.setState({ pageLoading: false });
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
    const columnHeaders = [
      {
        title: (AppStore.getGlobalSettings() || {}).id_attribute || 'Device ID',
        name: 'device_id',
        customize: () => self.props.openSettingsDialog()
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
    return (
      <div className="tab-container">
        <Loader show={this.state.pageLoading} />

        {this.state.devices.length && !this.state.pageLoading ? (
          <div className="padding-bottom">
            <h3 className="align-center">Rejected devices</h3>
            <DeviceList
              {...self.props}
              {...self.state}
              columnHeaders={columnHeaders}
              limitMaxed={limitMaxed}
              onPageChange={e => self._handlePageChange(e)}
              pageTotal={self.state.count}
              refreshDevices={() => self._getDevices()}
            />
          </div>
        ) : (
          <div className={this.state.pageLoading ? 'hidden' : 'dashboard-placeholder'}>
            <p>There are no rejected devices</p>
          </div>
        )}
      </div>
    );
  }
}
