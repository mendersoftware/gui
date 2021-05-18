import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
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
import { advanceOnboarding } from '../../actions/onboardingActions';
import { DEVICE_LIST_MAXIMUM_LENGTH, DEVICE_STATES } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getIdAttribute, getLimitMaxed, getOnboardingState } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import Loader from '../common/loader';
import DeviceList from './devicelist';
import { refreshLength as refreshDeviceLength } from './devices';
import Filters from './filters';
import BaseDevices, { DeviceCreationTime, DeviceExpansion, DeviceStatusHeading, RelativeDeviceTime } from './base-devices';

const defaultHeaders = [
  {
    title: 'First request',
    attribute: { name: 'created_ts', scope: 'system' },
    render: DeviceCreationTime,
    sortable: true
  },
  {
    title: 'Last check-in',
    attribute: { name: 'updated_ts', scope: 'system' },
    render: RelativeDeviceTime,
    sortable: true
  },
  {
    title: 'Status',
    attribute: { name: 'status', scope: 'identity' },
    render: DeviceStatusHeading,
    sortable: true
  },
  {
    title: '',
    attribute: {},
    render: DeviceExpansion,
    sortable: false
  }
];

export class Pending extends BaseDevices {
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
  }

  handleResize() {
    setTimeout(() => {
      this.setState({ height: window.innerHeight, width: window.innerWidth });
    }, 500);
  }

  componentDidMount() {
    this.props.selectGroup();
    this.props.setDeviceFilters([]);
    this.timer = setInterval(() => this._getDevices(), refreshDeviceLength);
    this._getDevices(true);
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  componentDidUpdate(prevProps) {
    if (prevProps.count !== this.props.count) {
      this.props.setDeviceFilters([]);
      this._getDevices(true);
      if (!this.props.onboardingState.complete) {
        this.props.advanceOnboarding(onboardingSteps.DEVICES_PENDING_ONBOARDING_START);
      }
    }
    const self = this;
    if (!self.props.devices.length && self.props.count && self.state.pageNo !== 1) {
      //if devices empty but count not, put back to first page
      self._handlePageChange(1);
    }
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
      .finally(() => self.setState({ pageLoading: false, authLoading: null }));
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
    if (!this.props.onboardingState.complete) {
      this.props.advanceOnboarding(onboardingSteps.DEVICES_PENDING_ACCEPTING_ONBOARDING);
    }
    this.setState({ selectedRows: selection });
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
      highlightHelp,
      idAttribute,
      limitMaxed,
      onboardingState,
      openSettingsDialog,
      showHelptips
    } = self.props;
    const { authLoading, pageLoading, selectedRows, showActions, showFilters } = self.state;
    const limitNear = deviceLimit ? deviceLimit < acceptedDevices + devices.length : false;
    const selectedOverLimit = deviceLimit ? deviceLimit < acceptedDevices + selectedRows.length : false;

    const columnHeaders = [
      {
        title: idAttribute,
        customize: openSettingsDialog,
        attribute: { name: idAttribute, scope: 'identity' },
        sortable: true
      },
      ...defaultHeaders
    ];

    var deviceLimitWarning =
      limitMaxed || limitNear ? (
        <p className="warning">
          <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
          {limitMaxed ? <span>You have reached</span> : null}
          {limitNear && !limitMaxed ? <span>You are nearing</span> : null} your limit of authorized devices: {acceptedDevices} of {deviceLimit}
        </p>
      ) : null;

    const devicePendingTip = getOnboardingComponentFor(onboardingSteps.DEVICES_PENDING_ONBOARDING_START, onboardingState);
    let onboardingComponent = null;
    if (showHelptips && !onboardingState.complete) {
      if (self.deviceListRef) {
        const element = self.deviceListRef.getElementsByClassName('body')[0];
        onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEVICES_PENDING_ONBOARDING, onboardingState, {
          anchor: { left: 200, top: element ? element.offsetTop + element.offsetHeight : 170 }
        });
      }
      if (selectedRows && self.authorizeRef) {
        const anchor = {
          left: self.authorizeRef.offsetParent.offsetLeft - self.authorizeRef.firstElementChild.offsetWidth,
          top: self.authorizeRef.offsetParent.offsetTop + self.authorizeRef.firstElementChild.offsetHeight - 15
        };
        onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEVICES_PENDING_ACCEPTING_ONBOARDING, onboardingState, { place: 'left', anchor });
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
        key: 'reject',
        title: `Reject ${pluralized}`,
        action: () => self.onAuthorizationChange(selectedRows, DEVICE_STATES.rejected)
      },
      {
        icon: <CheckCircleIcon className="green" />,
        key: 'accept',
        title: `Accept ${pluralized}`,
        action: () => self.onAuthorizationChange(selectedRows, DEVICE_STATES.accepted)
      }
    ];

    return (
      <div className="tab-container flexbox column">
        {!!count && (
          <>
            <div className="flexbox filter-header">
              <h2 className="margin-right">Pending devices</h2>
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
          <div className="padding-bottom" ref={ref => (self.deviceListRef = ref)}>
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
            {devicePendingTip ? (
              devicePendingTip
            ) : (
              <div className={authLoading ? 'hidden' : 'dashboard-placeholder'}>
                <p>
                  {filters.length
                    ? `There are no pending devices matching the selected ${pluralize('filters', filters.length)}`
                    : 'There are no devices pending authorization'}
                </p>
                {highlightHelp ? (
                  <p>
                    Visit the <Link to="/help/get-started">Help section</Link> to learn how to connect devices to the Mender server.
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
              ref={ref => (self.authorizeRef = ref)}
              open={showActions}
            >
              {actions.map(action => (
                <SpeedDialAction key={action.key} aria-label={action.key} icon={action.icon} tooltipTitle={action.title} tooltipOpen onClick={action.action} />
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

const actionCreators = { advanceOnboarding, getDevicesByStatus, selectGroup, setDeviceFilters, updateDevicesAuth };

const mapStateToProps = state => {
  return {
    acceptedDevices: state.devices.byStatus.accepted.total || 0,
    count: state.devices.byStatus.pending.total,
    devices: state.devices.selectedDeviceList.slice(0, DEVICE_LIST_MAXIMUM_LENGTH),
    deviceLimit: state.devices.limit,
    limitMaxed: getLimitMaxed(state),
    filters: state.devices.filters || [],
    highlightHelp: !state.devices.byStatus.accepted.total,
    idAttribute: getIdAttribute(state),
    onboardingState: getOnboardingState(state),
    pendingDeviceIds: state.devices.byStatus.pending.deviceIds,
    showHelptips: state.users.showHelptips,
    showOnboardingTips: state.onboarding.showTips
  };
};

export default connect(mapStateToProps, actionCreators)(Pending);
