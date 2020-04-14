import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import pluralize from 'pluralize';

// material ui
import { Button, Tooltip } from '@material-ui/core';

import {
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  Help as HelpIcon,
  InfoOutlined as InfoIcon,
  LockOutlined,
  RemoveCircleOutline as RemoveCircleOutlineIcon
} from '@material-ui/icons';

import { ExpandDevice } from '../helptips/helptooltips';
import { WelcomeSnackTip } from '../helptips/onboardingtips';

import Loader from '../common/loader';
import RelativeTime from '../common/relative-time';

import DeviceList from './devicelist';
import DeviceStatus from './device-status';
import Filters from './filters';

import {
  getAllDevicesByStatus,
  getDevices,
  getDevicesByStatus,
  getGroupDevices,
  selectDevices,
  setDeviceFilters,
  trySelectDevice
} from '../../actions/deviceActions';
import { setSnackbar } from '../../actions/appActions';

import { filtersCompare, isEmpty, isUngroupedGroup } from '../../helpers';
import DeviceConstants from '../../constants/deviceConstants';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import { clearAllRetryTimers, setRetryTimer } from '../../utils/retrytimer';

const refreshDeviceLength = 10000;

export class Authorized extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      pageNo: 1,
      pageLength: 20,
      selectedRows: [],
      tmpDevices: []
    };
  }

  componentDidMount() {
    const self = this;
    if (!this.props.acceptedDevicesList.length && this.props.acceptedCount < this.props.deploymentDeviceLimit) {
      this.props.getAllDevicesByStatus(DeviceConstants.DEVICE_STATES.accepted);
    }
    if (self.props.acceptedDevicesList.length < 20) {
      self._getDevices(true);
    } else {
      self.props.selectDevices(self.props.acceptedDevicesList);
    }
    clearAllRetryTimers(self.props.setSnackbar);
    if (self.props.filters && self.props.groupDevices.length) {
      self.setState({ loading: false }, () => self.props.selectDevices(self.props.groupDevices.slice(0, self.state.pageLength)));
    } else {
      clearInterval(self.deviceTimer);
      // no group, no filters, all devices
      self.deviceTimer = setInterval(() => self._getDevices(), refreshDeviceLength);
      self._getDevices();
    }
  }

  componentWillUnmount() {
    clearInterval(this.deviceTimer);
    clearAllRetryTimers(this.props.setSnackbar);
  }

  componentDidUpdate(prevProps) {
    if (this.props.currentTab !== 'Device groups') {
      return clearInterval(this.deviceTimer);
    }
    const self = this;
    if (prevProps.currentTab !== self.props.currentTab) {
      self.props.setDeviceFilters([]);
      self.setState({ selectedRows: [], expandRow: null });
    }
    if (
      prevProps.allCount !== self.props.allCount ||
      prevProps.group !== self.props.group ||
      prevProps.devices.length !== self.props.devices.length ||
      prevProps.groupCount !== self.props.groupCount ||
      filtersCompare(prevProps.filters, self.props.filters)
    ) {
      self.setState({ selectedRows: [], expandRow: null, allRowsSelected: false });
      if (self.props.showHelptips && self.props.showTips && !self.props.onboardingComplete && self.props.acceptedCount && self.props.acceptedCount < 2) {
        setTimeout(() => self.props.setSnackbar('open', 10000, '', <WelcomeSnackTip progress={2} />, () => {}, self.onCloseSnackbar), 400);
      }
      clearInterval(self.deviceTimer);
      self.deviceTimer = setInterval(() => self._getDevices(), refreshDeviceLength);
      self._getDevices(true);
    }
  }

  /*
   * Devices
   */
  _getDevices(shouldUpdate = false) {
    const self = this;
    const { filters, getDevices, getDevicesByStatus, getGroupDevices, selectDevices, selectedGroup, setSnackbar, ungroupedDevices } = self.props;
    const { pageLength, pageNo } = self.state;
    const hasFilters = filters.length && filters[0].value;

    if (selectedGroup || hasFilters) {
      let request;
      if (selectedGroup) {
        request = isUngroupedGroup(selectedGroup) ? Promise.resolve() : getGroupDevices(selectedGroup, pageNo, pageLength, true);
      } else {
        const filterId = filters.find(item => item.key === 'id');
        if (filterId && filters.length === 1) {
          return self.getDeviceById(filterId.value);
        }
        request = getDevices(pageNo, pageLength, filters, true);
      }
      // if a group or filters, must use inventory API
      return (
        request
          .then(() => {
            if (isUngroupedGroup(selectedGroup)) {
              const offset = (pageNo - 1) * pageLength;
              const devices = ungroupedDevices.slice(offset, offset + pageLength);
              return selectDevices(devices);
            }
          })
          .catch(err => {
            console.log(err);
            var errormsg = err.error || 'Please check your connection.';
            setRetryTimer(err, 'devices', `Devices couldn't be loaded. ${errormsg}`, refreshDeviceLength, setSnackbar);
          })
          // only set state after all devices id data retrieved
          .finally(() => self.setState({ loading: false, pageLoading: false }))
      );
    } else {
      // otherwise, show accepted from device adm
      return getDevicesByStatus(DeviceConstants.DEVICE_STATES.accepted, pageNo, pageLength, shouldUpdate)
        .catch(err => {
          console.log(err);
          var errormsg = err.error || 'Please check your connection.';
          setRetryTimer(err, 'devices', `Devices couldn't be loaded. ${errormsg}`, refreshDeviceLength, setSnackbar);
        })
        .finally(() => self.setState({ loading: false, pageLoading: false }));
    }
  }

  getDeviceById(id) {
    // filter the list to show a single device only
    var self = this;
    // do this via deviceauth not inventory
    return self.props
      .trySelectDevice(id, DeviceConstants.DEVICE_STATES.accepted)
      .catch(err => {
        if (err.res.statusCode === 404) {
          var errormsg = err.error || 'Please check your connection.';
          setRetryTimer(err, 'devices', `Device couldn't be loaded. ${errormsg}`, refreshDeviceLength, self.props.setSnackbar);
        }
      })
      .finally(() => self.setState({ loading: false, pageLoading: false }));
  }

  _handlePageChange(pageNo) {
    var self = this;
    self.setState({ pageLoading: true, pageNo: pageNo }, () => self._getDevices(true));
  }

  onCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.props.setSnackbar('');
  };

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

  render() {
    const self = this;
    const {
      allCount,
      devices,
      globalSettings,
      groupCount,
      groupFilters,
      highlightHelp,
      isEnterprise,
      loading,
      onGroupClick,
      onGroupRemoval,
      openSettingsDialog,
      selectedGroup,
      showHelptips
    } = self.props;
    const { selectedRows } = self.state;
    const columnHeaders = [
      {
        title: globalSettings.id_attribute || 'Device ID',
        name: 'device_id',
        customize: openSettingsDialog,
        style: { flexGrow: 1 }
      },
      {
        title: 'Device type',
        name: 'device_type',
        render: device => (device.attributes && device.attributes.device_type ? device.attributes.device_type : '-')
      },
      {
        title: 'Current software',
        name: 'current_software',
        render: device => (device.attributes && device.attributes.artifact_name ? device.attributes.artifact_name : '-')
      },
      {
        title: 'Last check-in',
        name: 'last_checkin',
        property: 'updated_ts',
        render: device => <RelativeTime updateTime={device.updated_ts} />
      },
      {
        title: '',
        name: 'status',
        render: device => <DeviceStatus device={device} />
      }
    ];

    const allowDeviceGroupRemoval = !isUngroupedGroup(selectedGroup);
    const group = isUngroupedGroup(selectedGroup) ? DeviceConstants.UNGROUPED_GROUP.name : selectedGroup;
    const groupLabel = group ? decodeURIComponent(group) : 'All devices';
    const pluralized = pluralize('devices', selectedRows.length);
    const addLabel = group ? `Move selected ${pluralized} to another group` : `Add selected ${pluralized} to a group`;
    const removeLabel = `Remove selected ${pluralized} from this group`;

    const anchor = { left: 200, top: 146 };
    let onboardingComponent = getOnboardingComponentFor('devices-accepted-onboarding', { anchor });
    onboardingComponent = getOnboardingComponentFor('deployments-past-completed', { anchor }, onboardingComponent);
    return (
      <div className="relative">
        <div className="flexbox space-between" style={{ marginLeft: '20px' }}>
          <div style={{ width: '100%' }}>
            <h2 className="inline-block margin-right">
              {
                <>
                  {groupLabel}
                  {isUngroupedGroup(group) && (
                    <Tooltip
                      title="Ungrouped devices are not currently members of a static group, but may still be part of a dynamic group"
                      arrow={true}
                      placement="top"
                      enterDelay={300}
                    >
                      <InfoIcon className="margin-left-small" fontSize="small" style={{ marginBottom: -3 }} />
                    </Tooltip>
                  )}
                </>
              }
            </h2>

            {(!selectedGroup || !!groupFilters.length) && (
              <Filters
                onFilterChange={() => self.setState({ pageNo: 1 }, () => self._getDevices(true))}
                onGroupClick={onGroupClick}
                isModification={!!groupFilters.length}
              />
            )}
          </div>
          {selectedGroup && allowDeviceGroupRemoval && (
            <div className="flexbox centered" style={{ marginTop: 5, minWidth: 240, alignSelf: 'flex-start' }}>
              {isEnterprise && !groupFilters.length && (
                <>
                  <p className="info flexbox centered" style={{ marginRight: 15 }}>
                    <LockOutlined fontSize="small" />
                    <span>Static</span>
                  </p>
                </>
              )}
              <Button onClick={onGroupRemoval} startIcon={<DeleteIcon />}>
                Remove group
              </Button>
            </div>
          )}
        </div>
        <Loader show={loading} />
        {devices.length > 0 && !loading ? (
          <div className="padding-bottom">
            <DeviceList
              {...self.props}
              {...self.state}
              columnHeaders={columnHeaders}
              onChangeRowsPerPage={pageLength => self.setState({ pageNo: 1, pageLength }, () => self._handlePageChange(1))}
              onPageChange={e => self._handlePageChange(e)}
              onSelect={selection => self.onRowSelection(selection)}
              pageTotal={groupCount}
              refreshDevices={() => self._getDevices()}
              selectDeviceById={id => self.getDeviceById(id)}
            />

            {showHelptips && devices.length ? (
              <div>
                <div
                  id="onboard-6"
                  className="tooltip help"
                  data-tip
                  data-for="expand-device-tip"
                  data-event="click focus"
                  style={{ left: 'inherit', right: '45px' }}
                >
                  <HelpIcon />
                </div>
                <ReactTooltip id="expand-device-tip" globalEventOff="click" place="left" type="light" effect="solid" className="react-tooltip">
                  <ExpandDevice />
                </ReactTooltip>
              </div>
            ) : null}
          </div>
        ) : (
          <div className={devices.length || loading ? 'hidden' : 'dashboard-placeholder'}>
            <p>No devices found</p>
            {!allCount ? <p>No devices have been authorized to connect to the Mender server yet.</p> : null}
            {highlightHelp && (
              <p>
                Visit the <Link to="/help/getting-started">Help section</Link> to learn how to connect devices to the Mender server.
              </p>
            )}
          </div>
        )}
        {onboardingComponent ? onboardingComponent : null}
        {!!selectedRows.length && (
          <div className="fixedButtons">
            <div className="float-right">
              <span className="margin-right">
                {selectedRows.length} {pluralize('devices', selectedRows.length)} selected
              </span>
              <Button
                variant="contained"
                disabled={!selectedRows.length}
                color="secondary"
                onClick={() => self.onAddDevicesToGroup(selectedRows)}
                startIcon={<AddCircleIcon />}
              >
                {addLabel}
              </Button>
              {allowDeviceGroupRemoval && group ? (
                <Button
                  variant="contained"
                  disabled={!selectedRows.length}
                  style={{ marginLeft: '4px' }}
                  onClick={() => self.onRemoveDevicesFromGroup(selectedRows)}
                  startIcon={<RemoveCircleOutlineIcon />}
                >
                  {removeLabel}
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    );
  }
}

const actionCreators = {
  getAllDevicesByStatus,
  getDevices,
  getDevicesByStatus,
  getGroupDevices,
  selectDevices,
  setDeviceFilters,
  setSnackbar,
  trySelectDevice
};

const mapStateToProps = state => {
  let devices = state.devices.selectedDeviceList.slice(0, DeviceConstants.DEVICE_LIST_MAXIMUM_LENGTH);
  let groupCount = state.devices.byStatus.accepted.total;
  let selectedGroup;
  let groupFilters = [];
  let groupDevices = [];
  if (!isEmpty(state.devices.groups.selectedGroup)) {
    selectedGroup = state.devices.groups.selectedGroup;
    groupCount = state.devices.groups.byId[selectedGroup].total;
    groupFilters = state.devices.groups.byId[selectedGroup].filters || [];
    groupDevices = state.devices.groups.byId[selectedGroup].deviceIds;
  } else if (!isEmpty(state.devices.selectedDevice)) {
    devices = [state.devices.selectedDevice];
  } else if (!devices.length && !state.devices.filters.length && state.devices.byStatus.accepted.total) {
    devices = state.devices.byStatus.accepted.deviceIds.slice(0, 20);
  }
  const ungroupedDevices = state.devices.groups.byId[DeviceConstants.UNGROUPED_GROUP.id]
    ? state.devices.groups.byId[DeviceConstants.UNGROUPED_GROUP.id].deviceIds
    : [];

  const plan = state.users.organization ? state.users.organization.plan : 'os';
  return {
    acceptedCount: state.devices.byStatus.accepted.total || 0,
    acceptedDevicesList: state.devices.byStatus.accepted.deviceIds.slice(0, 20),
    allCount: state.devices.byStatus.accepted.total + state.devices.byStatus.rejected.total || 0,
    deploymentDeviceLimit: state.deployments.deploymentDeviceLimit,
    devices,
    filters: state.devices.filters || [],
    globalSettings: state.users.globalSettings,
    groupCount,
    groupDevices,
    groupFilters,
    isEnterprise: state.app.features.isEnterprise || (state.app.features.isHosted && plan === 'enterprise'),
    onboardingComplete: state.users.onboarding.complete,
    selectedGroup,
    showHelptips: state.users.showHelptips,
    showTips: state.users.onboarding.showTips,
    ungroupedDevices
  };
};

export default connect(mapStateToProps, actionCreators)(Authorized);
