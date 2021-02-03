import React from 'react';
import { connect } from 'react-redux';

// material ui
import Checkbox from '@material-ui/core/Checkbox';

import SettingsIcon from '@material-ui/icons/Settings';
import SortIcon from '@material-ui/icons/Sort';

import { setSnackbar } from '../../actions/appActions';
import { getDeviceAuth, getDeviceById, getDeviceConnect } from '../../actions/deviceActions';
import { advanceOnboarding } from '../../actions/onboardingActions';

import { DEVICE_STATES } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import Loader from '../common/loader';
import Pagination from '../common/pagination';
import DeviceListItem from './devicelistitem';
import { refreshLength as refreshDeviceLength } from './devices';

export class DeviceList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      expandedDeviceId: null
    };
  }

  componentDidUpdate() {
    const { acceptedDevicesCount, advanceOnboarding, devices, onboardingComplete } = this.props;
    if (!onboardingComplete && acceptedDevicesCount) {
      advanceOnboarding(onboardingSteps.DEVICES_ACCEPTED_ONBOARDING);
      if (devices.every(item => Object.values(item.attributes).some(value => value))) {
        advanceOnboarding(onboardingSteps.APPLICATION_UPDATE_REMINDER_TIP);
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  getDeviceInfo(device) {
    const { getDeviceAuth, getDeviceById, getDeviceConnect } = this.props;
    if (device.status === DEVICE_STATES.accepted) {
      // Get full device identity details for single selected device
      getDeviceAuth(device.id);
      getDeviceById(device.id);
      getDeviceConnect(device.id);
    } else {
      getDeviceAuth(device.id);
    }
  }

  _expandRow(event, rowNumber) {
    const self = this;
    if (event.target.closest('input') && event.target.closest('input').hasOwnProperty('checked')) {
      return;
    }
    const { advanceOnboarding, devices, onboardingComplete, setSnackbar } = self.props;
    setSnackbar('');
    let device = devices[rowNumber];
    clearInterval(self.timer);
    if (self.state.expandedDeviceId === device.id) {
      device = null;
    } else {
      self.timer = setInterval(() => self.getDeviceInfo(device), refreshDeviceLength);
      self.getDeviceInfo(device);
    }
    if (!onboardingComplete) {
      advanceOnboarding(onboardingSteps.DEVICES_PENDING_ACCEPTING_ONBOARDING);
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
    const numSelected = (selectedRows || []).length;
    const itemClassName = `deviceListRow columns-${columnHeaders.length} ${onSelect ? 'selectable' : ''} ${expandable ? 'expandable' : ''}`;
    return (
      <div className={`deviceList ${className || ''}`}>
        <div className={`header ${itemClassName}`}>
          {onSelect ? (
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < devices.length}
              checked={numSelected === devices.length}
              onChange={() => self.onSelectAllClick()}
            />
          ) : null}
          {columnHeaders.map((item, index) => (
            <div className="columnHeader" key={`columnHeader-${index}`} style={item.style} onClick={() => onSort(item.attribute ? item.attribute : {})}>
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
              itemClassName={itemClassName}
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

const actionCreators = { advanceOnboarding, getDeviceAuth, getDeviceById, getDeviceConnect, setSnackbar };

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
    onboardingComplete: state.onboarding.complete
  };
};

export default connect(mapStateToProps, actionCreators)(DeviceList);
