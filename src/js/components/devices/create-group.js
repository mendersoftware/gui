import React from 'react';
import { connect } from 'react-redux';
import cookie from 'react-cookie';
import validator from 'validator';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Input,
  InputLabel,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow
} from '@material-ui/core';
import { ErrorOutline as ErrorOutlineIcon } from '@material-ui/icons';

import { getDevicesByStatus } from '../../actions/deviceActions';
import * as DeviceConstants from '../../constants/deviceConstants';
import Loader from '../common/loader';

export class CreateGroup extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = this._getInitialState();
    this.props.getDevicesByStatus(DeviceConstants.DEVICE_STATES.accepted, this.state.pageNo, this.state.pageLength);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.open !== this.props.open) {
      this.setState(this._getInitialState());
    }
  }

  _getInitialState() {
    return {
      errortext: '',
      showDeviceList: false,
      newGroup: '',
      nextInvalid: true,
      createInvalid: true,
      selectedRows: [],
      pageNo: 1,
      pageLength: 10
    };
  }

  _getDevices() {
    var self = this;
    return self.props
      .getDevicesByStatus(DeviceConstants.DEVICE_STATES.accepted, this.state.pageNo, this.state.pageLength)
      .catch(err => {
        console.log(err.error || 'Please check your connection.');
        // setRetryTimer(err, "devices", "Devices couldn't be loaded. " + errormsg, self.state.refreshDeviceLength);
      })
      .finally(() => self.setState({ loading: false, pageLoading: false }));
  }

  _createGroupHandler() {
    var self = this;

    var gotCookie = cookie.load(`${this.props.userId}-groupHelpText`);
    // if another group exists, check for warning message cookie
    if (this.props.groups.length && !gotCookie && !this.state.showWarning) {
      // if show warning message
      this.setState({ showDeviceList: false, showWarning: true });
    } else {
      self._createGroupFromSelected();
    }
  }

  _createGroupFromSelected() {
    const devices = this.state.selectedRows.map(row => this.props.devices[row]);
    // cookie exists || if no other groups exist, continue to create group
    this.props.addListOfDevices(devices, this.state.newGroup);
    this.setState({ showWarning: false });
  }

  validateName(e) {
    var newName = e.target.value;
    this.setState({ newGroup: newName });
    var invalid = false;
    var errortext = null;
    if (newName) {
      if (!validator.isWhitelisted(newName, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-')) {
        invalid = true;
        errortext = 'Valid characters are a-z, A-Z, 0-9, _ and -';
      } else if (validator.contains(newName.toLowerCase(), DeviceConstants.UNGROUPED_GROUP.name.toLowerCase())) {
        invalid = true;
        errortext = `${newName} is a reserved group name`;
      } else {
        for (var i = 0; i < this.props.groups.length; i++) {
          if (decodeURIComponent(this.props.groups[i]) === newName) {
            invalid = true;
            errortext = 'A group with this name already exists';
          }
        }
      }
      this.setState({ errortext: errortext, nextInvalid: invalid });
    } else {
      invalid = true;
      errortext = 'Name cannot be left blank';
      this.setState({ errortext: errortext, nextInvalid: invalid });
    }
  }

  _loadMoreDevs() {
    var self = this;
    var numberDevs = self.state.pageLength;
    numberDevs += 10;

    self.setState({ showDeviceList: true, pageLength: numberDevs }, () => {
      self._getDevices();
    });
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
    self.setState({ selectedRows: updatedSelection, createInvalid: !updatedSelection.length });
  }

  onSelectAllClick() {
    const self = this;
    let selectedRows = Array.apply(null, { length: this.props.devices.length }).map(Number.call, Number);
    if (self.state.selectedRows.length && self.state.selectedRows.length <= self.props.devices.length) {
      selectedRows = [];
    }
    self.setState({ selectedRows, createInvalid: !selectedRows.length });
  }

  _handleCheckBox(isChecked) {
    var self = this;
    this.setState({ isChecked: isChecked });
    if (isChecked) {
      cookie.save(`${self.state.userId}-groupHelpText`, true);
    }
  }

  _isSelected(index) {
    return this.state.selectedRows.indexOf(index) !== -1;
  }

  _handleClose() {
    this.setState({
      newGroup: '',
      showDeviceList: false,
      createInvalid: true,
      nextInvalid: true,
      showWarning: false,
      selectedRows: [],
      pageLength: 0,
      errortext: ''
    });
    this.props.toggleDialog('createGroupDialog');
  }

  render() {
    var self = this;

    const globalSettings = self.props.globalSettings;

    var deviceList = self.props.devices.map((device, index) => {
      let id_attribute = device.device_id || device.id;
      if (globalSettings.id_attribute !== 'Device ID') {
        id_attribute = (device.identity_data || {})[globalSettings.id_attribute];
      }

      const deviceType = device.attributes ? device.attributes.device_type : '-';
      return (
        <TableRow selected={self._isSelected(index)} hover key={index} onClick={() => self._onRowSelection(index)}>
          <TableCell padding="checkbox">
            <Checkbox checked={self._isSelected(index)} />
          </TableCell>
          <TableCell>{id_attribute}</TableCell>
          <TableCell>{deviceType}</TableCell>
        </TableRow>
      );
    });

    const numSelected = self.state.selectedRows.length;

    const createButtonInvalid = this.state.createInvalid || !self.state.selectedRows.length;

    return (
      <Dialog disableBackdropClick disableEscapeKeyDown open={self.props.open} scroll={'paper'} fullWidth={true} maxWidth="sm">
        <DialogTitle style={{ paddingBottom: '15px', marginBottom: 0 }}>{self.state.showWarning ? '' : 'Create a new group'}</DialogTitle>

        <DialogContent style={{ maxHeight: '50vh' }}>
          <div className={self.state.showDeviceList || self.state.showWarning ? 'hidden' : 'absoluteTextfieldButton'}>
            <FormControl error={Boolean(self.state.errortext)} className="float-left">
              <InputLabel htmlFor="group-name-input">Name your group</InputLabel>
              <Input id="group-name-input" value={self.state.newGroup} placeholder="Name your group" onChange={e => self.validateName(e)} type="text" />
              <FormHelperText>{self.state.errortext}</FormHelperText>
            </FormControl>
            <div className={self.state.showDeviceList ? 'hidden' : 'float-left margin-left-small'}>
              <Button
                variant="contained"
                disabled={self.state.nextInvalid}
                style={{ marginTop: '26px' }}
                color="secondary"
                onClick={() => self._loadMoreDevs()}
              >
                Next
              </Button>
            </div>
          </div>

          {self.state.showWarning ? (
            <div className="help-message">
              <h2>
                <ErrorOutlineIcon style={{ marginRight: '4px', verticalAlign: 'sub' }} />
                {` You're creating a new group`}
              </h2>
              <p>
                Just a heads-up: if a device is already in another group, it will be removed from that group and moved to the new one. A device can only belong
                to one group at a time.
              </p>

              <FormControlLabel
                className={this.props.className}
                control={<Checkbox onChange={(e, checked) => self._handleCheckBox(checked)} />}
                label="Got it! Don't show this message again"
                labelStyle={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.6)' }}
              />
            </div>
          ) : (
            <div className={this.state.showDeviceList === true ? 'dialogTableContainer' : 'dialogTableContainer zero'}>
              {deviceList.length ? (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={numSelected > 0 && numSelected < self.props.devices.length}
                          checked={numSelected === self.props.devices.length}
                          onChange={() => self.onSelectAllClick()}
                        />
                      </TableCell>
                      <TableCell tooltip={(this.props.globalSettings || {}).id_attribute || 'Device ID'}>
                        {(this.props.globalSettings || {}).id_attribute || 'Device ID'}
                      </TableCell>
                      <TableCell tooltip="Device type">Device type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>{deviceList}</TableBody>
                </Table>
              ) : null}
              {this.props.acceptedCount > deviceList.length ? (
                <a className="small" onClick={() => this._loadMoreDevs()}>
                  Load more devices
                </a>
              ) : null}
              <Loader show={this.props.loadingDevices} />
              <p className={deviceList.length || this.props.loadingDevices ? 'hidden' : 'italic muted'}>No devices match the search term</p>
            </div>
          )}
        </DialogContent>

        <DialogActions style={{ marginTop: 0 }}>
          <div key="create-action-button-1" style={{ marginRight: '10px', display: 'inline-block' }}>
            <Button onClick={() => this._handleClose()}>Cancel</Button>
          </div>
          <Button variant="contained" key="create-action-button-2" color="primary" onClick={() => this._createGroupHandler()} disabled={createButtonInvalid}>
            {this.state.showWarning ? 'Confirm' : 'Create group'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const actionCreators = { getDevicesByStatus };

const mapStateToProps = state => {
  const deviceList = state.devices.selectedDeviceList.length > 0 ? state.devices.selectedDeviceList : [];
  const devices = deviceList.map(id => state.devices.byId[id]);
  return { devices, globalSettings: state.users.globalSettings, userid: state.users.currentUser };
};

export default connect(mapStateToProps, actionCreators)(CreateGroup);
