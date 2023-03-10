import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// material ui
import { Autorenew as AutorenewIcon, Delete as DeleteIcon, FilterList as FilterListIcon, LockOutlined } from '@mui/icons-material';
import { Button, MenuItem, Select } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

import { setSnackbar } from '../../actions/appActions';
import { deleteAuthset, setDeviceFilters, setDeviceListState, updateDevicesAuth } from '../../actions/deviceActions';
import { getIssueCountsByType } from '../../actions/monitorActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { saveUserSettings, updateUserColumnSettings } from '../../actions/userActions';
import { SORTING_OPTIONS, TIMEOUTS } from '../../constants/appConstants';
import { ALL_DEVICES, DEVICE_ISSUE_OPTIONS, DEVICE_STATES, UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { duplicateFilter, toggle } from '../../helpers';
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
import { useDebounce } from '../../utils/debouncehook';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import useWindowSize from '../../utils/resizehook';
import { clearAllRetryTimers, setRetryTimer } from '../../utils/retrytimer';
import Loader from '../common/loader';
import { ExpandDevice } from '../helptips/helptooltips';
import { defaultHeaders, defaultTextRender, getDeviceIdentityText, routes as states } from './base-devices';
import DeviceList, { minCellWidth } from './devicelist';
import ColumnCustomizationDialog from './dialogs/custom-columns-dialog';
import ExpandedDevice from './expanded-device';
import DeviceQuickActions from './widgets/devicequickactions';
import Filters from './widgets/filters';
import DeviceIssuesSelection from './widgets/issueselection';
import ListOptions from './widgets/listoptions';

const refreshDeviceLength = TIMEOUTS.refreshDefault;

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

const useStyles = makeStyles()(theme => ({
  filterCommon: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: theme.palette.grey[100],
    background: theme.palette.background.default,
    [`.filter-list > .MuiChip-root`]: {
      marginBottom: theme.spacing()
    },
    [`.filter-list > .MuiChip-root > .MuiChip-label`]: {
      whiteSpace: 'normal'
    },
    ['&.filter-header']: {
      overflow: 'hidden',
      zIndex: 2
    },
    ['&.filter-toggle']: {
      background: 'transparent',
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 0,
      borderBottomColor: theme.palette.background.default,
      marginBottom: -1
    },
    ['&.filter-wrapper']: {
      padding: 20,
      borderTopLeftRadius: 0
    }
  }
}));

export const getHeaders = (columnSelection = [], currentStateHeaders, idAttribute, openSettingsDialog) => {
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

const calculateColumnSelectionSize = (changedColumns, customColumnSizes) =>
  changedColumns.reduce(
    (accu, column) => {
      const size = customColumnSizes.find(({ attribute }) => attribute.name === column.key && attribute.scope === column.scope)?.size || minCellWidth;
      accu.columnSizes.push({ attribute: { name: column.key, scope: column.scope }, size });
      accu.selectedAttributes.push({ attribute: column.key, scope: column.scope });
      return accu;
    },
    { columnSizes: [], selectedAttributes: [] }
  );

const OnboardingComponent = ({ authorizeRef, deviceListRef, onboardingState, selectedRows }) => {
  let onboardingComponent = null;
  if (deviceListRef.current) {
    const element = deviceListRef.current.querySelector('body .deviceListItem > div');
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
  return onboardingComponent;
};

export const Authorized = props => {
  const {
    acceptedCount,
    addDevicesToGroup,
    advanceOnboarding,
    allCount,
    attributes,
    availableIssueOptions,
    columnSelection,
    customColumnSizes,
    deleteAuthset,
    deviceCount,
    deviceListState,
    devices,
    features,
    filters,
    getIssueCountsByType,
    groupFilters,
    highlightHelp,
    idAttribute,
    limitMaxed,
    onboardingState,
    onGroupClick,
    onGroupRemoval,
    onMakeGatewayClick,
    onPreauthClick,
    openSettingsDialog,
    pendingCount,
    removeDevicesFromGroup,
    saveUserSettings,
    selectedGroup,
    setDeviceFilters,
    setDeviceListState,
    settingsInitialized,
    showHelptips,
    showsDialog,
    tenantCapabilities,
    updateDevicesAuth,
    updateUserColumnSettings,
    userCapabilities
  } = props;
  const {
    refreshTrigger,
    selectedId,
    selectedIssues = [],
    isLoading: pageLoading,
    selection: selectedRows,
    sort = {},
    state: selectedState,
    detailsTab: tabSelection
  } = deviceListState;
  const { direction: sortDown = SORTING_OPTIONS.desc, key: sortCol } = sort;
  const { canManageDevices } = userCapabilities;
  const { hasMonitor } = tenantCapabilities;
  const currentSelectedState = states[selectedState] ?? states.devices;
  const [columnHeaders, setColumnHeaders] = useState([]);
  const [headerKeys, setHeaderKeys] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [devicesInitialized, setDevicesInitialized] = useState(!!devices.length);
  const [showFilters, setShowFilters] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const deviceListRef = useRef();
  const authorizeRef = useRef();
  const timer = useRef();
  const navigate = useNavigate();

  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();

  const { classes } = useStyles();

  useEffect(() => {
    clearAllRetryTimers(setSnackbar);
    if (!filters.length && selectedGroup && groupFilters.length) {
      setDeviceFilters(groupFilters);
    }
    return () => {
      clearInterval(timer.current);
      clearAllRetryTimers(setSnackbar);
    };
  }, []);

  useEffect(() => {
    const columnHeaders = getHeaders(columnSelection, currentSelectedState.defaultHeaders, idAttribute, openSettingsDialog);
    setColumnHeaders(columnHeaders);
    setHeaderKeys(columnHeaders.map(({ attribute: { name, scope } }) => `${name}-${scope}`).join('-'));
  }, [columnSelection, selectedState, idAttribute.attribute]);

  useEffect(() => {
    // only set state after all devices id data retrieved
    setIsInitialized(isInitialized => isInitialized || (settingsInitialized && devicesInitialized && pageLoading === false));
    setDevicesInitialized(devicesInitialized => devicesInitialized || pageLoading === false);
  }, [settingsInitialized, devicesInitialized, pageLoading]);

  useEffect(() => {
    if (onboardingState.complete) {
      return;
    }
    if (pendingCount) {
      advanceOnboarding(onboardingSteps.DEVICES_PENDING_ONBOARDING_START);
      return;
    }
    if (!acceptedCount) {
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
        !!notification && setSnackbar('open', TIMEOUTS.refreshDefault, '', notification, () => {}, true);
      }, 400);
    }
  }, [acceptedCount, allCount, pendingCount, onboardingState.complete]);

  useEffect(() => {
    setShowFilters(false);
  }, [selectedGroup]);

  useEffect(() => {
    if (!devicesInitialized) {
      return;
    }
    clearInterval(timer.current);
    timer.current = setInterval(
      () =>
        setDeviceListState({ refreshTrigger: !refreshTrigger }).catch(err =>
          setRetryTimer(err, 'devices', `Devices couldn't be loaded.`, refreshDeviceLength, setSnackbar)
        ),
      refreshDeviceLength
    );
  }, [devicesInitialized, refreshTrigger]);

  useEffect(() => {
    Object.keys(availableIssueOptions).map(key => getIssueCountsByType(key, { filters, group: selectedGroup, state: selectedState }));
    availableIssueOptions[DEVICE_ISSUE_OPTIONS.authRequests.key] ? getIssueCountsByType(DEVICE_ISSUE_OPTIONS.authRequests.key, { filters: [] }) : undefined;
  }, [selectedIssues, availableIssueOptions, selectedState, selectedGroup]);

  /*
   * Devices
   */
  const devicesToIds = devices => devices.map(device => device.id);

  const onAddDevicesToGroup = devices => {
    const deviceIds = devicesToIds(devices);
    addDevicesToGroup(deviceIds);
  };

  const onRemoveDevicesFromGroup = devices => {
    const deviceIds = devicesToIds(devices);
    removeDevicesFromGroup(deviceIds);
    // if devices.length = number on page but < deviceCount
    // move page back to pageNO 1
    if (devices.length === deviceIds.length) {
      handlePageChange(1);
    }
  };

  const onAuthorizationChange = (devices, changedState) => {
    const deviceIds = devicesToIds(devices);
    return setDeviceListState({ isLoading: true })
      .then(() => updateDevicesAuth(deviceIds, changedState))
      .then(() => onSelectionChange([]));
  };

  const onDeviceDismiss = devices =>
    setDeviceListState({ isLoading: true })
      .then(() => {
        const deleteRequests = devices.reduce((accu, device) => {
          if (device.auth_sets?.length) {
            accu.push(deleteAuthset(device.id, device.auth_sets[0].id));
          }
          return accu;
        }, []);
        return Promise.all(deleteRequests);
      })
      .then(() => onSelectionChange([]));

  const handlePageChange = page => setDeviceListState({ selectedId: undefined, page, refreshTrigger: !refreshTrigger });

  const onPageLengthChange = perPage => {
    setDeviceListState({ perPage, page: 1, refreshTrigger: !refreshTrigger });
  };

  const refreshDevices = () => setDeviceListState({ refreshTrigger: !refreshTrigger });

  const onSortChange = attribute => {
    let changedSortCol = attribute.name;
    let changedSortDown = sortDown === SORTING_OPTIONS.desc ? SORTING_OPTIONS.asc : SORTING_OPTIONS.desc;
    if (changedSortCol !== sortCol) {
      changedSortDown = SORTING_OPTIONS.desc;
    }
    setDeviceListState({
      sort: { direction: changedSortDown, key: changedSortCol, scope: attribute.scope },
      refreshTrigger: !refreshTrigger
    });
  };

  const onFilterChange = () => handlePageChange(1);

  const onDeviceStateSelectionChange = newState => {
    setDeviceListState({ state: newState, page: 1, refreshTrigger: !refreshTrigger });
  };

  const setDetailsTab = detailsTab => setDeviceListState({ detailsTab, setOnly: true });

  const onDeviceIssuesSelectionChange = ({ target: { value: selectedIssues } }) => {
    setDeviceListState({ selectedIssues, page: 1, refreshTrigger: !refreshTrigger });
  };

  const onSelectionChange = (selection = []) => {
    if (!onboardingState.complete && selection.length) {
      advanceOnboarding(onboardingSteps.DEVICES_PENDING_ACCEPTING_ONBOARDING);
    }
    setDeviceListState({ selection, setOnly: true });
  };

  const onToggleCustomizationClick = () => setShowCustomization(toggle);

  const onChangeColumns = (changedColumns, customColumnSizes) => {
    const { columnSizes, selectedAttributes } = calculateColumnSelectionSize(changedColumns, customColumnSizes);
    updateUserColumnSettings(columnSizes);
    saveUserSettings({ columnSelection: changedColumns });
    // we don't need an explicit refresh trigger here, since the selectedAttributes will be different anyway & otherwise the shown list should still be valid
    setDeviceListState({ selectedAttributes });
    setShowCustomization(false);
  };

  const onExpandClick = (device = {}) => {
    setSnackbar('');
    let { attributes = {}, id, status } = device;
    setDeviceListState({ selectedId: deviceListState.selectedId === id ? undefined : id });
    if (!onboardingState.complete) {
      advanceOnboarding(onboardingSteps.DEVICES_PENDING_ONBOARDING);
      if (status === DEVICE_STATES.accepted && Object.values(attributes).some(value => value)) {
        advanceOnboarding(onboardingSteps.DEVICES_ACCEPTED_ONBOARDING_NOTIFICATION);
      }
    }
  };

  const onCreateDeploymentClick = devices => navigate(`/deployments?open=true&${devices.map(({ id }) => `deviceId=${id}`).join('&')}`);

  const actionCallbacks = {
    onAddDevicesToGroup,
    onAuthorizationChange,
    onDeviceDismiss,
    onRemoveDevicesFromGroup,
    onCreateDeployment: onCreateDeploymentClick
  };

  const listOptionHandlers = [{ key: 'customize', title: 'Customize', onClick: onToggleCustomizationClick }];
  const devicePendingTip = getOnboardingComponentFor(onboardingSteps.DEVICES_PENDING_ONBOARDING_START, onboardingState);

  const EmptyState = currentSelectedState.emptyState;

  const groupLabel = selectedGroup ? decodeURIComponent(selectedGroup) : ALL_DEVICES;
  const isUngroupedGroup = selectedGroup && selectedGroup === UNGROUPED_GROUP.id;
  const selectedStaticGroup = selectedGroup && !groupFilters.length ? selectedGroup : undefined;

  const openedDevice = useDebounce(selectedId, TIMEOUTS.debounceShort);
  return (
    <>
      <div className="margin-left-small">
        <div className="flexbox">
          <h3 className="margin-right">{isUngroupedGroup ? UNGROUPED_GROUP.name : groupLabel}</h3>
          <div className="flexbox space-between center-aligned" style={{ flexGrow: 1 }}>
            <div className="flexbox">
              <DeviceStateSelection onStateChange={onDeviceStateSelectionChange} selectedState={selectedState} states={states} />
              {hasMonitor && (
                <DeviceIssuesSelection onChange={onDeviceIssuesSelectionChange} options={Object.values(availableIssueOptions)} selection={selectedIssues} />
              )}
              {selectedGroup && !isUngroupedGroup && (
                <div className="margin-left muted flexbox centered">
                  {!groupFilters.length ? <LockOutlined fontSize="small" /> : <AutorenewIcon fontSize="small" />}
                  <span>{!groupFilters.length ? 'Static' : 'Dynamic'}</span>
                </div>
              )}
            </div>
            {canManageDevices && selectedGroup && !isUngroupedGroup && (
              <Button onClick={onGroupRemoval} startIcon={<DeleteIcon />}>
                Remove group
              </Button>
            )}
          </div>
        </div>
        <div className="flexbox space-between">
          {!isUngroupedGroup && (
            <div className={`flexbox centered filter-header ${showFilters ? `${classes.filterCommon} filter-toggle` : ''}`}>
              <Button
                color="secondary"
                disableRipple
                onClick={() => setShowFilters(toggle)}
                startIcon={<FilterListIcon />}
                style={{ backgroundColor: 'transparent' }}
              >
                {filters.length > 0 ? `Filters (${filters.length})` : 'Filters'}
              </Button>
            </div>
          )}
          <ListOptions options={listOptionHandlers} title="Table options" />
        </div>
        <Filters
          className={classes.filterCommon}
          onFilterChange={onFilterChange}
          onGroupClick={onGroupClick}
          isModification={!!groupFilters.length}
          open={showFilters}
        />
      </div>
      <Loader show={!isInitialized} />
      {isInitialized ? (
        devices.length > 0 ? (
          <div className="padding-bottom" ref={deviceListRef}>
            <DeviceList
              {...props}
              columnHeaders={columnHeaders}
              customColumnSizes={customColumnSizes}
              headerKeys={headerKeys}
              onChangeRowsPerPage={onPageLengthChange}
              onExpandClick={onExpandClick}
              onPageChange={handlePageChange}
              onResizeColumns={updateUserColumnSettings}
              onSelect={onSelectionChange}
              onSort={onSortChange}
              pageLoading={pageLoading}
              pageTotal={deviceCount}
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
      <ExpandedDevice
        deviceId={openedDevice}
        onAddDevicesToGroup={onAddDevicesToGroup}
        onAuthorizationChange={onAuthorizationChange}
        onClose={() => setDeviceListState({ selectedId: undefined })}
        onDeviceDismiss={onDeviceDismiss}
        onMakeGatewayClick={onMakeGatewayClick}
        onRemoveDevicesFromGroup={onRemoveDevicesFromGroup}
        refreshDevices={refreshDevices}
        setDetailsTab={setDetailsTab}
        tabSelection={tabSelection}
      />
      {!selectedId && (
        <OnboardingComponent authorizeRef={authorizeRef} deviceListRef={deviceListRef} onboardingState={onboardingState} selectedRows={selectedRows} />
      )}
      {canManageDevices && !!selectedRows.length && (
        <DeviceQuickActions
          actionCallbacks={actionCallbacks}
          devices={devices}
          features={features}
          selectedGroup={selectedStaticGroup}
          selectedRows={selectedRows}
          ref={authorizeRef}
          tenantCapabilities={tenantCapabilities}
          userCapabilities={userCapabilities}
        />
      )}
      <ColumnCustomizationDialog
        attributes={attributes}
        columnHeaders={columnHeaders}
        customColumnSizes={customColumnSizes}
        idAttribute={idAttribute}
        open={showCustomization}
        onCancel={onToggleCustomizationClick}
        onSubmit={onChangeColumns}
      />
    </>
  );
};

const actionCreators = {
  advanceOnboarding,
  deleteAuthset,
  getIssueCountsByType,
  saveUserSettings,
  setDeviceFilters,
  setDeviceListState,
  setSnackbar,
  updateDevicesAuth,
  updateUserColumnSettings
};

const mapStateToProps = state => {
  let devices = getMappedDevicesList(state, 'deviceList');
  let deviceCount = state.devices.deviceList.total;
  let selectedGroup;
  let groupFilters = [];
  if (state.devices.groups.selectedGroup && state.devices.groups.byId[state.devices.groups.selectedGroup]) {
    selectedGroup = state.devices.groups.selectedGroup;
    groupFilters = state.devices.groups.byId[selectedGroup].filters || [];
  }
  const { columnSelection = [] } = getUserSettings(state);
  return {
    attributes: getFilterAttributes(state),
    acceptedCount: state.devices.byStatus.accepted.total || 0,
    allCount: state.devices.byStatus.accepted.total + state.devices.byStatus.rejected.total || 0,
    availableIssueOptions: getAvailableIssueOptionsByType(state),
    columnSelection,
    customColumnSizes: state.users.customColumns,
    devices,
    deviceListState: state.devices.deviceList,
    deviceCount,
    features: getFeatures(state),
    filters: state.devices.filters || [],
    groupFilters,
    idAttribute: getIdAttribute(state),
    onboardingState: getOnboardingState(state),
    pendingCount: state.devices.byStatus.pending.total || 0,
    selectedGroup,
    settingsInitialized: state.users.settingsInitialized,
    showHelptips: state.users.showHelptips,
    tenantCapabilities: getTenantCapabilities(state),
    userCapabilities: getUserCapabilities(state)
  };
};

export default connect(mapStateToProps, actionCreators)(Authorized);

export const DeviceStateSelection = ({ onStateChange, selectedState = '', states }) => {
  const theme = useTheme();
  const availableStates = useMemo(() => Object.values(states).filter(duplicateFilter), [states]);

  return (
    <div className="flexbox centered">
      Status:
      <Select
        disableUnderline
        onChange={e => onStateChange(e.target.value)}
        value={selectedState}
        style={{ fontSize: 13, marginLeft: theme.spacing(), marginTop: 2 }}
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
