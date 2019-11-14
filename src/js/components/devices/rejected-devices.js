import React from 'react';
import { connect } from 'react-redux';
import Time from 'react-time';

import { getDevicesByStatus } from '../../actions/deviceActions';
import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import Loader from '../common/loader';
import DeviceList from './devicelist';

export class Rejected extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
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

  shouldComponentUpdate(nextProps) {
    return this.state.pageLoading != nextProps.pageLoading || this.props.devices.some((device, index) => device !== nextProps.devices[index]);
  }

  _onChange() {
    const self = this;
    if (!self.props.devices.length && self.props.count) {
      //if devices empty but count not, put back to first page
      self._handlePageChange(1);
    }
  }

  /*
   * Devices to show
   */
  _getDevices() {
    var self = this;
    self.props
      .getDevicesByStatus(DEVICE_STATES.rejected, this.state.pageNo, this.state.pageLength)
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
        customize: () => self.props.openSettingsDialog(),
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

        {this.props.devices.length && !this.state.pageLoading ? (
          <div className="padding-bottom">
            <h3 className="align-center">Rejected devices</h3>
            <DeviceList
              {...self.props}
              {...self.state}
              columnHeaders={columnHeaders}
              limitMaxed={limitMaxed}
              onPageChange={e => self._handlePageChange(e)}
              pageTotal={self.props.count}
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

const actionCreators = { getDevicesByStatus };

const mapStateToProps = state => {
  return {
    acceptedDevices: state.devices.byStatus.rejected.total || 0,
    devices: state.devices.selectedDeviceList,
    deviceLimit: state.devices.limit,
    count: state.devices.byStatus.rejected.total
  };
};

export default connect(
  mapStateToProps,
  actionCreators
)(Rejected);
