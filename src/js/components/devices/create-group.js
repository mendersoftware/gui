import React from 'react';
import cookie from 'react-cookie';
import validator from 'validator';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Icon from '@material-ui/core/Icon';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';

import AppActions from '../../actions/app-actions';
import AppConstants from '../../constants/app-constants';
import AppStore from '../../stores/app-store';
import Loader from '../common/loader';
import { mapDeviceAttributes } from '../../helpers';

export default class CreateGroup extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = this._getInitialState();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.open !== this.props.open) {
      this.setState(this._getInitialState());
    }
  }

  _getInitialState() {
    return {
      errorText: '',
      showDeviceList: false,
      newGroup: '',
      nextInvalid: true,
      createInvalid: true,
      devices: [],
      selectedRows: [],
      pageNo: 1,
      pageLength: 0,
      user: AppStore.getCurrentUser()
    };
  }

  _getDevices() {
    var self = this;
    return AppActions.getDevicesByStatus('accepted', this.state.pageNo, this.state.pageLength)
      .then(devices => {
        self.setState({ devices, loading: false, pageLoading: false }, () => {
          // for each device, get inventory
          const devicesInventoryRequests = devices.map(device => {
            // have to call inventory each time - accepted list can change order so must refresh inventory too
            return self._getInventoryForDevice(device.id).then(inventory => {
              device.attributes = inventory.attributes;
              return Promise.resolve(device);
            });
          });
          return Promise.all(devicesInventoryRequests).then(devicesInventory => self.setState({ devices: devicesInventory }));
        });
      })
      .catch(err => {
        console.log(err.error || 'Please check your connection.');
        self.setState({ loading: false });
        // setRetryTimer(err, "devices", "Devices couldn't be loaded. " + errormsg, self.state.refreshDeviceLength);
      });
  }

  _getInventoryForDevice(device_id) {
    // get inventory for single device
    return AppActions.getDeviceById(device_id).catch(err => {
      if (err.res.statusCode !== 404) {
        // don't show error if 404 - device hasn't received inventory yet
        console.log(err);
      }
    });
  }

  _createGroupHandler() {
    var self = this;
    if (!this.state.user) {
      this.setState({ user: AppStore.getCurrentUser() });
    }
    var gotCookie = cookie.load(`${this.state.user.id}-groupHelpText`);
    // if another group exists, check for warning message cookie
    if (this.props.groups.length && !gotCookie && !this.state.showWarning) {
      // if show warning message
      this.setState({ showDeviceList: false, showWarning: true });
    } else {
      self._createGroupFromSelected();
    }
  }

  _createGroupFromSelected() {
    var devices = [];
    for (var i = 0; i < this.state.selectedRows.length; i++) {
      var device = this.state.devices[this.state.selectedRows[i]];
      devices.push(device);
    }
    // cookie exists || if no other groups exist, continue to create group
    this.props.addListOfDevices(devices, this.state.newGroup);
    this.setState({ showWarning: false });
  }

  validateName(e) {
    var newName = e.target.value;
    this.setState({ newGroup: newName });
    var invalid = false;
    var errorText = null;
    if (newName) {
      if (!validator.isWhitelisted(newName, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-')) {
        invalid = true;
        errorText = 'Valid characters are a-z, A-Z, 0-9, _ and -';
      } else if (validator.contains(newName.toLowerCase(), AppConstants.UNGROUPED_GROUP.name.toLowerCase())) {
        invalid = true;
        errorText = `${newName} is a reserved group name`;
      } else {
        for (var i = 0; i < this.props.groups.length; i++) {
          if (decodeURIComponent(this.props.groups[i]) === newName) {
            invalid = true;
            errorText = 'A group with this name already exists';
          }
        }
      }
      this.setState({ errorText: errorText, nextInvalid: invalid });
    } else {
      invalid = true;
      errorText = 'Name cannot be left blank';
      this.setState({ errorText: errorText, nextInvalid: invalid });
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
      updatedSelection = selectedRows.splice(selectedIndex, 1);
    }
    self.setState({ selectedRows: updatedSelection, createInvalid: updatedSelection.length > 0 });
  }

  onSelectAllClick() {
    const self = this;
    let createInvalid = true;
    let selectedRows = Array.apply(null, { length: this.state.devices.length }).map(Number.call, Number);
    if (self.state.selectedRows.length !== self.state.devices.length) {
      selectedRows = [];
      createInvalid = false;
    }
    self.setState({ selectedRows, createInvalid });
  }

  _handleCheckBox(isChecked) {
    var self = this;
    this.setState({ isChecked: isChecked });
    if (isChecked) {
      cookie.save(`${self.state.user.id}-groupHelpText`, true);
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
      errorText: ''
    });
    this.props.toggleDialog('createGroupDialog');
  }

  render() {
    var self = this;
    var deviceList = self.state.devices.map((device, index) => {
      var id_attribute =
        self.props.globalSettings.id_attribute && self.props.globalSettings.id_attribute !== 'Device ID'
          ? (device.identity_data || {})[self.props.globalSettings.id_attribute]
          : device.device_id || device.id;

      var attrs = mapDeviceAttributes(device.attributes);
      return (
        <TableRow selected={self._isSelected(index)} hover key={index} onClick={row => this._onRowSelection(row)}>
          <TableCell padding="checkbox">
            <Checkbox checked={self._isSelected(index)} />
          </TableCell>
          <TableCell>{id_attribute}</TableCell>
          <TableCell>{attrs.device_type}</TableCell>
        </TableRow>
      );
    });

    const numSelected = self.state.selectedRows.length;

    return (
      <Dialog disableBackdropClick disableEscapeKeyDown open={self.props.open} scroll={'paper'}>
        <DialogTitle style={{ paddingBottom: '15px', marginBottom: 0 }}>{this.state.showWarning ? '' : 'Create a new group'}</DialogTitle>

        <DialogContent style={{ maxHeight: '50vh' }}>
          <div className={self.state.showDeviceList || self.state.showWarning ? 'hidden' : 'absoluteTextfieldButton'}>
            <TextField
              ref="customGroup"
              className="float-left"
              placeholder="Name your group"
              label="Name your group"
              value={self.state.newGroup}
              onChange={e => self.validateName(e)}
              errorStyle={{ color: 'rgb(171, 16, 0)' }}
              errorText={self.state.errorText}
            />

            <div className={self.state.showDeviceList ? 'hidden' : 'float-left margin-left-small'}>
              <Button variant="contained" disabled={self.state.nextInvalid} style={{ marginTop: '26px' }} secondary="true" onClick={() => self._loadMoreDevs()}>
                Next
              </Button>
            </div>
          </div>

          {self.state.showWarning ? (
            <div className="help-message" style={{ marginTop: '-30px' }}>
              <h2>
                <Icon className="material-icons" style={{ marginRight: '4px', top: '4px' }}>
                  error_outline
                </Icon>
                You're creating a new group
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
              <Table className={deviceList.length ? null : 'hidden'}>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={numSelected > 0 && numSelected < self.state.devices.length}
                        checked={numSelected === self.state.devices.length}
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
          ,
          <Button
            variant="contained"
            key="create-action-button-2"
            primary="true"
            onClick={() => this._createGroupHandler()}
            disabled={this.state.createInvalid}
          >
            {this.state.showWarning ? 'Confirm' : 'Create group'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
