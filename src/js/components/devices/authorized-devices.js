import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import Time from 'react-time';

import pluralize from 'pluralize';

// material ui
import { Button, FormControl, FormHelperText, Input } from '@material-ui/core';

import { AddCircle as AddCircleIcon, Help as HelpIcon, RemoveCircleOutline as RemoveCircleOutlineIcon } from '@material-ui/icons';

import { ExpandDevice } from '../helptips/helptooltips';
import { WelcomeSnackTip } from '../helptips/onboardingtips';

import Loader from '../common/loader';
import { setSnackbar } from '../../actions/appActions';

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
      if (self.props.showHelptips && self.props.showTips && !self.props.onboardingComplete && this.props.devices.length) {
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

  _sortColumn() {
    console.log('sort');
  }

  _addToGroup() {
    this.props.addDevicesToGroup(this.state.selectedRows);
  }
  _removeFromGroup() {
    this.props.removeDevicesFromGroup(this.state.selectedRows);
  }

  _nameEdit() {
    if (this.state.nameEdit) {
      this._handleGroupNameSave();
    }
    this.setState({
      nameEdit: !this.state.nameEdit,
      errortext: null
    });
  }

  _handleGroupNameSave() {
    // to props - function to get all devices from group, update group one by one
  }

  _handleGroupNameChange(event) {
    this.setState({ textfield: event.target.value });
  }

  onRowSelection(selection) {
    this.setState({ selectedRows: selection });
  }

  render() {
    const self = this;
    const { allCount, devices, globalSettings, group, groupCount, highlightHelp, loading, showHelptips } = self.props;
    const { selectedRows } = self.state;
    const columnHeaders = [
      {
        title: globalSettings.id_attribute || 'Device ID',
        name: 'device_id',
        customize: () => self.props.openSettingsDialog(),
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
        render: device => (device.updated_ts ? <Time value={device.updated_ts} format="YYYY-MM-DD HH:mm" /> : '-')
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

    var groupNameInputs = this.state.nameEdit ? (
      <FormControl error={Boolean(self.state.errortext)} style={{ marginTop: 0 }}>
        <Input
          id="groupNameInput"
          className="hoverText"
          value={self.state.textfield}
          style={{ marginTop: '5px' }}
          underlinefocusstyle={{ borderColor: '#e0e0e0' }}
          onChange={e => this._handleGroupNameChange(e)}
          onKeyDown={() => this._handleGroupNameSave()}
          type="text"
        />
        <FormHelperText>{self.state.errortext}</FormHelperText>
      </FormControl>
    ) : null;

    const anchor = { left: 200, top: 146 };
    let onboardingComponent = getOnboardingComponentFor('devices-accepted-onboarding', { anchor });
    onboardingComponent = getOnboardingComponentFor('deployments-past-completed', { anchor }, onboardingComponent);
    return (
      <div className="relative">
        <Loader show={loading} />

        {devices.length > 0 && !loading ? (
          <div>
            <div style={{ marginLeft: '20px' }}>
              <h2>{this.state.nameEdit ? groupNameInputs : <span>{groupLabel}</span>}</h2>
            </div>

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
                <Button variant="contained" disabled={!selectedRows.length} color="secondary" onClick={() => this._addToGroup()}>
                  <AddCircleIcon className="buttonLabelIcon" />
                  {addLabel}
                </Button>
                {this.props.allowDeviceGroupRemoval && this.props.group ? (
                  <Button variant="contained" disabled={!selectedRows.length} style={{ marginLeft: '4px' }} onClick={() => this._removeFromGroup()}>
                    <RemoveCircleOutlineIcon className="buttonLabelIcon" />
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
    onboardingComplete: state.users.onboarding.complete,
    showTips: state.users.onboarding.showTips,
    globalSettings: state.users.globalSettings,
    showHelptips: state.users.showHelptips
  };
};

export default connect(mapStateToProps, actionCreators)(Authorized);
