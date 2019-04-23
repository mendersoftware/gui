import React from 'react';
import ReactTooltip from 'react-tooltip';

import pluralize from 'pluralize';

// material ui
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';

import AddCircleIcon from '@material-ui/icons/AddCircle';
import HelpIcon from '@material-ui/icons/Help';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import SettingsIcon from '@material-ui/icons/Settings';
import SortIcon from '@material-ui/icons/Sort';

import { ExpandDevice } from '../helptips/helptooltips';
import Loader from '../common/loader';
import AppActions from '../../actions/app-actions';
import DeviceListItem from './devicelistitem';
import AppStore from '../../stores/app-store';

export default class Authorized extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      divHeight: 208,
      selectedRows: [],
      textfield: this.props.group ? decodeURIComponent(this.props.group) : 'All devices',
      showKey: false
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
    }

    if (prevProps.currentTab !== this.props.currentTab && this.props.currentTab === 'Device groups') {
      this.setState({ selectedRows: [], expandRow: null });
    }

    if (prevProps.group !== this.props.group) {
      this.setState({ textfield: this.props.group ? decodeURIComponent(this.props.group) : 'All devices' });
    }
  }

  _sortColumn() {
    console.log('sort');
  }

  _expandRow(event, rowNumber) {
    const self = this;
    if (event.target.closest('input') && event.target.closest('input').hasOwnProperty('checked')) {
      return;
    }
    AppActions.setSnackbar('');
    if (self.state.expandRow === rowNumber) {
      rowNumber = null;
    }
    self.setState({ expandRow: rowNumber });
  }

  _isSelected(index) {
    return this.state.selectedRows.indexOf(index) !== -1;
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

  _showKey() {
    var self = this;
    self.setState({ showKey: !self.state.showKey });
  }

  _onRowSelection(selectedRow) {
    const self = this;
    const { selectedRows } = self.state;
    const selectedIndex = selectedRows.indexOf(selectedRow);
    let updatedSelection = [];
    if (selectedIndex === -1) {
      updatedSelection = updatedSelection.concat(selectedRows, selectedRow);
    } else {
      selectedRows.splice(selectedIndex, 1);
      updatedSelection = selectedRows;
    }
    self.setState({ selectedRows: updatedSelection });
  }

  onSelectAllClick() {
    const self = this;
    let selectedRows = Array.apply(null, { length: this.props.devices.length }).map(Number.call, Number);
    if (self.state.selectedRows.length && self.state.selectedRows.length <= self.props.devices.length) {
      selectedRows = [];
    }
    self.setState({ selectedRows });
  }

  render() {
    const self = this;
    const { allCount, artifacts, devices, group, groups, loading, openSettingsDialog, pause, redirect } = self.props;
    const showHelptips = AppStore.showHelptips();
    const globalSettings = AppStore.getGlobalSettings();

    const columnHeaders = [
      { title: (globalSettings || {}).id_attribute || 'Device ID', name: 'device_id', sortable: false, customize: () => openSettingsDialog() },
      { title: 'Device type', name: 'device_type', sortable: false },
      { title: 'Current software', name: 'current_software', sortable: false },
      { title: 'Last updated', name: 'last_updated', sortable: false }
    ];
    const columnWidth = `${100 / columnHeaders.length}%`;

    var pluralized = pluralize('devices', this.state.selectedRows.length);

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

    const numSelected = self.state.selectedRows.length;

    return (
      <div className="relative">
        <Loader show={loading} />

        {devices.length && !loading ? (
          <div>
            <div style={{ marginLeft: '20px' }}>
              <h2>{this.state.nameEdit ? groupNameInputs : <span>{groupLabel}</span>}</h2>
            </div>

            <div className="padding-bottom">
              <div>
                <div className="flexbox inventoryTable" style={{ padding: '0 12px' }}>
                  <Checkbox
                    indeterminate={numSelected > 0 && numSelected < devices.length}
                    checked={numSelected === devices.length}
                    onChange={() => self.onSelectAllClick()}
                    style={{ marginRight: 12 }}
                  />
                  {columnHeaders.map(item => (
                    <div className="columnHeader" key={item.name} style={{ width: columnWidth, paddingRight: 12 }}>
                      {item.title}
                      {item.sortable ? (
                        <SortIcon className={`sortIcon ${self.state.sortCol === item.name ? 'selected' : ''} ${self.state.sortDown.toString()}`} />
                      ) : null}
                      {item.customize ? <SettingsIcon onClick={item.customize} style={{ fontSize: 16, marginLeft: 'auto' }} /> : null}
                    </div>
                  ))}
                  <div style={{ width: 48 }} />
                </div>
                {devices.map((device, index) => (
                  <DeviceListItem
                    columnWidth={columnWidth}
                    device={device}
                    expanded={self.state.expandRow === index}
                    key={`device-${index}`}
                    group={group}
                    groups={groups}
                    pause={pause}
                    artifacts={artifacts}
                    redirect={redirect}
                    selected={self._isSelected(index)}
                    onClick={event => self._expandRow(event, index)}
                    onSelect={() => self._onRowSelection(index)}
                  />
                ))}
              </div>

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

        <div>
          {this.state.selectedRows.length ? (
            <div className="fixedButtons">
              <div className="float-right">
                <span className="margin-right">
                  {this.state.selectedRows.length} {pluralize('devices', this.state.selectedRows.length)} selected
                </span>
                <Button variant="contained" disabled={!this.state.selectedRows.length} color="secondary" onClick={() => this._addToGroup()}>
                  <AddCircleIcon className="buttonLabelIcon" />
                  {addLabel}
                </Button>
                {this.props.allowDeviceGroupRemoval && this.props.group ? (
                  <Button variant="contained" disabled={!this.state.selectedRows.length} style={{ marginLeft: '4px' }} onClick={() => this._removeFromGroup()}>
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
