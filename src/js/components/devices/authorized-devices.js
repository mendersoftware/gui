import React from 'react';
import ReactTooltip from 'react-tooltip';
import Time from 'react-time';

import pluralize from 'pluralize';

// material ui
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';

import AddCircleIcon from '@material-ui/icons/AddCircle';
import HelpIcon from '@material-ui/icons/Help';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';

import { ExpandDevice } from '../helptips/helptooltips';
import { WelcomeSnackTip } from '../helptips/onboardingtips';

import Loader from '../common/loader';
import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';

import DeviceList from './devicelist';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';

export default class Authorized extends React.Component {
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
      if (AppStore.showHelptips() && !AppStore.getOnboardingComplete() && this.props.devices.length) {
        setTimeout(() => {
          AppActions.setSnackbar('open', 10000, '', <WelcomeSnackTip progress={2} />, () => {}, self.onCloseSnackbar);
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
    AppActions.setSnackbar('');
  };

  _sortColumn() {
    console.log('sort');
  }

  _getDevicesFromSelectedRows() {
    // use selected rows to get device from corresponding position in devices array
    var devices = [];
    for (var i = 0; i < this.state.selectedRows.length; i++) {
      devices.push(this.props.devices[this.state.selectedRows[i]]);
    }
    return devices;
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
    const { allCount, devices, group, groupCount, loading, onChangeRowsPerPage } = self.props;
    const { selectedRows } = self.state;
    const columnHeaders = [
      {
        title: (AppStore.getGlobalSettings() || {}).id_attribute || 'Device ID',
        name: 'device_id',
        customize: () => self.props.openSettingsDialog(),
        style: { flexGrow: 1 }
      },
      {
        title: 'Device type',
        name: 'device_type',
        render: device => {
          const found = (device.attributes || []).find(item => item.name === 'device_type');
          return found ? found.value : '-';
        }
      },
      {
        title: 'Current software',
        name: 'current_software',
        render: device => {
          const found = (device.attributes || []).find(item => item.name === 'artifact_name');
          return found ? found.value : '-';
        }
      },
      {
        title: 'Last checkin',
        name: 'last_checkin',
        property: 'updated_ts',
        render: device => (device.updated_ts ? <Time value={device.updated_ts} format="YYYY-MM-DD HH:mm" /> : '-')
      }
    ];
    const showHelptips = AppStore.showHelptips();

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

        {devices.length && !loading ? (
          <div>
            <div style={{ marginLeft: '20px' }}>
              <h2>{this.state.nameEdit ? groupNameInputs : <span>{groupLabel}</span>}</h2>
            </div>

            <div className="padding-bottom">
              <DeviceList
                {...self.props}
                columnHeaders={columnHeaders}
                selectedRows={selectedRows}
                onSelect={selection => self.onRowSelection(selection)}
                onChangeRowsPerPage={onChangeRowsPerPage}
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
