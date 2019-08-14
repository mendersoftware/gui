import React from 'react';

// material ui
import Checkbox from '@material-ui/core/Checkbox';

import SettingsIcon from '@material-ui/icons/Settings';
import SortIcon from '@material-ui/icons/Sort';

import AppActions from '../../actions/app-actions';
import Loader from '../common/loader';
import Pagination from '../common/pagination';
import DeviceListItem from './devicelistitem';
import AppStore from '../../stores/app-store';
import { advanceOnboarding, getOnboardingStepCompleted } from '../../utils/onboardingmanager';

export default class DeviceList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      expandedDeviceId: null,
      pageSize: 20
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
    AppActions.setSnackbar('');
    let deviceId = self.props.devices[rowNumber].id;
    if (self.state.expandedDeviceId === deviceId) {
      deviceId = null;
    }
    if (!AppStore.getOnboardingComplete()) {
      if (!getOnboardingStepCompleted('devices-pending-accepting-onboarding')) {
        advanceOnboarding('devices-pending-accepting-onboarding');
      }
      if (getOnboardingStepCompleted('devices-pending-accepting-onboarding')) {
        advanceOnboarding('devices-accepted-onboarding');
      }
    }
    self.setState({ expandedDeviceId: deviceId });
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
    const { className, columnHeaders, devices, pageLength, pageLoading, pageNo, pageTotal, onSelect, onChangeRowsPerPage, selectedRows } = self.props;
    const { sortCol, sortDown, expandedDeviceId } = self.state;
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

          {columnHeaders.map(item => (
            <div className="columnHeader" key={item.name} style={Object.assign({ width: item.width || columnWidth }, item.style)}>
              {item.title}
              {item.sortable ? <SortIcon className={`sortIcon ${sortCol === item.name ? 'selected' : ''} ${sortDown.toString()}`} /> : null}
              {item.customize ? <SettingsIcon onClick={item.customize} style={{ fontSize: 16, marginLeft: 'auto' }} /> : null}
            </div>
          ))}
          <div style={{ width: 48 }} />
        </div>
        <div className="body">
          {devices.map((device, index) => (
            <DeviceListItem
              {...self.props}
              device={device}
              expanded={expandedDeviceId === device.id}
              key={device.id}
              selectable={!!onSelect}
              selected={self._isSelected(index)}
              onClick={event => self._expandRow(event, index)}
              onRowSelect={() => self._onRowSelection(index)}
            />
          ))}
        </div>
        <Pagination
          count={pageTotal}
          rowsPerPage={pageLength}
          onChangeRowsPerPage={onChangeRowsPerPage}
          page={pageNo}
          onChangePage={page => self.onPageChange(page)}
        />
        {pageLoading ? (
          <div className="smallLoaderContainer">
            <Loader show={true} />
          </div>
        ) : null}
      </div>
    );
  }
}
