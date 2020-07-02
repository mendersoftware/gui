import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import Time from 'react-time';
import pluralize from 'pluralize';

// material ui
import { Button } from '@material-ui/core';
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@material-ui/lab';
import {
  CheckCircle as CheckCircleIcon,
  FilterList as FilterListIcon,
  InfoOutlined as InfoIcon,
  HighlightOffOutlined as HighlightOffOutlinedIcon
} from '@material-ui/icons';

import { getDevicesByStatus, selectGroup, setDeviceFilters, updateDevicesAuth } from '../../actions/deviceActions';
import { setSnackbar } from '../../actions/appActions';
import { DEVICE_LIST_MAXIMUM_LENGTH, DEVICE_STATES } from '../../constants/deviceConstants';
import { getOnboardingComponentFor, advanceOnboarding, getOnboardingStepCompleted } from '../../utils/onboardingmanager';
import Loader from '../common/loader';
import RelativeTime from '../common/relative-time';
import { DevicePendingTip } from '../helptips/onboardingtips';
import DeviceList from './devicelist';
import { refreshLength as refreshDeviceLength } from './devices';
import Filters from './filters';

export class Pending extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      authLoading: 'all',
      pageLength: 20,
      pageLoading: true,
      pageNo: 1,
      selectedRows: [],
      showActions: false,
      sortCol: null,
      sortDown: true,
      sortScope: null
    };
    if (!props.pendingDeviceIds.length) {
      props.getDevicesByStatus(DEVICE_STATES.pending);
    }
  }

  componentDidMount() {
    this.props.selectGroup();
    this.props.setDeviceFilters([]);
    this.timer = setInterval(() => this._getDevices(), refreshDeviceLength);
    this._getDevices(true);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.count !== this.props.count) {
      this.props.setDeviceFilters([]);
      this._getDevices();
    }
    const self = this;
    if (!self.props.devices.length && self.props.count && self.state.pageNo !== 1) {
      //if devices empty but count not, put back to first page
      self._handlePageChange(1);
    }
  }

  shouldComponentUpdate(nextProps) {
    return (
      !this.props.devices.every((device, index) => device === nextProps.devices[index]) ||
      this.props.globalSettings.id_attribute !== nextProps.globalSettings.id_attribute ||
      true
    );
  }

  /*
   * Devices to show
   */
  _getDevices(shouldUpdate = false) {
    const self = this;
    const { pageNo, pageLength, sortCol, sortDown, sortScope } = self.state;
    const sortBy = sortCol ? [{ attribute: sortCol, order: sortDown ? 'desc' : 'asc', scope: sortScope }] : undefined;
    self.props
      .getDevicesByStatus(DEVICE_STATES.pending, pageNo, pageLength, shouldUpdate, undefined, sortBy)
      .catch(error => {
        console.log(error);
        var errormsg = error.error || 'Please check your connection.';
        self.props.setSnackbar(errormsg, 5000, '');
        console.log(errormsg);
      })
      .finally(() => self.setState({ pageLoading: false, authLoading: null }));
  }

  _handlePageChange(pageNo) {
    var self = this;
    self.setState({ selectedRows: [], currentPage: pageNo, pageLoading: true, expandRow: null, pageNo: pageNo }, () => self._getDevices(true));
  }

  onAuthorizationChange(rows, status) {
    var self = this;
    self.setState({ authLoading: true });
    // for each device, get id and id of authset & make api call to accept
    // if >1 authset, skip instead
    const deviceIds = rows.map(row => self.props.devices[row]);
    return self.props.updateDevicesAuth(deviceIds, status).then(() => {
      // refresh devices by calling function in parent
      self.props.restart();
      self.setState({ selectedRows: [], authLoading: false });
    });
  }

  onRowSelection(selection) {
    if (!this.props.onboardingComplete) {
      advanceOnboarding('devices-pending-accepting-onboarding');
    }
    this.setState({ selectedRows: selection });
  }

  onSortChange(attribute) {
    const self = this;
    let state = { sortCol: attribute.name, sortDown: !self.state.sortDown, sortScope: attribute.scope };
    if (attribute.name !== self.state.sortCol) {
      state.sortDown = true;
    }
    self.setState(state, () => self._getDevices(true));
  }

  render() {
    const self = this;
    const {
      acceptedDevices,
      count,
      devices,
      deviceLimit,
      disabled,
      filters,
      globalSettings,
      highlightHelp,
      onboardingComplete,
      openSettingsDialog,
      showHelptips,
      showOnboardingTips
    } = self.props;
    const { authLoading, pageLoading, selectedRows, showActions, showFilters } = self.state;
    const limitMaxed = deviceLimit ? deviceLimit <= acceptedDevices : false;
    const limitNear = deviceLimit ? deviceLimit < acceptedDevices + devices.length : false;
    const selectedOverLimit = deviceLimit ? deviceLimit < acceptedDevices + selectedRows.length : false;

    const columnHeaders = [
      {
        title: globalSettings.id_attribute || 'Device ID',
        customize: openSettingsDialog,
        attribute: { name: globalSettings.id_attribute, scope: 'identity' },
        style: { flexGrow: 1 },
        sortable: !!globalSettings.id_attribute && globalSettings.id_attribute !== 'Device ID'
      },
      {
        title: 'First request',
        attribute: { name: 'created_ts', scope: 'system' },
        render: device => (device.created_ts ? <Time value={device.created_ts} format="YYYY-MM-DD HH:mm" /> : '-'),
        sortable: true
      },
      {
        title: 'Last check-in',
        attribute: { name: 'updated_ts', scope: 'system' },
        render: device => <RelativeTime updateTime={device.updated_ts} />,
        sortable: true
      },
      {
        title: 'Status',
        attribute: { name: 'status', scope: 'identity' },
        render: device => (device.status ? <div className="capitalized">{device.status}</div> : '-'),
        sortable: true
      }
    ];

    var deviceLimitWarning =
      limitMaxed || limitNear ? (
        <p className="warning">
          <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
          {limitMaxed ? <span>You have reached</span> : null}
          {limitNear && !limitMaxed ? <span>You are nearing</span> : null} your limit of authorized devices: {acceptedDevices} of {deviceLimit}
        </p>
      ) : null;

    const deviceConnectingProgressed = getOnboardingStepCompleted('devices-pending-onboarding');
    let onboardingComponent = null;
    if (showHelptips && !onboardingComplete) {
      if (this.deviceListRef) {
        const element = this.deviceListRef ? this.deviceListRef.getElementsByClassName('body')[0] : null;
        onboardingComponent = getOnboardingComponentFor('devices-pending-onboarding', {
          anchor: { left: 200, top: element ? element.offsetTop + element.offsetHeight : 170 }
        });
      }
      if (selectedRows && this.authorizeRef) {
        const anchor = {
          left: this.authorizeRef.offsetParent.offsetLeft - this.authorizeRef.firstElementChild.offsetWidth,
          top: this.authorizeRef.offsetParent.offsetTop + this.authorizeRef.firstElementChild.offsetHeight - 15
        };
        onboardingComponent = getOnboardingComponentFor('devices-pending-accepting-onboarding', { place: 'left', anchor });
      }
      if (acceptedDevices && !window.sessionStorage.getItem('pendings-redirect')) {
        window.sessionStorage.setItem('pendings-redirect', true);
        return <Redirect to="/devices" />;
      }
    }

    const pluralized = pluralize('devices', selectedRows.length);
    const actions = [
      {
        icon: <HighlightOffOutlinedIcon className="red" />,
        title: `Reject ${pluralized}`,
        action: () => self.onAuthorizationChange(selectedRows, DEVICE_STATES.rejected)
      },
      {
        icon: <CheckCircleIcon className="green" />,
        title: `Accept ${pluralized}`,
        action: () => self.onAuthorizationChange(selectedRows, DEVICE_STATES.accepted)
      }
    ];

    return (
      <div className="tab-container">
        {!!count && (
          <>
            <div className="flexbox" style={{ zIndex: 2, marginBottom: -1 }}>
              <h2 className="margin-right">Pending devices</h2>
              <div className={`flexbox centered ${showFilters ? 'filter-toggle' : ''}`}>
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
            </div>
            <Filters identityOnly={true} onFilterChange={() => self.setState({ pageNo: 1 }, () => self._getDevices(true))} open={showFilters} />
            {authLoading !== 'all' && (
              <p className="info">
                Showing {devices.length} of {count} {pluralize('devices', count)} pending authorization
              </p>
            )}
          </>
        )}
        <Loader show={authLoading} />
        {devices.length && (!pageLoading || authLoading !== 'all') ? (
          <div className="padding-bottom" ref={ref => (this.deviceListRef = ref)}>
            {deviceLimitWarning}
            <DeviceList
              {...self.props}
              {...self.state}
              className="pending"
              columnHeaders={columnHeaders}
              limitMaxed={limitMaxed}
              onChangeRowsPerPage={pageLength => self.setState({ pageNo: 1, pageLength }, () => self._handlePageChange(1))}
              onPageChange={e => self._handlePageChange(e)}
              onSelect={selection => self.onRowSelection(selection)}
              onSort={attribute => self.onSortChange(attribute)}
              pageTotal={count}
              refreshDevices={shouldUpdate => self._getDevices(shouldUpdate)}
            />
          </div>
        ) : (
          <div>
            {showHelptips && showOnboardingTips && !onboardingComplete && !deviceConnectingProgressed ? (
              <DevicePendingTip />
            ) : (
              <div className={authLoading ? 'hidden' : 'dashboard-placeholder'}>
                <p>
                  {filters.length
                    ? `There are no pending devices matching the selected ${pluralize('filters', filters.length)}`
                    : 'There are no devices pending authorization'}
                </p>
                {highlightHelp ? (
                  <p>
                    Visit the <Link to="/help/getting-started">Help section</Link> to learn how to connect devices to the Mender server.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        )}

        {!!selectedRows.length && (
          <div className="flexbox fixedButtons">
            <div className="margin-right">
              {authLoading && <Loader style={{ width: '100px', top: '7px', position: 'relative' }} table={true} waiting={true} show={true} />}
              {selectedRows.length} {pluralize('devices', selectedRows.length)} selected
            </div>
            <SpeedDial
              ariaLabel="device-actions"
              className="margin-small"
              icon={<SpeedDialIcon />}
              disabled={disabled || limitMaxed || selectedOverLimit}
              onClose={() => self.setState({ showActions: false })}
              onOpen={() => self.setState({ showActions: true })}
              ref={ref => (this.authorizeRef = ref)}
              open={showActions}
            >
              {actions.map(action => (
                <SpeedDialAction key={action.title} icon={action.icon} tooltipTitle={action.title} tooltipOpen onClick={action.action} />
              ))}
            </SpeedDial>
            {deviceLimitWarning}
          </div>
        )}
        {onboardingComponent ? onboardingComponent : null}
      </div>
    );
  }
}

const actionCreators = { getDevicesByStatus, selectGroup, setDeviceFilters, setSnackbar, updateDevicesAuth };

const mapStateToProps = state => {
  return {
    acceptedDevices: state.devices.byStatus.accepted.total || 0,
    count: state.devices.byStatus.pending.total,
    devices: state.devices.selectedDeviceList.slice(0, DEVICE_LIST_MAXIMUM_LENGTH),
    deviceLimit: state.devices.limit,
    filters: state.devices.filters || [],
    globalSettings: state.users.globalSettings,
    highlightHelp: !state.devices.byStatus.accepted.total,
    onboardingComplete: state.users.onboarding.complete,
    pendingDeviceIds: state.devices.byStatus.pending.deviceIds,
    showHelptips: state.users.showHelptips,
    showOnboardingTips: state.users.onboarding.showTips
  };
};

export default connect(mapStateToProps, actionCreators)(Pending);
