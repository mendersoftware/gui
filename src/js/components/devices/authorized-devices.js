import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import pluralize from 'pluralize';

// material ui
import { Button } from '@material-ui/core';

import { AddCircle as AddCircleIcon, Help as HelpIcon, RemoveCircleOutline as RemoveCircleOutlineIcon } from '@material-ui/icons';

import { ExpandDevice } from '../helptips/helptooltips';
import { WelcomeSnackTip } from '../helptips/onboardingtips';

import Loader from '../common/loader';
import RelativeTime from '../common/relative-time';
import { setSnackbar } from '../../actions/appActions';

import Filters from './filters';
import DeviceList from './devicelist';
import DeviceStatus from './device-status';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';

export class Authorized extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      divHeight: 208,
      selectedRows: [],
      textfield: this.props.group ? decodeURIComponent(this.props.group) : 'All devices'
    };
  }

  componentDidUpdate(prevProps) {
    var self = this;
    if (
      prevProps.allCount !== this.props.allCount ||
      prevProps.group !== this.props.group ||
      prevProps.devices.length !== this.props.devices.length ||
      prevProps.groupCount !== this.props.groupCount ||
      prevProps.pageNo !== this.props.pageNo
    ) {
      self.setState({ selectedRows: [], expandRow: null, allRowsSelected: false });
      if (self.props.showHelptips && self.props.showTips && !self.props.onboardingComplete && this.props.acceptedCount && this.props.acceptedCount < 2) {
        setTimeout(() => {
          self.props.setSnackbar('open', 10000, '', <WelcomeSnackTip progress={2} />, () => {}, self.onCloseSnackbar);
        }, 400);
      }
    }

    if (prevProps.currentTab !== this.props.currentTab && this.props.currentTab === 'Device groups') {
      this.setState({ selectedRows: [], expandRow: null });
    }

    if (prevProps.group !== this.props.group) {
      this.setState({ textfield: this.props.group ? decodeURIComponent(this.props.group) : 'All devices' });
    }
  }

  onCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.props.setSnackbar('');
  };

  _handleGroupNameChange(event) {
    this.setState({ textfield: event.target.value });
  }

  onRowSelection(selection) {
    this.setState({ selectedRows: selection });
  }

  render() {
    const self = this;
    const {
      addDevicesToGroup,
      allCount,
      allowDeviceGroupRemoval,
      devices,
      globalSettings,
      group,
      groupCount,
      highlightHelp,
      loading,
      onFilterChange,
      openSettingsDialog,
      refreshDevices,
      removeDevicesFromGroup,
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

    var pluralized = pluralize('devices', selectedRows.length);

    var addLabel = group ? `Move selected ${pluralized} to another group` : `Add selected ${pluralized} to a group`;
    var removeLabel = `Remove selected ${pluralized} from this group`;
    var groupLabel = group ? decodeURIComponent(group) : 'All devices';

    const anchor = { left: 200, top: 146 };
    let onboardingComponent = getOnboardingComponentFor('devices-accepted-onboarding', { anchor });
    onboardingComponent = getOnboardingComponentFor('deployments-past-completed', { anchor }, onboardingComponent);
    return (
      <div className="relative">
        <div style={{ marginLeft: '20px' }}>
          <h2 className="inline-block margin-right">{groupLabel}</h2>
          {!selectedGroup && <Filters onFilterChange={onFilterChange} refreshDevices={refreshDevices} />}
        </div>
        <Loader show={loading} />
        {devices.length > 0 && !loading ? (
          <div className="padding-bottom">
            <DeviceList
              {...self.props}
              columnHeaders={columnHeaders}
              filterable={true}
              selectedRows={selectedRows}
              onSelect={selection => self.onRowSelection(selection)}
              pageTotal={groupCount}
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
        <div>
          {selectedRows.length ? (
            <div className="fixedButtons">
              <div className="float-right">
                <span className="margin-right">
                  {selectedRows.length} {pluralize('devices', selectedRows.length)} selected
                </span>
                <Button
                  variant="contained"
                  disabled={!selectedRows.length}
                  color="secondary"
                  onClick={() => addDevicesToGroup(selectedRows)}
                  startIcon={<AddCircleIcon />}
                >
                  {addLabel}
                </Button>
                {allowDeviceGroupRemoval && group ? (
                  <Button
                    variant="contained"
                    disabled={!selectedRows.length}
                    style={{ marginLeft: '4px' }}
                    onClick={() => removeDevicesFromGroup(selectedRows)}
                    startIcon={<RemoveCircleOutlineIcon />}
                  >
                    {removeLabel}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

const actionCreators = { setSnackbar };

const mapStateToProps = state => {
  return {
    globalSettings: state.users.globalSettings,
    onboardingComplete: state.users.onboarding.complete,
    selectedGroup: state.devices.groups.selectedGroup,
    showTips: state.users.onboarding.showTips,
    showHelptips: state.users.showHelptips
  };
};

export default connect(mapStateToProps, actionCreators)(Authorized);
