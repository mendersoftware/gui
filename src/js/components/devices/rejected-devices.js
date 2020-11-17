import React from 'react';
import { connect } from 'react-redux';
import Time from 'react-time';
import pluralize from 'pluralize';

import { Button } from '@material-ui/core';
import { FilterList as FilterListIcon } from '@material-ui/icons';

import { getDevicesByStatus, selectGroup, setDeviceFilters } from '../../actions/deviceActions';
import { DEVICE_LIST_MAXIMUM_LENGTH, DEVICE_STATES } from '../../constants/deviceConstants';
import Loader from '../common/loader';
import RelativeTime from '../common/relative-time';
import DeviceList from './devicelist';
import { refreshLength as refreshDeviceLength } from './devices';
import Filters from './filters';
import { getIdAttribute } from '../../selectors';

export class Rejected extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      pageNo: 1,
      pageLength: 20,
      pageLoading: true,
      sortCol: null,
      sortDown: true,
      sortScope: null
    };
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
  _getDevices(shouldUpdate = false) {
    var self = this;
    const { pageNo, pageLength, sortCol, sortDown, sortScope } = self.state;
    const sortBy = sortCol ? [{ attribute: sortCol, order: sortDown ? 'desc' : 'asc', scope: sortScope }] : undefined;
    self.props
      .getDevicesByStatus(DEVICE_STATES.rejected, pageNo, pageLength, shouldUpdate, undefined, sortBy)
      .finally(() => self.setState({ pageLoading: false }));
  }

  _handlePageChange(pageNo) {
    var self = this;
    self.setState({ pageLoading: true, expandRow: null, pageNo: pageNo }, () => self._getDevices(true));
  }

  onSortChange(attribute) {
    const self = this;
    let state = { sortCol: attribute.name, sortDown: !self.state.sortDown, sortScope: attribute.scope };
    if (attribute.name !== self.state.sortCol) {
      state.sortDown = true;
    }
    state.sortCol = attribute.name === 'Device ID' ? 'id' : self.state.sortCol;
    self.setState(state, () => self._getDevices(true));
  }

  render() {
    const self = this;
    const { acceptedDevices, count, deviceLimit, devices, filters, idAttribute, openSettingsDialog } = self.props;
    const { pageLoading, showFilters } = this.state;
    const limitMaxed = deviceLimit ? deviceLimit <= acceptedDevices : false;
    const columnHeaders = [
      {
        title: idAttribute,
        name: 'device_id',
        customize: openSettingsDialog,
        attribute: { name: idAttribute, scope: 'identity' },
        style: { flexGrow: 1 },
        sortable: true
      },
      {
        title: 'First request',
        attribute: { name: 'created_ts', scope: 'system' },
        render: device => (device.created_ts ? <Time value={device.created_ts} format="YYYY-MM-DD HH:mm" /> : '-'),
        sortable: true
      },
      {
        title: 'Last check-in',
        attribute: { name: 'updated_ts', scope: 'system' },
        render: device => <RelativeTime updateTime={device.updated_ts} />,
        sortable: true
      },
      {
        title: 'Status',
        attribute: { name: 'status', scope: 'identity' },
        render: device => (device.status ? <div className="capitalized">{device.status}</div> : '-'),
        sortable: true
      }
    ];
    return (
      <div className="tab-container">
        {!!count && (
          <>
            <div className="flexbox" style={{ zIndex: 2, marginBottom: -1 }}>
              <h2 className="inline-block margin-right">Rejected devices</h2>
              {!pageLoading && (
                <div className={`flexbox centered ${showFilters ? 'filter-toggle' : ''}`}>
                  <Button
                    color="secondary"
                    disableRipple
                    onClick={() => self.setState({ showFilters: !showFilters })}
                    startIcon={<FilterListIcon />}
                    style={{ backgroundColor: 'transparent' }}
                  >
                    {filters.length > 0 ? `Filters (${filters.length})` : 'Filters'}
                  </Button>
                </div>
              )}
            </div>
            <Filters identityOnly={true} onFilterChange={() => self.setState({ pageNo: 1 }, () => self._getDevices(true))} open={showFilters} />
            {!pageLoading && (
              <p className="info">
                Showing {devices.length} of {count} rejected {pluralize('devices', count)}
              </p>
            )}
          </>
        )}
        <Loader show={pageLoading} />
        {devices.length && !pageLoading ? (
          <div className="padding-bottom">
            <DeviceList
              {...self.props}
              {...self.state}
              columnHeaders={columnHeaders}
              limitMaxed={limitMaxed}
              onPageChange={e => self._handlePageChange(e)}
              onChangeRowsPerPage={pageLength => self.setState({ pageNo: 1, pageLength }, () => self._handlePageChange(1))}
              onSort={attribute => self.onSortChange(attribute)}
              pageTotal={count}
              refreshDevices={shouldUpdate => self._getDevices(shouldUpdate)}
            />
          </div>
        ) : (
          <div className={pageLoading ? 'hidden' : 'dashboard-placeholder'}>
            <p>
              {filters.length ? `There are no rejected devices matching the selected ${pluralize('filters', filters.length)}` : 'There are no rejected devices'}
            </p>
          </div>
        )}
      </div>
    );
  }
}

const actionCreators = { getDevicesByStatus, selectGroup, setDeviceFilters };

const mapStateToProps = state => {
  return {
    acceptedDevices: state.devices.byStatus.accepted.total || 0,
    count: state.devices.byStatus.rejected.total,
    devices: state.devices.selectedDeviceList.slice(0, DEVICE_LIST_MAXIMUM_LENGTH),
    deviceLimit: state.devices.limit,
    filters: state.devices.filters || [],
    idAttribute: getIdAttribute(state),
    rejectedDeviceIds: state.devices.byStatus.rejected.deviceIds
  };
};

export default connect(mapStateToProps, actionCreators)(Rejected);
