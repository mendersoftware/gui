import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import pluralize from 'pluralize';

// material ui
import { Button, SvgIcon } from '@material-ui/core';
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@material-ui/lab';

import {
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  Help as HelpIcon,
  HeightOutlined as HeightOutlinedIcon,
  HighlightOffOutlined as HighlightOffOutlinedIcon,
  LockOutlined
} from '@material-ui/icons';
import { mdiTrashCanOutline as TrashCan } from '@mdi/js';

import { getDevicesByStatus, getGroupDevices, selectDevices, setDeviceFilters, trySelectDevice, updateDevicesAuth } from '../../actions/deviceActions';
import { setSnackbar } from '../../actions/appActions';
import { DEVICE_LIST_MAXIMUM_LENGTH, DEVICE_STATES } from '../../constants/deviceConstants';
import { filtersCompare, isEmpty } from '../../helpers';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import { clearAllRetryTimers, setRetryTimer } from '../../utils/retrytimer';
import Loader from '../common/loader';
import RelativeTime from '../common/relative-time';
import { ExpandDevice } from '../helptips/helptooltips';
import { WelcomeSnackTip } from '../helptips/onboardingtips';
import DeviceList from './devicelist';
import DeviceStatus from './device-status';
import { refreshLength as refreshDeviceLength } from './devices';
import Filters from './filters';

export class Authorized extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      pageNo: 1,
      pageLength: 20,
      selectedRows: [],
      showActions: false,
      tmpDevices: []
    };
  }

  componentDidMount() {
    const self = this;
    self.props.setDeviceFilters([]);
    self.setState({ selectedRows: [], expandRow: null });
    if (!this.props.acceptedDevicesList.length && this.props.acceptedCount < this.props.deploymentDeviceLimit) {
      this.props.getDevicesByStatus(DEVICE_STATES.accepted);
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
    const self = this;
    if (
      prevProps.allCount !== self.props.allCount ||
      prevProps.selectedGroup !== self.props.selectedGroup ||
      prevProps.devices.length !== self.props.devices.length ||
      prevProps.groupCount !== self.props.groupCount ||
      filtersCompare(prevProps.filters, self.props.filters)
    ) {
      var newState = { selectedRows: [], expandRow: null, allRowsSelected: false };
      if (prevProps.selectedGroup != self.props.selectedGroup) {
        newState = { pageNo: 1, ...newState };
      }
      self.setState(newState);
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
    const { filters, getDevicesByStatus, getGroupDevices, selectedGroup, setSnackbar } = self.props;
    const { pageLength, pageNo } = self.state;
    let request;
    // if a group is selected, use getGroupDevices
    if (selectedGroup) {
      request = getGroupDevices(selectedGroup, pageNo, pageLength, true);
    } else {
      // otherwise, get accepted devices from the inventory, eventually applying filters
      const hasFilters = filters.length && filters[0].value;
      request = getDevicesByStatus(DEVICE_STATES.accepted, pageNo, pageLength, shouldUpdate || hasFilters);
    }
    request
      .catch(err => {
        console.log(err);
        const errormsg = err.error || 'Please check your connection.';
        setRetryTimer(err, 'devices', `Devices couldn't be loaded. ${errormsg}`, refreshDeviceLength, setSnackbar);
      })
      // only set state after all devices id data retrieved
      .finally(() => self.setState({ loading: false, pageLoading: false }));
  }

  getDeviceById(id) {
    // filter the list to show a single device only
    var self = this;
    // do this via deviceauth not inventory
    return self.props
      .trySelectDevice(id, DEVICE_STATES.accepted)
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

  onRejectDevices(rows) {
    var self = this;
    self.setState({ loading: true });
    const deviceIds = rows.map(row => self.props.devices[row]);
    return self.props.updateDevicesAuth(deviceIds, DEVICE_STATES.rejected).then(() => self.setState({ selectedRows: [], loading: false }));
  }

  render() {
    const self = this;
    const {
      allCount,
      devices,
      groupCount,
      groupFilters,
      highlightHelp,
      idAttribute,
      isEnterprise,
      onGroupClick,
      onGroupRemoval,
      openSettingsDialog,
      selectedGroup,
      showHelptips
    } = self.props;
    const { loading, selectedRows, showActions } = self.state;
    const columnHeaders = [
      {
        title: idAttribute || 'Device ID',
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

    const groupLabel = selectedGroup ? decodeURIComponent(selectedGroup) : 'All devices';
    const pluralized = pluralize('devices', selectedRows.length);
    let actions = [{ icon: <HighlightOffOutlinedIcon />, title: `Reject ${pluralized}`, action: () => self.onRejectDevices(selectedRows) }];
    if (selectedGroup) {
      actions.push(
        {
          icon: <HeightOutlinedIcon className="rotated ninety" />,
          title: `Move selected ${pluralized} to another group`,
          action: () => self.onAddDevicesToGroup(selectedRows)
        },
        {
          icon: (
            <SvgIcon fontSize="inherit">
              <path d={TrashCan} />
            </SvgIcon>
          ),
          title: `Remove selected ${pluralized} from this group`,
          action: () => self.onRemoveDevicesFromGroup(selectedRows)
        }
      );
    } else {
      actions.push({ icon: <AddCircleIcon />, title: `Add selected ${pluralized} to a group`, action: () => self.onAddDevicesToGroup(selectedRows) });
    }

    const anchor = { left: 200, top: 146 };
    let onboardingComponent = getOnboardingComponentFor('devices-accepted-onboarding', { anchor });
    onboardingComponent = getOnboardingComponentFor('deployments-past-completed', { anchor }, onboardingComponent);
    return (
      <div className="relative">
        <div className="flexbox space-between" style={{ marginLeft: '20px' }}>
          <div style={{ width: '100%' }}>
            <h2 className="inline-block margin-right">{groupLabel}</h2>

            {(!selectedGroup || !!groupFilters.length) && (
              <Filters
                onFilterChange={() => self.setState({ pageNo: 1 }, () => self._getDevices(true))}
                onGroupClick={onGroupClick}
                isModification={!!groupFilters.length}
              />
            )}
          </div>
          {selectedGroup && (
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
              refreshDevices={shouldUpdate => self._getDevices(shouldUpdate)}
              selectDeviceById={id => self.getDeviceById(id)}
            />
            {showHelptips && devices.length && (
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
            )}
          </div>
        ) : (
          !loading && (
            <div className="dashboard-placeholder">
              <p>No devices found</p>
              {!allCount ? <p>No devices have been authorized to connect to the Mender server yet.</p> : null}
              {highlightHelp && (
                <p>
                  Visit the <Link to="/help/getting-started">Help section</Link> to learn how to connect devices to the Mender server.
                </p>
              )}
            </div>
          )
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
                <SpeedDialAction key={action.title} icon={action.icon} tooltipTitle={action.title} tooltipOpen onClick={action.action} />
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
  trySelectDevice,
  updateDevicesAuth
};

const mapStateToProps = state => {
  let devices = state.devices.selectedDeviceList.slice(0, DEVICE_LIST_MAXIMUM_LENGTH);
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
  const plan = state.users.organization ? state.users.organization.plan : 'os';
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
    idAttribute: state.users.globalSettings.id_attribute,
    isEnterprise: state.app.features.isEnterprise || (state.app.features.isHosted && plan === 'enterprise'),
    onboardingComplete: state.users.onboarding.complete,
    selectedGroup,
    showHelptips: state.users.showHelptips,
    showTips: state.users.onboarding.showTips
  };
};

export default connect(mapStateToProps, actionCreators)(Authorized);
