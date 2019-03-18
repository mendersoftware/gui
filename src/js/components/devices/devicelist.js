import React from 'react';
import Time from 'react-time';
import { Collapse } from 'react-collapse';
import ReactTooltip from 'react-tooltip';
import { ExpandDevice } from '../helptips/helptooltips';
import Loader from '../common/loader';
import AppActions from '../../actions/app-actions';
import ExpandedDevice from './expanded-device';

import pluralize from 'pluralize';

// material ui
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';

import AddCircleIcon from '@material-ui/icons/AddCircle';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import HelpIcon from '@material-ui/icons/Help';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import SettingsIcon from '@material-ui/icons/Settings';

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

    if (prevProps.paused !== this.props.paused && this.state.device) {
      this._setDeviceDetails(this.state.device);
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
    var device = self.props.devices[rowNumber];
    if (self.state.expandRow === rowNumber) {
      rowNumber = null;
    }
    self.setState({ expandRow: rowNumber, device: device });
    self._setDeviceDetails(device);
  }

  _adjustCellHeight(height) {
    this.setState({ divHeight: height + 105 });
  }

  /*
   * Get full device identity details for single selected device
   */
  _setDeviceDetails(device) {
    var self = this;
    return AppActions.getDeviceAuth(device.id)
      .then(data => {
        device.identity_data = data.identity_data;
        device.id = data.id;
        device.updated_ts = data.updated_ts;
        device.created_ts = data.created_ts;
        device.status = data.status;
        self.setState({ expandedDevice: device });
      })
      .catch(err => console.log(`Error: ${err}`));
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
    var pluralized = pluralize('devices', this.state.selectedRows.length);

    var addLabel = this.props.group ? `Move selected ${pluralized} to another group` : `Add selected ${pluralized} to a group`;
    var removeLabel = `Remove selected ${pluralized} from this group`;
    var groupLabel = this.props.group ? decodeURIComponent(this.props.group) : 'All devices';

    var devices = this.props.devices.map(function(device, index) {
      var self = this;
      var expanded = '';

      var attrs = {
        device_type: '',
        artifact_name: ''
      };

      var attributesLength = device.attributes ? device.attributes.length : 0;
      for (var i = 0; i < attributesLength; i++) {
        attrs[device.attributes[i].name] = device.attributes[i].value;
      }

      var id_attribute =
        self.props.globalSettings && self.props.globalSettings.id_attribute && self.props.globalSettings.id_attribute !== 'Device ID'
          ? (device.identity_data || {})[self.props.globalSettings.id_attribute]
          : device.id;

      if (self.state.expandRow === index) {
        expanded = (
          <ExpandedDevice
            id_attribute={(this.props.globalSettings || {}).id_attribute}
            id_value={id_attribute}
            docsVersion={this.props.docsVersion}
            showHelpTips={this.props.showHelptips}
            device={this.state.expandedDevice || device}
            attrs={device.attributes}
            device_type={attrs.device_type}
            redirect={this.props.redirect}
            artifacts={this.props.artifacts}
            selectedGroup={this.props.group}
            groups={this.props.groups}
            pause={this.props.pause}
          />
        );
      }

      return (
        <TableRow
          hover={!expanded}
          className={expanded ? 'expand' : null}
          key={device.id}
          selected={this._isSelected(index)}
          onClick={event => self._expandRow(event, index)}
        >
          <TableCell padding="checkbox">
            <Checkbox
              style={expanded ? { paddingTop: '0', marginTop: '-4px' } : {}}
              checked={self._isSelected(index)}
              onChange={() => self._onRowSelection(index)}
            />
          </TableCell>
          <TableCell style={expanded ? { height: self.state.divHeight } : {}}>{id_attribute}</TableCell>
          <TableCell>{attrs.device_type || '-'}</TableCell>
          <TableCell>{attrs.artifact_name || '-'}</TableCell>
          <TableCell>{device.updated_ts ? <Time value={device.updated_ts} format="YYYY-MM-DD HH:mm" /> : '-'}</TableCell>
          <TableCell style={{ width: '55px', paddingRight: '0', paddingLeft: '12px' }} className="expandButton">
            <IconButton className="float-right">{expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}</IconButton>
          </TableCell>
          <TableCell style={{ width: '0', padding: '0', overflow: 'visible' }}>
            <Collapse
              springConfig={{ stiffness: 210, damping: 20 }}
              onMeasure={measurements => self._adjustCellHeight(measurements.height)}
              className="expanded accepted"
              isOpened={expanded ? true : false}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {expanded}
            </Collapse>
          </TableCell>
        </TableRow>
      );
    }, this);

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
        <Loader show={this.props.loading} />

        {this.props.devices.length && !this.props.loading ? (
          <div>
            <div style={{ marginLeft: '20px' }}>
              <h2>
                {this.state.nameEdit ? groupNameInputs : <span>{groupLabel}</span>}
              </h2>
            </div>

            <div className="padding-bottom">
              <Table>
                <TableHead className="clickable">
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={numSelected > 0 && numSelected < self.props.devices.length}
                        checked={numSelected === self.props.devices.length}
                        onChange={() => self.onSelectAllClick()}
                      />
                    </TableCell>
                    <TableCell className="columnHeader" tooltip={(this.props.globalSettings || {}).id_attribute || 'Device ID'}>
                      {(this.props.globalSettings || {}).id_attribute || 'Device ID'}
                      <SettingsIcon onClick={this.props.openSettingsDialog} style={{ fontSize: '16px' }} className="hover float-right" />
                    </TableCell>
                    <TableCell className="columnHeader" tooltip="Device type">
                      Device type
                    </TableCell>
                    <TableCell className="columnHeader" tooltip="Current software">
                      Current software
                    </TableCell>
                    <TableCell className="columnHeader" tooltip="Last updated">
                      Last updated
                    </TableCell>
                    <TableCell className="columnHeader" style={{ width: '55px', paddingRight: '12px', paddingLeft: '0' }} />
                  </TableRow>
                </TableHead>
                <TableBody className="clickable">{devices}</TableBody>
              </Table>

              {this.props.showHelptips && this.props.devices.length ? (
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
          <div className={this.props.devices.length || this.props.loading ? 'hidden' : 'dashboard-placeholder'}>
            <p>No devices found</p>
            {!this.props.allCount ? <p>No devices have been authorized to connect to the Mender server yet.</p> : null}
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
