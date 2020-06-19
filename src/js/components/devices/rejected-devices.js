import React from 'react';
import { connect } from 'react-redux';
import Time from 'react-time';
import pluralize from 'pluralize';

import { getDevicesByStatus, selectGroup, setDeviceFilters } from '../../actions/deviceActions';
import { setSnackbar } from '../../actions/appActions';
import { DEVICE_LIST_MAXIMUM_LENGTH, DEVICE_STATES } from '../../constants/deviceConstants';
import Loader from '../common/loader';
import RelativeTime from '../common/relative-time';
import DeviceList from './devicelist';
import { refreshLength as refreshDeviceLength } from './devices';
import Filters from './filters';

export class Rejected extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      pageNo: 1,
      pageLength: 20,
      pageLoading: true
    };
    if (!props.rejectedDeviceIds.length) {
      props.getDevicesByStatus(DEVICE_STATES.rejected);
    }
  }

  componentDidMount() {
    this.props.selectGroup();
    this.props.setDeviceFilters([]);
    this.timer = setInterval(() => this._getDevices(), refreshDeviceLength);
    this._getDevices(true);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.count !== this.props.count) {
      this.props.setDeviceFilters([]);
      this._getDevices();
      if (!this.props.devices.length && this.props.count) {
        //if devices empty but count not, put back to first page
        this._handlePageChange(1);
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.state.pageLoading != nextProps.pageLoading || this.props.devices.some((device, index) => device !== nextProps.devices[index]);
  }

  /*
   * Devices to show
   */
  _getDevices(shouldUpdate = false, filters = []) {
    var self = this;
    self.setState({ pageNo: filters.length ? 1 : self.state.pageNo, pageLength: filters.length ? DEVICE_LIST_MAXIMUM_LENGTH : self.state.pageLength }, () =>
      self.props
        .getDevicesByStatus(DEVICE_STATES.rejected, this.state.pageNo, this.state.pageLength, shouldUpdate)
        .catch(error => {
          console.log(error);
          var errormsg = error.error || 'Please check your connection.';
          self.props.setSnackbar(errormsg, 5000, '');
          console.log(errormsg);
        })
        .finally(() => {
          self.setState({ pageLoading: false });
        })
    );
  }
  _sortColumn(col) {
    console.log(`sort: ${col}`);
  }

  _handlePageChange(pageNo) {
    var self = this;
    self.setState({ pageLoading: true, expandRow: null, pageNo: pageNo }, () => self._getDevices(true));
  }

  render() {
    var self = this;
    const { acceptedDevices, count, deviceLimit, devices, filters, globalSettings, openSettingsDialog } = self.props;
    var limitMaxed = deviceLimit ? deviceLimit <= acceptedDevices : false;
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
    return (
      <div className="tab-container">
        {!!count && (
          <div className="align-center">
            <h3 className="inline-block margin-right">Rejected devices</h3>
            {!this.state.pageLoading && <Filters identityOnly={true} onFilterChange={filters => self._getDevices(true, filters)} />}
          </div>
        )}
        <Loader show={this.state.pageLoading} />
        {devices.length && !this.state.pageLoading ? (
          <div className="padding-bottom">
            <DeviceList
              {...self.props}
              {...self.state}
              columnHeaders={columnHeaders}
              limitMaxed={limitMaxed}
              onPageChange={e => self._handlePageChange(e)}
              onChangeRowsPerPage={pageLength => self.setState({ pageNo: 1, pageLength }, () => self._handlePageChange(1))}
              pageTotal={count}
              refreshDevices={shouldUpdate => self._getDevices(shouldUpdate)}
            />
          </div>
        ) : (
          <div className={this.state.pageLoading ? 'hidden' : 'dashboard-placeholder'}>
            <p>
              {filters.length ? `There are no rejected devices matching the selected ${pluralize('filters', filters.length)}` : 'There are no rejected devices'}
            </p>
          </div>
        )}
      </div>
    );
  }
}

const actionCreators = { getDevicesByStatus, selectGroup, setDeviceFilters, setSnackbar };

const mapStateToProps = state => {
  return {
    acceptedDevices: state.devices.byStatus.accepted.total || 0,
    count: state.devices.byStatus.rejected.total,
    devices: state.devices.selectedDeviceList.slice(0, DEVICE_LIST_MAXIMUM_LENGTH),
    deviceLimit: state.devices.limit,
    filters: state.devices.filters || [],
    globalSettings: state.users.globalSettings,
    rejectedDeviceIds: state.devices.byStatus.rejected.deviceIds
  };
};

export default connect(mapStateToProps, actionCreators)(Rejected);
