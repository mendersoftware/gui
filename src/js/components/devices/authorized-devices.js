import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { Button, MenuItem, Select } from '@material-ui/core';

import { Autorenew as AutorenewIcon, Delete as DeleteIcon, FilterList as FilterListIcon, LockOutlined } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { deleteAuthset, getDevicesByStatus, setDeviceFilters, setDeviceListState, updateDevicesAuth } from '../../actions/deviceActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { DEVICE_LIST_MAXIMUM_LENGTH, DEVICE_SORTING_OPTIONS, DEVICE_STATES, UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { duplicateFilter, isEmpty } from '../../helpers';
import { getIdAttribute, getOnboardingState, getTenantCapabilities } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import { clearAllRetryTimers, setRetryTimer } from '../../utils/retrytimer';
import Loader from '../common/loader';
import { ExpandDevice } from '../helptips/helptooltips';
import DeviceList from './devicelist';
import DeviceQuickActions from './devicequickactions';
import Filters from './filters';
import theme from '../../themes/mender-theme';

const refreshDeviceLength = 10000;
let timer;

export const Authorized = props => {
  const {
    acceptedCount,
    addDevicesToGroup,
    advanceOnboarding,
    allCount,
    deleteAuthset,
    deviceCount,
    deviceListState,
    deviceRefreshTrigger,
    devices,
    filters,
    getDevicesByStatus,
    groupFilters,
    highlightHelp,
    idAttribute,
    limitMaxed,
    onboardingState,
    onGroupClick,
    onGroupRemoval,
    onPreauthClick,
    openSettingsDialog,
    pendingCount,
    removeDevicesFromGroup,
    selectedGroup,
    setDeviceFilters,
    setDeviceListState,
    showHelptips,
    states = {},
    updateDevicesAuth
  } = props;
  const [isInitialized, setIsInitialized] = useState(!!props.devices.length);
  const [pageLoading, setPageLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const deviceListRef = useRef();
  const authorizeRef = useRef();

  // eslint-disable-next-line no-unused-vars
  const [size, setSize] = useState({ height: window.innerHeight, width: window.innerWidth });

  const {
    page: pageNo = 1,
    perPage: pageLength = 20,
    selection: selectedRows,
    sort: { direction: sortDown = DEVICE_SORTING_OPTIONS.desc, columns = [] },
    state: selectedState
  } = deviceListState;

  const { column: sortCol, scope: sortScope } = columns.length ? columns[0] : {};

  const handleResize = () => setTimeout(() => setSize({ height: window.innerHeight, width: window.innerWidth }), 500);

  useEffect(() => {
    onSelectionChange([]);
    clearAllRetryTimers(setSnackbar);
    if (!filters.length && selectedGroup && groupFilters.length) {
      setDeviceFilters(groupFilters);
    }
    clearInterval(timer);
    // no group, no filters, all devices
    timer = setInterval(getDevices, refreshDeviceLength);
    getDevices();
    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(timer);
      clearAllRetryTimers(setSnackbar);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (onboardingState.complete || !acceptedCount) {
      return;
    }
    advanceOnboarding(onboardingSteps.DEVICES_ACCEPTED_ONBOARDING);

    if (acceptedCount < 2) {
      if (!window.sessionStorage.getItem('pendings-redirect')) {
        window.sessionStorage.setItem('pendings-redirect', true);
        onDeviceStateSelectionChange(DEVICE_STATES.accepted);
      }
      setTimeout(() => {
        const notification = getOnboardingComponentFor(onboardingSteps.DEVICES_ACCEPTED_ONBOARDING_NOTIFICATION, onboardingState);
        !!notification && setSnackbar('open', 10000, '', notification, () => {}, true);
      }, 400);
    }
  }, [acceptedCount, onboardingState.complete]);

  useEffect(() => {
    if (onboardingState.complete || !pendingCount) {
      return;
    }
    advanceOnboarding(onboardingSteps.DEVICES_PENDING_ONBOARDING_START);
  }, [pendingCount, onboardingState.complete]);

  useEffect(() => {
    if (!selectedGroup) {
      return;
    }
    setShowFilters(false);
    handlePageChange(1);
  }, [selectedGroup]);

  useEffect(() => {
    onSelectionChange([]);
    clearInterval(timer);
    timer = setInterval(getDevices, refreshDeviceLength);
    getDevices();
  }, [filters, pageNo, pageLength, selectedGroup, selectedState, sortCol, sortDown, sortScope, deviceRefreshTrigger]);

  const sortingAlternatives = Object.values(states)
    .reduce((accu, item) => [...accu, ...item.defaultHeaders], [])
    .reduce((accu, item) => {
      if (item.attribute.alternative) {
        accu[item.attribute.name] = item.attribute.alternative;
        accu[item.attribute.alternative] = item.attribute.name;
      }
      return accu;
    }, {});

  /*
   * Devices
   */
  const getDevices = () => {
    const sortBy = sortCol ? [{ attribute: sortCol, order: sortDown, scope: sortScope }] : undefined;
    if (sortCol && sortingAlternatives[sortCol]) {
      sortBy.push({ ...sortBy[0], attribute: sortingAlternatives[sortCol] });
    }
    const applicableSelectedState = selectedState === states.allDevices.key ? undefined : selectedState;
    getDevicesByStatus(applicableSelectedState, {
      page: pageNo,
      perPage: pageLength,
      shouldSelectDevices: true,
      group: selectedGroup,
      sortOptions: sortBy
    })
      .catch(err => setRetryTimer(err, 'devices', `Devices couldn't be loaded.`, refreshDeviceLength, setSnackbar))
      // only set state after all devices id data retrieved
      .finally(() => {
        setIsInitialized(true);
        setPageLoading(false);
      });
  };

  const onAddDevicesToGroup = rows => {
    const mappedDevices = rows.map(row => devices[row].id);
    addDevicesToGroup(mappedDevices);
  };

  const onRemoveDevicesFromGroup = rows => {
    const removedDevices = rows.map(row => devices[row].id);
    removeDevicesFromGroup(removedDevices);
    // if devices.length = number on page but < deviceCount
    // move page back to pageNO 1
    if (devices.length === removedDevices.length) {
      handlePageChange(1);
    }
  };

  const onAuthorizationChange = (rows, changedState) => {
    setPageLoading(true);
    const deviceIds = rows.map(row => devices[row].id);
    return updateDevicesAuth(deviceIds, changedState).then(() => {
      onSelectionChange([]);
      getDevices();
    });
  };

  const onDeviceDismiss = rows => {
    setPageLoading(true);
    const mappedDevices = rows.reduce((accu, row) => {
      if (devices[row].auth_sets?.length) {
        accu.push({ deviceId: devices[row].id, authId: devices[row].auth_sets[0].id });
      }
      return accu;
    }, []);
    Promise.all(mappedDevices.map(({ deviceId, authId }) => deleteAuthset(deviceId, authId)))
      // on finish, change "loading" back to null
      .then(() => {
        onSelectionChange([]);
        getDevices();
      })
      .finally(() => setPageLoading(false));
  };

  const handlePageChange = page => {
    setPageLoading(true);
    setDeviceListState({ page });
  };

  const onPageLengthChange = perPage => {
    setDeviceListState({ perPage, page: 1 });
  };

  const onSortChange = attribute => {
    let changedSortCol = attribute.name === 'Device ID' ? 'id' : attribute.name;
    let changedSortDown = sortDown === DEVICE_SORTING_OPTIONS.desc ? DEVICE_SORTING_OPTIONS.asc : DEVICE_SORTING_OPTIONS.desc;
    if (changedSortCol !== sortCol && attribute.name !== 'Device ID') {
      changedSortDown = DEVICE_SORTING_OPTIONS.desc;
    }
    setDeviceListState({ sort: { direction: changedSortDown, columns: [{ column: changedSortCol, scope: attribute.scope }] } });
  };

  const onFilterChange = () => handlePageChange(1);

  const onDeviceStateSelectionChange = newState => {
    setDeviceListState({ state: newState, page: 1 });
  };

  const currentSelectedState = states[selectedState] ?? states.devices;
  const EmptyState = currentSelectedState.emptyState;
  const columnHeaders = [
    {
      title: idAttribute,
      customize: openSettingsDialog,
      attribute: { name: idAttribute, scope: 'identity' },
      sortable: true
    },
    ...currentSelectedState.defaultHeaders
  ];

  const groupLabel = selectedGroup ? decodeURIComponent(selectedGroup) : 'All devices';

  const onSelectionChange = (selection = []) => {
    if (!onboardingState.complete && selection.length) {
      advanceOnboarding(onboardingSteps.DEVICES_PENDING_ACCEPTING_ONBOARDING);
    }
    setDeviceListState({ selection });
  };

  let onboardingComponent;
  const devicePendingTip = getOnboardingComponentFor(onboardingSteps.DEVICES_PENDING_ONBOARDING_START, onboardingState);
  if (deviceListRef.current) {
    const element = deviceListRef.current.getElementsByClassName('body')[0];
    const anchor = { left: 200, top: element ? element.offsetTop + element.offsetHeight : 170 };
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEVICES_ACCEPTED_ONBOARDING, onboardingState, { anchor }, onboardingComponent);
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED, onboardingState, { anchor }, onboardingComponent);
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEVICES_PENDING_ONBOARDING, onboardingState, { anchor }, onboardingComponent);
  }
  if (selectedRows && authorizeRef.current) {
    const anchor = {
      left: authorizeRef.current.offsetLeft - authorizeRef.current.offsetWidth,
      top:
        authorizeRef.current.offsetTop +
        authorizeRef.current.offsetHeight -
        authorizeRef.current.lastElementChild.offsetHeight +
        authorizeRef.current.lastElementChild.firstElementChild.offsetHeight * 1.5
    };
    onboardingComponent = getOnboardingComponentFor(
      onboardingSteps.DEVICES_PENDING_ACCEPTING_ONBOARDING,
      onboardingState,
      { place: 'left', anchor },
      onboardingComponent
    );
  }

  const isUngroupedGroup = selectedGroup && selectedGroup === UNGROUPED_GROUP.id;
  return (
    <>
      <div className="margin-left-small">
        <h3 className="margin-right">{isUngroupedGroup ? UNGROUPED_GROUP.name : groupLabel}</h3>
        <div className="flexbox space-between filter-header">
          <div className="flexbox">
            <DeviceStateSelection onStateChange={onDeviceStateSelectionChange} selectedState={selectedState} states={states} />
            {!isUngroupedGroup && (
              <div className={`flexbox centered ${showFilters ? 'filter-toggle' : ''}`} style={{ marginBottom: -1 }}>
                <Button
                  color="secondary"
                  disableRipple
                  onClick={() => setShowFilters(!showFilters)}
                  startIcon={<FilterListIcon />}
                  style={{ backgroundColor: 'transparent' }}
                >
                  {filters.length > 0 ? `Filters (${filters.length})` : 'Filters'}
                </Button>
              </div>
            )}
            {selectedGroup && !isUngroupedGroup && (
              <p className="info flexbox centered" style={{ marginLeft: theme.spacing(2) }}>
                {!groupFilters.length ? <LockOutlined fontSize="small" /> : <AutorenewIcon fontSize="small" />}
                <span>{!groupFilters.length ? 'Static' : 'Dynamic'}</span>
              </p>
            )}
          </div>
          {selectedGroup && !isUngroupedGroup && (
            <div className="flexbox centered">
              <Button onClick={onGroupRemoval} startIcon={<DeleteIcon />}>
                Remove group
              </Button>
            </div>
          )}
        </div>
        <Filters onFilterChange={onFilterChange} onGroupClick={onGroupClick} isModification={!!groupFilters.length} open={showFilters} />
      </div>
      <Loader show={!isInitialized} />
      {isInitialized ? (
        devices.length > 0 ? (
          <div className="padding-bottom" ref={deviceListRef}>
            <DeviceList
              {...props}
              columnHeaders={columnHeaders}
              onChangeRowsPerPage={onPageLengthChange}
              onPageChange={handlePageChange}
              onSelect={onSelectionChange}
              onSort={onSortChange}
              pageLoading={pageLoading}
              pageTotal={deviceCount}
              refreshDevices={getDevices}
            />
            {showHelptips && <ExpandDevice />}
          </div>
        ) : (
          <>
            {devicePendingTip ? (
              devicePendingTip
            ) : (
              <EmptyState allCount={allCount} filters={filters} highlightHelp={highlightHelp} limitMaxed={limitMaxed} onClick={onPreauthClick} />
            )}
          </>
        )
      ) : (
        <div />
      )}
      {onboardingComponent ? onboardingComponent : null}
      {!!selectedRows.length && (
        <DeviceQuickActions
          actionCallbacks={{ onAddDevicesToGroup, onAuthorizationChange, onDeviceDismiss, onRemoveDevicesFromGroup }}
          devices={devices}
          selectedGroup={selectedGroup}
          selectedRows={selectedRows}
          ref={authorizeRef}
        />
      )}
    </>
  );
};

const actionCreators = {
  advanceOnboarding,
  deleteAuthset,
  getDevicesByStatus,
  setDeviceFilters,
  setDeviceListState,
  setSnackbar,
  updateDevicesAuth
};

const mapStateToProps = state => {
  const { hasDeviceConfig } = getTenantCapabilities(state);
  let devices = state.devices.deviceList.deviceIds.slice(0, DEVICE_LIST_MAXIMUM_LENGTH);
  let deviceCount = state.devices.deviceList.total;
  let selectedGroup;
  let groupFilters = [];
  if (state.devices.groups.selectedGroup && state.devices.groups.byId[state.devices.groups.selectedGroup]) {
    selectedGroup = state.devices.groups.selectedGroup;
    groupFilters = state.devices.groups.byId[selectedGroup].filters || [];
  } else if (!isEmpty(state.devices.selectedDevice)) {
    devices = [state.devices.selectedDevice];
    deviceCount = 1;
  }
  devices = devices.reduce((accu, deviceId) => {
    if (deviceId && state.devices.byId[deviceId]) {
      accu.push({ auth_sets: [], ...state.devices.byId[deviceId] });
    }
    return accu;
  }, []);
  return {
    acceptedCount: state.devices.byStatus.accepted.total || 0,
    allCount: state.devices.byStatus.accepted.total + state.devices.byStatus.rejected.total || 0,
    devices,
    deviceListState: state.devices.deviceList,
    deviceCount,
    filters: state.devices.filters || [],
    groupFilters,
    hasDeviceConfig,
    idAttribute: getIdAttribute(state),
    onboardingState: getOnboardingState(state),
    pendingCount: state.devices.byStatus.pending.total || 0,
    selectedGroup,
    showHelptips: state.users.showHelptips
  };
};

export default connect(mapStateToProps, actionCreators)(Authorized);

const DeviceStateSelection = ({ onStateChange, selectedState, states }) => {
  const availableStates = useMemo(() => Object.values(states).filter(duplicateFilter), [states]);

  return (
    <div className="flexbox centered">
      Status:
      <Select
        className="margin-right"
        disableUnderline
        onChange={e => onStateChange(e.target.value)}
        value={selectedState}
        style={{ fontSize: 13, marginLeft: theme.spacing() }}
      >
        {availableStates.map(state => (
          <MenuItem key={state.key} value={state.key}>
            {state.title()}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};
