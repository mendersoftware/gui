import React from 'react';
import { connect } from 'react-redux';
import pluralize from 'pluralize';

import { Button } from '@material-ui/core';
import { FilterList as FilterListIcon } from '@material-ui/icons';

import { getDevicesByStatus, selectGroup, setDeviceFilters } from '../../actions/deviceActions';
import { DEVICE_LIST_MAXIMUM_LENGTH, DEVICE_STATES } from '../../constants/deviceConstants';
import Loader from '../common/loader';
import DeviceList from './devicelist';
import { refreshLength as refreshDeviceLength } from './devices';
import Filters from './filters';
import { getIdAttribute, getLimitMaxed } from '../../selectors';
import BaseDevices, { DeviceCreationTime, DeviceExpansion, DeviceStatusHeading, RelativeDeviceTime } from './base-devices';

const defaultHeaders = [
  {
    title: 'First request',
    attribute: { name: 'created_ts', scope: 'system' },
    render: DeviceCreationTime,
    sortable: true
  },
  {
    title: 'Last check-in',
    attribute: { name: 'updated_ts', scope: 'system' },
    render: RelativeDeviceTime,
    sortable: true
  },
  {
    title: 'Status',
    attribute: { name: 'status', scope: 'identity' },
    render: DeviceStatusHeading,
    sortable: true
  },
  {
    title: '',
    attribute: {},
    render: DeviceExpansion,
    sortable: false
  }
];

export class Rejected extends BaseDevices {
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

  render() {
    const self = this;
    const { count, devices, filters, idAttribute, limitMaxed, openSettingsDialog } = self.props;
    const { pageLoading, showFilters } = this.state;
    const columnHeaders = [
      {
        title: idAttribute,
        name: 'device_id',
        customize: openSettingsDialog,
        attribute: { name: idAttribute, scope: 'identity' },
        style: { flexGrow: 1 },
        sortable: true
      },
      ...defaultHeaders
    ];
    return (
      <div className="tab-container flexbox column">
        {!!count && (
          <>
            <div className="flexbox filter-header">
              <h2 className="margin-right">Rejected devices</h2>
              <div className={`flexbox centered ${showFilters ? 'filter-toggle' : ''}`} style={{ marginBottom: -1 }}>
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
    count: state.devices.byStatus.rejected.total,
    devices: state.devices.selectedDeviceList.slice(0, DEVICE_LIST_MAXIMUM_LENGTH),
    filters: state.devices.filters || [],
    idAttribute: getIdAttribute(state),
    limitMaxed: getLimitMaxed(state),
    rejectedDeviceIds: state.devices.byStatus.rejected.deviceIds
  };
};

export default connect(mapStateToProps, actionCreators)(Rejected);
