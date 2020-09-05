import React from 'react';
import { connect } from 'react-redux';

// material ui
import Checkbox from '@material-ui/core/Checkbox';

import SettingsIcon from '@material-ui/icons/Settings';
import SortIcon from '@material-ui/icons/Sort';

import { setSnackbar } from '../../actions/appActions';
import { getDeviceAuth, getDeviceById, getDeviceConnect } from '../../actions/deviceActions';

import { DEVICE_STATES } from '../../constants/deviceConstants';
import Loader from '../common/loader';
import Pagination from '../common/pagination';
import DeviceListItem from './devicelistitem';
import { advanceOnboarding, getOnboardingStepCompleted } from '../../utils/onboardingmanager';

export class DeviceList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      expandedDeviceId: null
    };
  }

  componentDidUpdate(prevProps) {
    var self = this;
    const { group } = self.props;

    if (prevProps.group !== group) {
      self.setState({ textfield: group ? decodeURIComponent(group) : 'All devices' });
    }
  }

  _expandRow(event, rowNumber) {
    const self = this;
    if (event.target.closest('input') && event.target.closest('input').hasOwnProperty('checked')) {
      return;
    }
    self.props.setSnackbar('');
    let device = self.props.devices[rowNumber];
    if (self.state.expandedDeviceId === device.id) {
      device = null;
    } else if (device.status === DEVICE_STATES.accepted) {
      // Get full device identity details for single selected device
      Promise.all([self.props.getDeviceAuth(device.id), self.props.getDeviceConnect(device.id), self.props.getDeviceById(device.id)]).catch(err =>
        console.log(`Error: ${err}`)
      );
    } else {
      self.props.getDeviceAuth(device.id);
    }
    if (!self.props.onboardingComplete) {
      if (!getOnboardingStepCompleted('devices-pending-accepting-onboarding')) {
        advanceOnboarding('devices-pending-accepting-onboarding');
      }
      if (getOnboardingStepCompleted('devices-pending-accepting-onboarding') && self.props.acceptedDevicesCount) {
        advanceOnboarding('devices-accepted-onboarding');
      }
    }
    self.setState({ expandedDeviceId: device ? device.id : null });
  }

  _isSelected(index) {
    return this.props.onSelect && this.props.selectedRows.indexOf(index) !== -1;
  }

  _onRowSelection(selectedRow) {
    const self = this;
    const { onSelect, selectedRows } = self.props;
    const selectedIndex = selectedRows.indexOf(selectedRow);
    let updatedSelection = [];
    if (selectedIndex === -1) {
      updatedSelection = updatedSelection.concat(selectedRows, selectedRow);
    } else {
      selectedRows.splice(selectedIndex, 1);
      updatedSelection = selectedRows;
    }
    onSelect(updatedSelection);
  }

  onSelectAllClick() {
    const self = this;
    let selectedRows = Array.apply(null, { length: this.props.devices.length }).map(Number.call, Number);
    if (self.props.selectedRows.length && self.props.selectedRows.length <= self.props.devices.length) {
      selectedRows = [];
    }
    self.props.onSelect(selectedRows);
  }

  onPageChange(page) {
    this.props.onPageChange(page);
    this.setState({ expandedDeviceId: null });
  }

  render() {
    const self = this;
    const {
      className,
      columnHeaders,
      devices,
      expandable = true,
      pageLength,
      pageLoading,
      pageNo,
      pageTotal,
      onChangeRowsPerPage,
      onSelect,
      onSort,
      selectedRows,
      showPagination = true,
      sortCol,
      sortDown
    } = self.props;
    const { expandedDeviceId } = self.state;
    const columnWidth = `${(onSelect ? 90 : 100) / columnHeaders.length}%`;
    const numSelected = (selectedRows || []).length;
    return (
      <div className={`deviceList ${className || ''}`}>
        <div className="flexbox header" style={{ padding: '0 12px' }}>
          {onSelect ? (
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < devices.length}
              checked={numSelected === devices.length}
              onChange={() => self.onSelectAllClick()}
            />
          ) : null}
          {columnHeaders.map((item, index) => (
            <div
              className="columnHeader"
              key={`columnHeader-${index}`}
              style={Object.assign({ width: item.width || columnWidth }, item.style)}
              onClick={() => onSort(item.attribute ? item.attribute : {})}
            >
              {item.title}
              {item.sortable ? <SortIcon className={`sortIcon ${sortCol === item.attribute.name ? 'selected' : ''} ${sortDown.toString()}`} /> : null}
              {item.customize ? <SettingsIcon onClick={item.customize} style={{ fontSize: 16, marginLeft: 'auto' }} /> : null}
            </div>
          ))}
          {expandable && <div style={{ width: 48 }} />}
        </div>
        <div className="body">
          {devices.map((device, index) => (
            <DeviceListItem
              {...self.props}
              device={device}
              expanded={expandedDeviceId === device.id}
              key={`device-${device.id}`}
              selectable={!!onSelect}
              selected={self._isSelected(index)}
              onClick={event => (expandable ? self._expandRow(event, index) : self._onRowSelection(index))}
              onRowSelect={() => self._onRowSelection(index)}
            />
          ))}
        </div>
        {showPagination && (
          <Pagination
            count={pageTotal}
            rowsPerPage={pageLength}
            onChangeRowsPerPage={onChangeRowsPerPage}
            page={pageNo}
            onChangePage={page => self.onPageChange(page)}
          />
        )}
        {pageLoading ? (
          <div className="smallLoaderContainer">
            <Loader show={true} />
          </div>
        ) : null}
      </div>
    );
  }
}

const actionCreators = { getDeviceAuth, getDeviceById, getDeviceConnect, setSnackbar };
const mapStateToProps = (state, ownProps) => {
  const devices = ownProps.devices.reduce((accu, deviceId) => {
    if (deviceId && state.devices.byId[deviceId]) {
      accu.push({ auth_sets: [], ...state.devices.byId[deviceId] });
    }
    return accu;
  }, []);
  return {
    acceptedDevicesCount: state.devices.byStatus.accepted.total,
    devices,
    filters: state.devices.filters,
    globalSettings: state.users.globalSettings,
    onboardingComplete: state.users.onboarding.complete
  };
};

export default connect(mapStateToProps, actionCreators)(DeviceList);
