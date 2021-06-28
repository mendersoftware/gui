import React, { useEffect, useMemo, useState } from 'react';
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

import { sortingAlternatives } from './device-groups';

const refreshDeviceLength = 10000;
let timer;

export const Authorized = props => {
  const {
    acceptedCount,
    acceptedDevicesList,
    addDevicesToGroup,
    advanceOnboarding,
    allCount,
    deleteAuthset,
    deploymentDeviceLimit,
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
    if (!acceptedDevicesList.length && acceptedCount < deploymentDeviceLimit) {
      getDevicesByStatus(DEVICE_STATES.accepted);
    }
    clearAllRetryTimers(setSnackbar);
    if (!filters.length && selectedGroup && groupFilters.length) {
      setDeviceFilters(groupFilters);
    }
    clearInterval(timer);
    // no group, no filters, all devices
    timer = setInterval(getDevices, refreshDeviceLength);
    getDevices(true);
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
    if (devices.every(item => Object.values(item.attributes).some(value => value))) {
      advanceOnboarding(onboardingSteps.APPLICATION_UPDATE_REMINDER_TIP);
    }
    if (acceptedCount < 2) {
      setTimeout(() => {
        const notification = getOnboardingComponentFor(onboardingSteps.DEVICES_ACCEPTED_ONBOARDING_NOTIFICATION, onboardingState);
        !!notification && setSnackbar('open', 10000, '', notification, () => {}, true);
      }, 400);
    }
  }, [acceptedCount, onboardingState.complete]);

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
    getDevices(true);
  }, [filters, pageNo, selectedGroup, selectedState, sortCol, sortDown, sortScope, deviceRefreshTrigger]);

  /*
   * Devices
   */
  const getDevices = (shouldUpdate = false) => {
    const sortBy = sortCol ? [{ attribute: sortCol, order: sortDown, scope: sortScope }] : undefined;
    if (sortCol && sortingAlternatives[sortCol]) {
      sortBy.push({ ...sortBy[0], attribute: sortingAlternatives[sortCol] });
    }
    const hasFilters = filters.length && filters[0].value;
    const applicableSelectedState = selectedState === states.allDevices.key ? undefined : selectedState;
    getDevicesByStatus(applicableSelectedState, {
      page: pageNo,
      perPage: pageLength,
      shouldSelectDevices: shouldUpdate || hasFilters,
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
      setPageLoading(false);
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
        getDevices(true);
      })
      .finally(() => setPageLoading(false));
  };

  const onCreateGroupClick = () => {
    if (selectedGroup) {
      setShowFilters(!showFilters);
    }
    return onGroupClick();
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

  const onSelectionChange = selection => {
    setDeviceListState({ selection });
  };

  const anchor = { left: 200, top: 146 };
  let onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEVICES_ACCEPTED_ONBOARDING, onboardingState, { anchor });
  onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED, onboardingState, { anchor }, onboardingComponent);
  const isUngroupedGroup = selectedGroup && selectedGroup === UNGROUPED_GROUP.id;
  return (
    <div className="relative">
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
        <Filters onFilterChange={onFilterChange} onGroupClick={onCreateGroupClick} isModification={!!groupFilters.length} open={showFilters} />
      </div>
      <Loader show={!isInitialized} />
      {isInitialized ? (
        devices.length > 0 ? (
          <>
            <DeviceList
              {...props}
              className="padding-bottom"
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
          </>
        ) : (
          <EmptyState allCount={allCount} filters={filters} highlightHelp={highlightHelp} limitMaxed={limitMaxed} onClick={onPreauthClick} />
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
        />
      )}
    </div>
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
    acceptedDevicesList: state.devices.byStatus.accepted.deviceIds.slice(0, 20),
    allCount: state.devices.byStatus.accepted.total + state.devices.byStatus.rejected.total || 0,
    deploymentDeviceLimit: state.deployments.deploymentDeviceLimit,
    devices,
    deviceListState: state.devices.deviceList,
    deviceCount,
    filters: state.devices.filters || [],
    groupFilters,
    hasDeviceConfig,
    idAttribute: getIdAttribute(state),
    onboardingState: getOnboardingState(state),
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
