import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { useTheme } from '@mui/material/styles';
import { Button, MenuItem, Select } from '@mui/material';

import { Autorenew as AutorenewIcon, Delete as DeleteIcon, FilterList as FilterListIcon, LockOutlined } from '@mui/icons-material';

import { setSnackbar } from '../../actions/appActions';
import { deleteAuthset, getDevicesByStatus, setDeviceFilters, setDeviceListState, updateDevicesAuth } from '../../actions/deviceActions';
import { getIssueCountsByType } from '../../actions/monitorActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { saveUserSettings, updateUserColumnSettings } from '../../actions/userActions';
import { SORTING_OPTIONS } from '../../constants/appConstants';
import { ALL_DEVICES, DEVICE_ISSUE_OPTIONS, DEVICE_LIST_DEFAULTS, DEVICE_STATES, UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { duplicateFilter, isEmpty } from '../../helpers';
import {
  getAvailableIssueOptionsByType,
  getFeatures,
  getFilterAttributes,
  getIdAttribute,
  getMappedDevicesList,
  getOnboardingState,
  getTenantCapabilities,
  getUserCapabilities,
  getUserSettings
} from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import useWindowSize from '../../utils/resizehook';
import { clearAllRetryTimers, setRetryTimer } from '../../utils/retrytimer';
import Loader from '../common/loader';
import { ExpandDevice } from '../helptips/helptooltips';
import DeviceQuickActions from './widgets/devicequickactions';
import Filters from './widgets/filters';
import DeviceIssuesSelection from './widgets/issueselection';
const ColumnCustomizationDialog = lazy(() => import('./dialogs/custom-columns-dialog'));
import ListOptions from './widgets/listoptions';
import { defaultTextRender, getDeviceIdentityText } from './base-devices';
import DeviceList, { minCellWidth } from './devicelist';
import { defaultHeaders, routes as states } from './device-groups';
import { settingsKeys } from '../../constants/userConstants';

const refreshDeviceLength = 10000;
const { page: defaultPage, perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;

const idAttributeTitleMap = {
  id: 'Device ID',
  name: 'Name'
};

const headersReducer = (accu, header) => {
  if (header.attribute.scope === accu.column.scope && (header.attribute.name === accu.column.name || header.attribute.alternative === accu.column.name)) {
    accu.header = { ...accu.header, ...header };
  }
  return accu;
};

const getHeaders = (columnSelection = [], currentStateHeaders, idAttribute, openSettingsDialog) => {
  const headers = columnSelection.length
    ? columnSelection.map(column => {
        let header = { ...column, attribute: { ...column }, textRender: defaultTextRender, sortable: true };
        header = Object.values(defaultHeaders).reduce(headersReducer, { column, header }).header;
        header = currentStateHeaders.reduce(headersReducer, { column, header }).header;
        return header;
      })
    : currentStateHeaders;
  return [
    {
      title: idAttributeTitleMap[idAttribute.attribute] ?? idAttribute.attribute,
      customize: openSettingsDialog,
      attribute: { name: idAttribute.attribute, scope: idAttribute.scope },
      sortable: true,
      textRender: getDeviceIdentityText
    },
    ...headers,
    defaultHeaders.deviceStatus
  ];
};

export const Authorized = props => {
  const theme = useTheme();
  const {
    acceptedCount,
    addDevicesToGroup,
    advanceOnboarding,
    allCount,
    attributes,
    availableIssueOptions,
    canManageDevices,
    columnSelection,
    customColumnSizes,
    deleteAuthset,
    deviceCount,
    deviceListState,
    deviceRefreshTrigger,
    devices,
    filters,
    getDevicesByStatus,
    getIssueCountsByType,
    groupFilters,
    hasMonitor,
    hasReporting,
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
    saveUserSettings,
    selectedGroup,
    setDeviceFilters,
    setDeviceListState,
    showHelptips,
    showsDialog,
    updateDevicesAuth,
    updateUserColumnSettings
  } = props;
  const {
    page: pageNo = defaultPage,
    perPage: pageLength = defaultPerPage,
    selectedAttributes = [],
    selectedIssues = [],
    selection: selectedRows,
    sort: { direction: sortDown = SORTING_OPTIONS.desc, columns = [] },
    state: selectedState
  } = deviceListState;
  const currentSelectedState = states[selectedState] ?? states.devices;
  const [columnHeaders, setColumnHeaders] = useState(getHeaders(columnSelection, currentSelectedState.defaultHeaders, idAttribute, openSettingsDialog));
  const [expandedDeviceId, setExpandedDeviceId] = useState();
  const [isInitialized, setIsInitialized] = useState(window.sessionStorage.getItem(settingsKeys.initialized) && !!props.devices.length);
  const [devicesInitialized, setDevicesInitialized] = useState(!!props.devices.length);
  const [columnsInitialized, setColumnsInitialized] = useState(window.sessionStorage.getItem(settingsKeys.initialized));
  const [pageLoading, setPageLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const deviceListRef = useRef();
  const authorizeRef = useRef();
  const timer = useRef();

  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();

  const { column: sortCol, scope: sortScope } = columns.length ? columns[0] : {};

  const checkUserSettings = () => setColumnsInitialized(window.sessionStorage.getItem(settingsKeys.initialized));

  useEffect(() => {
    clearAllRetryTimers(setSnackbar);
    if (!filters.length && selectedGroup && groupFilters.length) {
      setDeviceFilters(groupFilters);
    }

    window.addEventListener('storage', checkUserSettings);
    return () => {
      window.removeEventListener('storage', checkUserSettings);
      clearInterval(timer.current);
      clearAllRetryTimers(setSnackbar);
    };
  }, []);

  useEffect(() => {
    if (columnsInitialized) {
      window.removeEventListener('storage', checkUserSettings);
    }
  }, [columnsInitialized]);

  useEffect(() => {
    setIsInitialized(columnsInitialized && devicesInitialized);
  }, [columnsInitialized, devicesInitialized]);

  useEffect(() => {
    const columnHeaders = getHeaders(columnSelection, currentSelectedState.defaultHeaders, idAttribute, openSettingsDialog);
    setColumnHeaders(columnHeaders);
  }, [columnSelection, currentSelectedState.state, idAttribute.attribute]);

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
        const notification = getOnboardingComponentFor(onboardingSteps.DEVICES_ACCEPTED_ONBOARDING_NOTIFICATION, onboardingState, { setSnackbar });
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
    setShowFilters(false);
  }, [selectedGroup]);

  useEffect(() => {
    if (deviceRefreshTrigger === undefined) {
      return;
    }
    onSelectionChange([]);
    clearInterval(timer.current);
    timer.current = setInterval(getDevices, refreshDeviceLength);
    getDevices();
  }, [filters, pageNo, pageLength, selectedAttributes, selectedGroup, selectedIssues, selectedState, sortCol, sortDown, sortScope, deviceRefreshTrigger]);

  useEffect(() => {
    Object.keys(availableIssueOptions).map(key => getIssueCountsByType(key, { filters, group: selectedGroup, state: selectedState }));
    availableIssueOptions[DEVICE_ISSUE_OPTIONS.authRequests.key] ? getIssueCountsByType(DEVICE_ISSUE_OPTIONS.authRequests.key, { filters: [] }) : undefined;
  }, [selectedIssues, availableIssueOptions, selectedState, selectedGroup]);

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
      selectedAttributes,
      selectedIssues,
      shouldSelectDevices: true,
      group: selectedGroup,
      sortOptions: sortBy
    })
      .catch(err => setRetryTimer(err, 'devices', `Devices couldn't be loaded.`, refreshDeviceLength, setSnackbar))
      // only set state after all devices id data retrieved
      .finally(() => {
        setDevicesInitialized(true);
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
    let changedSortCol = attribute.name;
    let changedSortDown = sortDown === SORTING_OPTIONS.desc ? SORTING_OPTIONS.asc : SORTING_OPTIONS.desc;
    if (changedSortCol !== sortCol) {
      changedSortDown = SORTING_OPTIONS.desc;
    }
    setDeviceListState({ sort: { direction: changedSortDown, columns: [{ column: changedSortCol, scope: attribute.scope }] } });
  };

  const onFilterChange = () => handlePageChange(1);

  const onDeviceStateSelectionChange = newState => {
    setDeviceListState({ state: newState, page: 1 });
  };

  const onDeviceIssuesSelectionChange = ({ target: { value: selectedIssues } }) => {
    setDeviceListState({ selectedIssues, page: 1 });
  };

  const onSelectAllIssues = shouldSelectAll => {
    const selectedIssues = shouldSelectAll
      ? Object.entries(DEVICE_ISSUE_OPTIONS).reduce((accu, [key, { needsReporting }]) => {
          if (needsReporting && !hasReporting) {
            return accu;
          }
          accu.push(key);
          return accu;
        }, [])
      : [];
    setDeviceListState({ selectedIssues, page: 1 });
  };

  const onSelectionChange = (selection = []) => {
    if (!onboardingState.complete && selection.length) {
      advanceOnboarding(onboardingSteps.DEVICES_PENDING_ACCEPTING_ONBOARDING);
    }
    setDeviceListState({ selection });
  };

  const onToggleCustomizationClick = () => setShowCustomization(!showCustomization);

  const onChangeColumns = changedColumns => {
    const columnSizes = changedColumns.reduce((accu, column) => {
      const size = customColumnSizes.find(({ attribute }) => attribute.name === column.key && attribute.scope === column.scope)?.size || minCellWidth;
      accu.push({ attribute: { name: column.key, scope: column.scope }, size });
      return accu;
    }, []);
    updateUserColumnSettings(columnSizes);
    saveUserSettings({ columnSelection: changedColumns });
    setDeviceListState({ selectedAttributes: changedColumns.map(column => ({ attribute: column.key, scope: column.scope })) });
    const columnHeaders = getHeaders(changedColumns, currentSelectedState.defaultHeaders, idAttribute, openSettingsDialog);
    setColumnHeaders(columnHeaders);
    setShowCustomization(false);
    getDevices();
  };

  const EmptyState = currentSelectedState.emptyState;

  const groupLabel = selectedGroup ? decodeURIComponent(selectedGroup) : ALL_DEVICES;

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

  const listOptionHandlers = [{ key: 'customize', title: 'Customize', onClick: onToggleCustomizationClick }];

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
            {hasMonitor && (
              <DeviceIssuesSelection
                onChange={onDeviceIssuesSelectionChange}
                onSelectAll={onSelectAllIssues}
                options={Object.values(availableIssueOptions)}
                selection={selectedIssues}
              />
            )}
            {selectedGroup && !isUngroupedGroup && (
              <p className="info flexbox centered" style={{ marginLeft: theme.spacing(2) }}>
                {!groupFilters.length ? <LockOutlined fontSize="small" /> : <AutorenewIcon fontSize="small" />}
                <span>{!groupFilters.length ? 'Static' : 'Dynamic'}</span>
              </p>
            )}
          </div>
          <div className="flexbox centered">
            {canManageDevices && selectedGroup && !isUngroupedGroup && (
              <Button onClick={onGroupRemoval} startIcon={<DeleteIcon />}>
                Remove group
              </Button>
            )}
            <ListOptions options={listOptionHandlers} title="Table options" />
          </div>
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
              customColumnSizes={customColumnSizes}
              expandedDeviceId={expandedDeviceId}
              onChangeRowsPerPage={onPageLengthChange}
              onPageChange={handlePageChange}
              onResizeColumns={updateUserColumnSettings}
              onSelect={onSelectionChange}
              onSort={onSortChange}
              pageLoading={pageLoading}
              pageTotal={deviceCount}
              setExpandedDeviceId={setExpandedDeviceId}
            />
            {showHelptips && <ExpandDevice />}
          </div>
        ) : (
          <>
            {devicePendingTip && !showsDialog ? (
              devicePendingTip
            ) : (
              <EmptyState
                allCount={allCount}
                canManageDevices={canManageDevices}
                filters={filters}
                highlightHelp={highlightHelp}
                limitMaxed={limitMaxed}
                onClick={onPreauthClick}
              />
            )}
          </>
        )
      ) : (
        <div />
      )}
      {!expandedDeviceId && onboardingComponent ? onboardingComponent : null}
      {canManageDevices && !!selectedRows.length && (
        <DeviceQuickActions
          actionCallbacks={{ onAddDevicesToGroup, onAuthorizationChange, onDeviceDismiss, onRemoveDevicesFromGroup }}
          devices={devices}
          selectedGroup={selectedGroup}
          selectedRows={selectedRows}
          ref={authorizeRef}
        />
      )}
      {showCustomization && (
        <Suspense fallback={<Loader show />}>
          <ColumnCustomizationDialog
            attributes={attributes}
            columnHeaders={columnHeaders}
            idAttribute={idAttribute}
            onCancel={onToggleCustomizationClick}
            onSubmit={onChangeColumns}
          />
        </Suspense>
      )}
    </>
  );
};

const actionCreators = {
  advanceOnboarding,
  deleteAuthset,
  getDevicesByStatus,
  getIssueCountsByType,
  saveUserSettings,
  setDeviceFilters,
  setDeviceListState,
  setSnackbar,
  updateDevicesAuth,
  updateUserColumnSettings
};

const mapStateToProps = state => {
  const { hasMonitor } = getTenantCapabilities(state);
  const { hasReporting } = getFeatures(state);
  let devices = getMappedDevicesList(state, 'deviceList');
  let deviceCount = state.devices.deviceList.total;
  let selectedGroup;
  let groupFilters = [];
  if (state.devices.groups.selectedGroup && state.devices.groups.byId[state.devices.groups.selectedGroup]) {
    selectedGroup = state.devices.groups.selectedGroup;
    groupFilters = state.devices.groups.byId[selectedGroup].filters || [];
  } else if (!isEmpty(state.devices.selectedDevice)) {
    devices = getMappedDevicesList(state, 'selectedDevice');
    deviceCount = 1;
  }
  const { columnSelection } = getUserSettings(state);
  const { canManageDevices } = getUserCapabilities(state);
  return {
    attributes: getFilterAttributes(state),
    acceptedCount: state.devices.byStatus.accepted.total || 0,
    allCount: state.devices.byStatus.accepted.total + state.devices.byStatus.rejected.total || 0,
    availableIssueOptions: getAvailableIssueOptionsByType(state),
    canManageDevices,
    columnSelection,
    customColumnSizes: state.users.customColumns,
    devices,
    deviceListState: state.devices.deviceList,
    deviceCount,
    filters: state.devices.filters || [],
    groupFilters,
    hasMonitor,
    hasReporting,
    idAttribute: getIdAttribute(state),
    onboardingState: getOnboardingState(state),
    pendingCount: state.devices.byStatus.pending.total || 0,
    selectedGroup,
    showHelptips: state.users.showHelptips
  };
};

export default connect(mapStateToProps, actionCreators)(Authorized);

const DeviceStateSelection = ({ onStateChange, selectedState, states }) => {
  const theme = useTheme();
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
