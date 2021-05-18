import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import pluralize from 'pluralize';

// material ui
import { Button, SvgIcon } from '@material-ui/core';
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@material-ui/lab';

import {
  AddCircle as AddCircleIcon,
  Autorenew as AutorenewIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  HeightOutlined as HeightOutlinedIcon,
  HighlightOffOutlined as HighlightOffOutlinedIcon,
  LockOutlined
} from '@material-ui/icons';
import { mdiTrashCanOutline as TrashCan } from '@mdi/js';

import { getDevicesByStatus, getGroupDevices, selectDevices, setDeviceFilters, updateDevicesAuth } from '../../actions/deviceActions';
import { setSnackbar } from '../../actions/appActions';
import { DEVICE_LIST_MAXIMUM_LENGTH, DEVICE_STATES, UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { filtersCompare, isEmpty } from '../../helpers';
import { getIdAttribute, getOnboardingState } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import { clearAllRetryTimers, setRetryTimer } from '../../utils/retrytimer';
import Loader from '../common/loader';
import { ExpandDevice } from '../helptips/helptooltips';
import DeviceList from './devicelist';
import DeviceStatus from './device-status';
import { refreshLength as refreshDeviceLength } from './devices';
import Filters from './filters';
import BaseDevices, { DeviceExpansion, RelativeDeviceTime } from './base-devices';

const deviceStatus = device => <DeviceStatus device={device} />;

const defaultHeaders = [
  {
    title: 'Device type',
    attribute: { name: 'device_type', scope: 'inventory' },
    render: device => (device.attributes && device.attributes.device_type ? device.attributes.device_type : '-'),
    sortable: true
  },
  {
    title: 'System software version',
    attribute: { name: 'rootfs-image.version', scope: 'inventory', alternative: 'artifact_name' },
    render: ({ attributes = {} }) => attributes['rootfs-image.version'] || attributes.artifact_name || '-',
    sortable: true
  },
  {
    title: 'Last check-in',
    attribute: { name: 'updated_ts', scope: 'system' },
    render: RelativeDeviceTime,
    sortable: true
  },
  {
    title: '',
    attribute: { name: 'status', scope: 'identity' },
    render: deviceStatus,
    sortable: false
  },
  {
    title: '',
    attribute: {},
    render: DeviceExpansion,
    sortable: false
  }
];

const sortingAlternatives = defaultHeaders.reduce((accu, item) => {
  if (item.attribute.alternative) {
    accu[item.attribute.name] = item.attribute.alternative;
    accu[item.attribute.alternative] = item.attribute.name;
  }
  return accu;
}, {});

export class Authorized extends BaseDevices {
  constructor(props, context) {
    super(props, context);
    this.state = {
      isInitialized: !!props.devices.length,
      pageLoading: true,
      pageNo: 1,
      pageLength: 20,
      selectedRows: [],
      showActions: false,
      showFilters: false,
      sortCol: null,
      sortDown: true,
      sortScope: null,
      tmpDevices: []
    };
  }

  handleResize() {
    setTimeout(() => {
      this.setState({ height: window.innerHeight, width: window.innerWidth });
    }, 500);
  }

  componentDidMount() {
    const self = this;
    const {
      acceptedCount,
      acceptedDevicesList,
      deploymentDeviceLimit,
      getDevicesByStatus,
      groupDevices,
      groupFilters,
      selectDevices,
      selectedGroup,
      setDeviceFilters
    } = self.props;
    const { pageLength } = self.state;
    setDeviceFilters([]);
    self.setState({ selectedRows: [], expandRow: null });
    if (!acceptedDevicesList.length && acceptedCount < deploymentDeviceLimit) {
      getDevicesByStatus(DEVICE_STATES.accepted);
    }
    clearAllRetryTimers(setSnackbar);
    if (selectedGroup) {
      if (!groupFilters.length) {
        self.setState({ pageLoading: false }, () => selectDevices(groupDevices.slice(0, pageLength)));
      } else {
        setDeviceFilters(groupFilters);
      }
    }
    clearInterval(self.timer);
    // no group, no filters, all devices
    self.timer = setInterval(() => self._getDevices(), refreshDeviceLength);
    self._getDevices(true);
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    clearAllRetryTimers(this.props.setSnackbar);
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  componentDidUpdate(prevProps) {
    const self = this;
    if (
      prevProps.allCount !== self.props.allCount ||
      prevProps.selectedGroup !== self.props.selectedGroup ||
      prevProps.devices.length !== self.props.devices.length ||
      prevProps.groupCount !== self.props.groupCount ||
      filtersCompare(prevProps.filters, self.props.filters)
    ) {
      const { acceptedCount, onboardingState, selectedGroup, setSnackbar } = self.props;
      var newState = { selectedRows: [], expandRow: null, allRowsSelected: false };
      if (prevProps.selectedGroup != selectedGroup) {
        newState = { pageNo: 1, showFilters: false, ...newState };
      }
      self.setState(newState);
      if (acceptedCount && acceptedCount < 2) {
        setTimeout(() => {
          const notification = getOnboardingComponentFor(onboardingSteps.DEVICES_ACCEPTED_ONBOARDING_NOTIFICATION, onboardingState);
          !!notification && setSnackbar('open', 10000, '', notification, () => {}, true);
        }, 400);
      }
      clearInterval(self.timer);
      self.timer = setInterval(() => self._getDevices(), refreshDeviceLength);
      self._getDevices(true);
    }
  }

  /*
   * Devices
   */
  _getDevices(shouldUpdate = false) {
    const self = this;
    const { filters, getDevicesByStatus, getGroupDevices, selectedGroup, setSnackbar } = self.props;
    const { pageLength, pageNo, sortCol, sortDown, sortScope } = self.state;
    const sortBy = sortCol ? [{ attribute: sortCol, order: sortDown ? 'desc' : 'asc', scope: sortScope }] : undefined;
    if (sortCol && sortingAlternatives[sortCol]) {
      sortBy.push({ ...sortBy[0], attribute: sortingAlternatives[sortCol] });
    }
    let request;
    // if a group is selected, use getGroupDevices
    if (selectedGroup) {
      request = getGroupDevices(selectedGroup, pageNo, pageLength, true, sortBy);
    } else {
      // otherwise, get accepted devices from the inventory, eventually applying filters
      const hasFilters = filters.length && filters[0].value;
      request = getDevicesByStatus(DEVICE_STATES.accepted, pageNo, pageLength, shouldUpdate || hasFilters, undefined, sortBy);
    }
    request
      .catch(err => setRetryTimer(err, 'devices', `Devices couldn't be loaded.`, refreshDeviceLength, setSnackbar))
      // only set state after all devices id data retrieved
      .finally(() => self.setState({ isInitialized: true, pageLoading: false }));
  }

  onRowSelection(selection) {
    this.setState({ selectedRows: selection });
  }

  onAddDevicesToGroup(rows) {
    const devices = rows.map(row => this.props.devices[row]);
    this.props.addDevicesToGroup(devices);
  }

  onRemoveDevicesFromGroup(rows) {
    const devices = rows.map(row => this.props.devices[row]);
    this.props.removeDevicesFromGroup(devices);
    // if devices.length = number on page but < groupCount
    // move page back to pageNO 1
    if (this.props.devices.length === devices.length) {
      this.setState({ pageNo: 1, pageLoading: true }, () => this._getDevices());
    }
  }

  onRejectDevices(rows) {
    var self = this;
    self.setState({ pageLoading: true });
    const deviceIds = rows.map(row => self.props.devices[row]);
    return self.props.updateDevicesAuth(deviceIds, DEVICE_STATES.rejected).then(() => self.setState({ selectedRows: [], pageLoading: false }));
  }

  onCreateGroupClick() {
    if (this.props.selectedGroup) {
      this.setState({ showFilters: !this.state.showFilters });
    }
    return this.props.onGroupClick();
  }

  render() {
    const self = this;
    const {
      allCount,
      devices,
      filters,
      groupCount,
      groupFilters,
      idAttribute,
      onboardingState,
      onGroupRemoval,
      openSettingsDialog,
      selectedGroup,
      showHelptips
    } = self.props;
    const { isInitialized, selectedRows, showActions, showFilters } = self.state;
    const columnHeaders = [
      {
        title: idAttribute,
        customize: openSettingsDialog,
        attribute: { name: idAttribute, scope: 'identity' },
        sortable: true
      },
      ...defaultHeaders
    ];

    const groupLabel = selectedGroup ? decodeURIComponent(selectedGroup) : 'All devices';
    const pluralized = pluralize('devices', selectedRows.length);
    let actions = [
      { icon: <HighlightOffOutlinedIcon className="red" />, key: 'reject', title: `Reject ${pluralized}`, action: () => self.onRejectDevices(selectedRows) }
    ];
    if (selectedGroup) {
      actions.push({
        icon: <HeightOutlinedIcon className="rotated ninety" />,
        key: 'group-change',
        title: `Move selected ${pluralized} to another group`,
        action: () => self.onAddDevicesToGroup(selectedRows)
      });
      if (selectedGroup !== UNGROUPED_GROUP.id) {
        actions.push({
          icon: (
            <SvgIcon fontSize="inherit">
              <path d={TrashCan} />
            </SvgIcon>
          ),
          key: 'group-remove',
          title: `Remove selected ${pluralized} from this group`,
          action: () => self.onRemoveDevicesFromGroup(selectedRows)
        });
      }
    } else {
      actions.push({
        icon: <AddCircleIcon className="green" />,
        key: 'group-add',
        title: `Add selected ${pluralized} to a group`,
        action: () => self.onAddDevicesToGroup(selectedRows)
      });
    }

    const anchor = { left: 200, top: 146 };
    let onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEVICES_ACCEPTED_ONBOARDING, onboardingState, { anchor });
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED, onboardingState, { anchor }, onboardingComponent);

    const isUngroupedGroup = selectedGroup && selectedGroup === UNGROUPED_GROUP.id;
    return (
      <div className="relative">
        <div style={{ marginLeft: '20px' }}>
          <div className="flexbox space-between filter-header">
            <div className="flexbox">
              <h2 className="margin-right">{isUngroupedGroup ? UNGROUPED_GROUP.name : groupLabel}</h2>
              {(!selectedGroup || !!groupFilters.length) && !isUngroupedGroup && (
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
              )}
              {selectedGroup && !isUngroupedGroup && (
                <p className="info flexbox centered">
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
          <Filters
            onFilterChange={() => self.setState({ pageNo: 1 }, () => self._getDevices(true))}
            onGroupClick={() => self.onCreateGroupClick()}
            isModification={!!groupFilters.length}
            open={showFilters}
          />
        </div>
        <Loader show={!isInitialized} />
        {isInitialized ? (
          devices.length > 0 ? (
            <div className="padding-bottom">
              <DeviceList
                {...self.props}
                {...self.state}
                columnHeaders={columnHeaders}
                onChangeRowsPerPage={pageLength => self.setState({ pageNo: 1, pageLength }, () => self._handlePageChange(1))}
                onPageChange={e => self._handlePageChange(e)}
                onSelect={selection => self.onRowSelection(selection)}
                onSort={attribute => self.onSortChange(attribute)}
                pageTotal={groupCount}
                refreshDevices={shouldUpdate => self._getDevices(shouldUpdate)}
              />
              {showHelptips && <ExpandDevice />}
            </div>
          ) : (
            <div className="dashboard-placeholder">
              <p>No devices found</p>
              {!allCount && (
                <>
                  <p>No devices have been authorized to connect to the Mender server yet.</p>
                  <p>
                    Visit the <Link to="/help/get-started">Help section</Link> to learn how to connect devices to the Mender server.
                  </p>
                </>
              )}
            </div>
          )
        ) : (
          <div />
        )}
        {onboardingComponent ? onboardingComponent : null}
        {!!selectedRows.length && (
          <div className="flexbox fixedButtons">
            <div className="margin-right">
              {selectedRows.length} {pluralize('devices', selectedRows.length)} selected
            </div>
            <SpeedDial
              ariaLabel="device-actions"
              className="margin-small"
              icon={<SpeedDialIcon />}
              onClose={() => self.setState({ showActions: false })}
              onOpen={() => self.setState({ showActions: true })}
              open={showActions}
            >
              {actions.map(action => (
                <SpeedDialAction key={action.key} aria-label={action.key} icon={action.icon} tooltipTitle={action.title} tooltipOpen onClick={action.action} />
              ))}
            </SpeedDial>
          </div>
        )}
      </div>
    );
  }
}

const actionCreators = {
  getDevicesByStatus,
  getGroupDevices,
  selectDevices,
  setDeviceFilters,
  setSnackbar,
  updateDevicesAuth
};

const mapStateToProps = state => {
  let devices = state.devices.selectedDeviceList.slice(0, DEVICE_LIST_MAXIMUM_LENGTH);
  let groupCount = state.devices.byStatus.accepted.total;
  let selectedGroup;
  let groupFilters = [];
  let groupDevices = [];
  if (state.devices.groups.selectedGroup && state.devices.groups.byId[state.devices.groups.selectedGroup]) {
    selectedGroup = state.devices.groups.selectedGroup;
    groupCount = state.devices.groups.byId[selectedGroup].total;
    groupFilters = state.devices.groups.byId[selectedGroup].filters || [];
    groupDevices = state.devices.groups.byId[selectedGroup].deviceIds;
  } else if (!isEmpty(state.devices.selectedDevice)) {
    devices = [state.devices.selectedDevice];
  } else if (!devices.length && !state.devices.filters.length && state.devices.byStatus.accepted.total) {
    devices = state.devices.byStatus.accepted.deviceIds.slice(0, 20);
  }
  return {
    acceptedCount: state.devices.byStatus.accepted.total || 0,
    acceptedDevicesList: state.devices.byStatus.accepted.deviceIds.slice(0, 20),
    allCount: state.devices.byStatus.accepted.total + state.devices.byStatus.rejected.total || 0,
    deploymentDeviceLimit: state.deployments.deploymentDeviceLimit,
    devices,
    filters: state.devices.filters || [],
    groupCount,
    groupDevices,
    groupFilters,
    idAttribute: getIdAttribute(state),
    onboardingState: getOnboardingState(state),
    selectedGroup,
    showHelptips: state.users.showHelptips
  };
};

export default connect(mapStateToProps, actionCreators)(Authorized);
