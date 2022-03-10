import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

// material ui
import { Checkbox } from '@mui/material';

import { Settings as SettingsIcon, Sort as SortIcon } from '@mui/icons-material';

import { SORTING_OPTIONS } from '../../constants/appConstants';
import { DEVICE_LIST_DEFAULTS, DEVICE_STATES } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import Loader from '../common/loader';
import Pagination from '../common/pagination';
import ExpandedDevice from './expanded-device';
import DeviceListItem from './devicelistitem';
import { deepCompare } from '../../helpers';
import MenderTooltip from '../common/mendertooltip';
import useWindowSize from '../../utils/resizehook';

const { page: defaultPage, perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;

const sortingNotes = {
  name: 'Sorting by Name will only work properly with devices that already have a device name defined'
};

const HeaderItem = ({ column, columnCount, index, sortCol, sortDown, onSort, onResizeChange, onResizeFinish, resizable }) => {
  const [isHovering, setIsHovering] = useState(false);
  const resizeRef = useRef();
  const ref = useRef();

  const onMouseOut = () => setIsHovering(false);
  const onMouseOver = () => setIsHovering(true);

  const mouseMove = useCallback(
    e => {
      if (resizable && resizeRef.current) {
        onResizeChange(e, { column, index, prev: resizeRef.current, ref });
        resizeRef.current = e.clientX;
      }
    },
    [onResizeChange, resizable, resizeRef.current]
  );

  const removeListeners = useCallback(() => {
    window.removeEventListener('mousemove', mouseMove);
    window.removeEventListener('mouseup', removeListeners);
  }, [mouseMove]);

  const mouseDown = e => {
    resizeRef.current = e.clientX;
  };

  const mouseUp = useCallback(
    e => {
      if (resizeRef.current) {
        onResizeFinish(e, { column, index, prev: resizeRef.current, ref });
        resizeRef.current = null;
        removeListeners();
      }
    },
    [onResizeFinish, removeListeners, resizeRef.current]
  );

  useEffect(() => {
    if (resizeRef.current) {
      window.addEventListener('mousemove', mouseMove);
      window.addEventListener('mouseup', mouseUp);
    }
    return () => {
      removeListeners();
    };
  }, [resizeRef.current, mouseMove, mouseUp, removeListeners]);

  let resizeHandleStyle = resizable && isHovering ? { background: '#ccc' } : {};
  resizeHandleStyle = resizeRef.current ? { background: '#517ea5' } : resizeHandleStyle;

  const header = (
    <div className="columnHeader flexbox space-between relative" style={column.style} onMouseEnter={onMouseOver} onMouseLeave={onMouseOut} ref={ref}>
      <div className="flexbox center-aligned" onClick={() => onSort(column.attribute ? column.attribute : {})}>
        {column.title}
        {column.sortable && (
          <SortIcon
            className={`sortIcon ${sortCol === column.attribute.name ? 'selected' : ''} ${(sortDown === SORTING_OPTIONS.desc).toString()}`}
            style={{ fontSize: 16 }}
          />
        )}
      </div>
      <div className="flexbox center-aligned">
        {column.customize && <SettingsIcon onClick={column.customize} style={{ fontSize: 16, marginRight: 4 }} />}
        {index > 0 && index < columnCount - 2 && <span onMouseDown={mouseDown} className="resize-handle" style={resizeHandleStyle} />}
      </div>
    </div>
  );
  return column.sortable && sortingNotes[column.attribute.name] ? (
    <MenderTooltip title={sortingNotes[column.attribute.name]} placement="top-start">
      {header}
    </MenderTooltip>
  ) : (
    header
  );
};

const getRelevantColumns = (columnElements, selectable) => [...columnElements].slice(selectable ? 2 : 1, columnElements.length - 1);

export const calculateResizeChange = ({ columnElements, columnHeaders, e, index, prev, selectable }) => {
  const isShrinkage = prev > e.clientX ? -1 : 1;
  const columnDelta = Math.abs(e.clientX - prev) * isShrinkage;
  const relevantColumns = getRelevantColumns(columnElements, selectable);
  const canModifyNextColumn = index >= 1 && index + 1 < columnHeaders.length - 1;

  return relevantColumns.reduce((accu, element, columnIndex) => {
    const currentWidth = element.offsetWidth;
    let column = { attribute: columnHeaders[columnIndex + 1].attribute, size: currentWidth };
    if (canModifyNextColumn && index - 1 === columnIndex) {
      column.size = currentWidth + columnDelta;
    } else if (canModifyNextColumn && index === columnIndex) {
      column.size = currentWidth - columnDelta;
    }
    accu.push(column);
    return accu;
  }, []);
};

export const minCellWidth = 150;
const getTemplateColumns = (columns, selectable) =>
  selectable
    ? `52px minmax(250px, 1fr) ${columns} minmax(${minCellWidth}px, max-content)`
    : `minmax(250px, 1fr) ${columns} minmax(${minCellWidth}px, max-content)`;
export const DeviceList = props => {
  const {
    advanceOnboarding,
    columnHeaders,
    customColumnSizes,
    expandedDeviceId,
    devices,
    deviceListState,
    idAttribute,
    onboardingState = {},
    onChangeRowsPerPage,
    onResizeColumns,
    onPageChange,
    onSelect,
    onSort,
    PaginationProps = {},
    pageLoading,
    pageTotal,
    setExpandedDeviceId,
    setSnackbar
  } = props;

  const {
    page: pageNo = defaultPage,
    perPage: pageLength = defaultPerPage,
    selection: selectedRows = [],
    sort: { direction: sortDown = SORTING_OPTIONS.desc, columns = [] }
  } = deviceListState;

  const { rowsPerPageOptions } = PaginationProps;

  const { column: sortCol } = columns.length ? columns[0] : {};
  const deviceListRef = useRef();

  const size = useWindowSize();
  const selectable = !!onSelect;

  useEffect(() => {
    if (!deviceListRef.current) {
      return;
    }
    const relevantColumns = getRelevantColumns(deviceListRef.current.querySelector('.deviceListRow').children, selectable);
    const columns = relevantColumns.map(() => `minmax(${minCellWidth}px, 1.5fr)`);
    deviceListRef.current.style.gridTemplateColumns = getTemplateColumns(columns.join(' '), selectable);
  }, [deviceListRef.current, size.width, selectable]);

  useEffect(() => {
    if (!deviceListRef.current || !customColumnSizes.length) {
      return;
    }
    const columns = customColumnSizes.map(({ size }) => `minmax(${minCellWidth}px, ${size}px)`);
    deviceListRef.current.style.gridTemplateColumns = getTemplateColumns(columns.join(' '), selectable);
  }, [deviceListRef.current, customColumnSizes, selectable]);

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

  const handleResizeChange = (e, { index, prev, ref }) => {
    const changedColumns = calculateResizeChange({ columnElements: ref.current.parentElement.children, columnHeaders, e, index, prev, selectable });
    const template = changedColumns.map(({ size }) => `minmax(${minCellWidth}px, ${size}px)`).join(' ');
    // applying styles via state changes would lead to less smooth changes, so we set the style directly on the components
    deviceListRef.current.style.gridTemplateColumns = getTemplateColumns(template, selectable);
  };

  const handleResizeFinish = (e, { index, prev, ref }) => {
    const changedColumns = calculateResizeChange({ columnElements: ref.current.parentElement.children, columnHeaders, e, index, prev, selectable });
    onResizeColumns(changedColumns);
  };

  const numSelected = (selectedRows || []).length;
  return (
    <div className={`deviceList ${selectable ? 'selectable' : ''}`} ref={deviceListRef}>
      <div className="header">
        <div className="deviceListRow">
          {selectable && (
            <div>
              <Checkbox indeterminate={numSelected > 0 && numSelected < devices.length} checked={numSelected === devices.length} onChange={onSelectAllClick} />
            </div>
          )}
          {columnHeaders.map((item, index) => (
            <HeaderItem
              column={item}
              columnCount={columnHeaders.length}
              index={index}
              key={`columnHeader-${index}`}
              onSort={onSort}
              resizable={!!onResizeColumns}
              sortCol={sortCol}
              sortDown={sortDown}
              onResizeChange={handleResizeChange}
              onResizeFinish={handleResizeFinish}
            />
          ))}
        </div>
      </div>
      <div className="body">
        {devices.map((device, index) => (
          <DeviceListItem
            columnHeaders={columnHeaders}
            device={device}
            idAttribute={idAttribute.attribute}
            index={index}
            key={device.id}
            onClick={expandRow}
            onRowSelect={onRowSelection}
            selectable={selectable}
            selected={selectedRows.indexOf(index) !== -1}
          />
        ))}
      </div>
      <div className="footer flexbox margin-top">
        <Pagination
          className="margin-top-none"
          count={pageTotal}
          rowsPerPage={pageLength}
          onChangeRowsPerPage={onChangeRowsPerPage}
          page={pageNo}
          onChangePage={handlePageChange}
          rowsPerPageOptions={rowsPerPageOptions}
        />
        {pageLoading && <Loader show small />}
      </div>

      <ExpandedDevice {...props} deviceId={expandedDeviceId} open={Boolean(expandedDeviceId)} onClose={() => expandRow()} />
    </div>
  );
};

const areEqual = (prevProps, nextProps) => {
  if (
    prevProps.pageTotal != nextProps.pageTotal ||
    prevProps.pageLoading != nextProps.pageLoading ||
    prevProps.expandedDeviceId != nextProps.expandedDeviceId ||
    prevProps.idAttribute != nextProps.idAttribute ||
    !deepCompare(prevProps.columnHeaders, nextProps.columnHeaders) ||
    !deepCompare(prevProps.customColumnSizes, nextProps.customColumnSizes) ||
    !deepCompare(prevProps.onboardingState, nextProps.onboardingState) ||
    !deepCompare(prevProps.devices, nextProps.devices)
  ) {
    return false;
  }
  return deepCompare(prevProps.deviceListState, nextProps.deviceListState);
};

export default memo(DeviceList, areEqual);
