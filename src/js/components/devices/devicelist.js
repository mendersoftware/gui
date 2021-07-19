import React, { memo, useState } from 'react';

// material ui
import { Checkbox } from '@material-ui/core';

import { Settings as SettingsIcon, Sort as SortIcon } from '@material-ui/icons';

import { DEVICE_SORTING_OPTIONS, DEVICE_STATES } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import Loader from '../common/loader';
import Pagination from '../common/pagination';
import ExpandedDevice from './expanded-device';
import DeviceListItem from './devicelistitem';
import { deepCompare } from '../../helpers';

export const DeviceList = props => {
  const [expandedDeviceId, setExpandedDeviceId] = useState();

  const {
    advanceOnboarding,
    className = '',
    columnHeaders,
    devices,
    deviceListState,
    expandable = true,
    idAttribute,
    onboardingState,
    onChangeRowsPerPage,
    onPageChange,
    onSelect,
    onSort,
    pageLoading,
    pageTotal,
    setSnackbar,
    showPagination = true
  } = props;

  const {
    page: pageNo = 1,
    perPage: pageLength = 20,
    selection: selectedRows,
    sort: { direction: sortDown = DEVICE_SORTING_OPTIONS.desc, columns = [] }
  } = deviceListState;

  const { column: sortCol } = columns.length ? columns[0] : {};

  const expandRow = (event, rowNumber) => {
    if (event && event.target.closest('input')?.hasOwnProperty('checked')) {
      return;
    }
    setSnackbar('');
    let device = devices[rowNumber];
    if (!device || expandedDeviceId === device.id) {
      device = undefined;
    }
    if (!onboardingState.complete) {
      advanceOnboarding(onboardingSteps.DEVICES_PENDING_ONBOARDING);
      if (device && device.status === DEVICE_STATES.accepted && Object.values(device.attributes).some(value => value)) {
        advanceOnboarding(onboardingSteps.DEVICES_ACCEPTED_ONBOARDING_NOTIFICATION);
      }
    }
    setExpandedDeviceId(device ? device.id : undefined);
  };

  const onRowSelection = selectedRow => {
    let updatedSelection = [...selectedRows];
    const selectedIndex = updatedSelection.indexOf(selectedRow);
    if (selectedIndex === -1) {
      updatedSelection.push(selectedRow);
    } else {
      updatedSelection.splice(selectedIndex, 1);
    }
    onSelect(updatedSelection);
  };

  const onSelectAllClick = () => {
    let newSelectedRows = Array.apply(null, { length: devices.length }).map(Number.call, Number);
    if (selectedRows.length && selectedRows.length <= devices.length) {
      newSelectedRows = [];
    }
    onSelect(newSelectedRows);
  };

  const handlePageChange = page => {
    onPageChange(page);
    setExpandedDeviceId(undefined);
  };

  const numSelected = (selectedRows || []).length;
  const itemClassName = `deviceListRow columns-${columnHeaders.length} ${onSelect ? 'selectable' : ''}`;
  return (
    <div className={`deviceList ${className}`}>
      <div className={`header ${itemClassName}`}>
        {onSelect && (
          <Checkbox indeterminate={numSelected > 0 && numSelected < devices.length} checked={numSelected === devices.length} onChange={onSelectAllClick} />
        )}
        {columnHeaders.map((item, index) => (
          <div className="columnHeader" key={`columnHeader-${index}`} style={item.style} onClick={() => onSort(item.attribute ? item.attribute : {})}>
            {item.title}
            {item.sortable && (
              <SortIcon className={`sortIcon ${sortCol === item.attribute.name ? 'selected' : ''} ${(sortDown === DEVICE_SORTING_OPTIONS.desc).toString()}`} />
            )}
            {item.customize && <SettingsIcon onClick={item.customize} style={{ fontSize: 16, marginLeft: 'auto' }} />}
          </div>
        ))}
        {expandable && <div style={{ width: 48 }} />}
      </div>
      <div className="body">
        {devices.map((device, index) => (
          <DeviceListItem
            columnHeaders={columnHeaders}
            device={device}
            idAttribute={idAttribute}
            itemClassName={itemClassName}
            key={device.id}
            onClick={event => (expandable ? expandRow(event, index) : onRowSelection(index))}
            onRowSelect={() => onRowSelection(index)}
            selectable={!!onSelect}
            selected={onSelect && selectedRows.indexOf(index) !== -1}
          />
        ))}
      </div>
      <div className="flexbox margin-top">
        {showPagination && (
          <Pagination
            className="margin-top-none"
            count={pageTotal}
            rowsPerPage={pageLength}
            onChangeRowsPerPage={onChangeRowsPerPage}
            page={pageNo}
            onChangePage={handlePageChange}
          />
        )}
        {pageLoading && <Loader show small />}
      </div>

      <ExpandedDevice {...props} deviceId={expandedDeviceId} open={Boolean(expandedDeviceId)} onClose={() => expandRow()} />
    </div>
  );
};

const areEqual = (prevProps, nextProps) => {
  if (prevProps.pageTotal != nextProps.pageTotal) {
    return false;
  } else if (prevProps.pageLoading != nextProps.pageLoading) {
    return false;
  } else if (prevProps.idAttribute != nextProps.idAttribute) {
    return false;
  } else if (!deepCompare(prevProps.onboardingState, nextProps.onboardingState)) {
    return false;
  } else if (!deepCompare(prevProps.devices, nextProps.devices)) {
    return false;
  }
  return deepCompare(prevProps.deviceListState, nextProps.deviceListState);
};

export default memo(DeviceList, areEqual);
