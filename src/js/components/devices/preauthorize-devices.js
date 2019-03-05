import React from 'react';
import Time from 'react-time';
import { Collapse } from 'react-collapse';
import Loader from '../common/loader';
import AppActions from '../../actions/app-actions';
import ExpandedDevice from './expanded-device';

import Pagination from 'rc-pagination';
import _en_US from 'rc-pagination/lib/locale/en_US';
import Dropzone from 'react-dropzone';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import { isEmpty, preformatWithRequestID } from '../../helpers';

// material ui
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import ClearIcon from '@material-ui/icons/Clear';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import ContentAddIcon from '@material-ui/icons/Add';
import FileIcon from '@material-ui/icons/CloudUpload';

export default class Preauthorize extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      divHeight: 208,
      devices: [],
      pageNo: 1,
      pageLength: 20,
      authLoading: 'all',
      openPreauth: false,
      openRemove: false,
      inputs: [{ key: '', value: '' }],
      public: '',
      showKey: false,
      devicesToRemove: []
    };
  }

  componentDidMount() {
    clearAllRetryTimers();
    this._getDevices();
  }

  componentWillUnmount() {
    clearAllRetryTimers();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.count !== this.props.count || (prevProps.currentTab !== this.props.currentTab && this.props.currentTab.indexOf('Preauthorized') !== -1)) {
      this._getDevices();
    }
  }

  /*
   * Devices to show
   */
  _getDevices() {
    var self = this;
    AppActions.getDevicesByStatus('preauthorized', this.state.pageNo, this.state.pageLength)
      .then(devices => {
        self.setState({ devices, pageLoading: false, authLoading: null, expandRow: null });
        if (!devices.length && self.props.count) {
          //if devices empty but count not, put back to first page
          self._handlePageChange(1);
        }
      })
      .catch(error => {
        var errormsg = error.res.body.error || 'Please check your connection';
        self.setState({ pageLoading: false, authLoading: null });
        AppActions.setSnackbar(preformatWithRequestID(error.res, `Preauthorized devices couldn't be loaded. ${errormsg}`), null, 'Copy to clipboard');
      });
  }

  _sortColumn() {
    console.log('sort');
  }
  _expandRow(rowNumber) {
    AppActions.setSnackbar('');
    var device = this.state.devices[rowNumber];
    if (this.state.expandRow === rowNumber) {
      rowNumber = null;
    }
    this.setState({ expandedDevice: device, expandRow: rowNumber });
  }
  _adjustCellHeight(height) {
    this.setState({ divHeight: height + 95 });
  }

  _handlePageChange(pageNo) {
    var self = this;
    self.setState({ pageLoading: true, expandRow: null, pageNo: pageNo }, () => {
      self._getDevices();
    });
  }

  _dialogToggle(ref) {
    var state = {};
    state[ref] = !this.state[ref];
    this.setState(state);
    this._clearForm();
  }

  _clearForm() {
    this.setState({ public: '', filename: '', inputs: [{ key: '', value: '' }] });
  }

  _updateKey(index, event) {
    var inputs = this.state.inputs;
    inputs[index].key = event.target.value;
    this.setState({ inputs: inputs, errortext: '', errortext1: '' });
    this._convertIdentityToJSON(inputs);
  }

  _updateValue(index, event) {
    var inputs = this.state.inputs;
    inputs[index].value = event.target.value;
    this.setState({ inputs: inputs, errortext: '', errortext1: '' });
    this._convertIdentityToJSON(inputs);
  }

  _addKeyValue() {
    var inputs = this.state.inputs;
    inputs.push({ key: '', value: '' });
    this.setState({ inputs: inputs, errortext: '', errortext1: '' });
  }

  _removeInput(index) {
    var inputs = this.state.inputs;
    inputs.splice(index, 1);
    this.setState({ inputs: inputs, errortext: '', errortext1: '' });
    this._convertIdentityToJSON(inputs);
  }

  _convertIdentityToJSON(arr) {
    var obj = {};
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].value) {
        obj[arr[i].key] = arr[i].value;
      }
    }
    this.setState({ json_identity: obj });
  }

  _savePreauth(close) {
    var self = this;
    var authset = {
      pubkey: this.state.public,
      identity_data: this.state.json_identity
    };
    AppActions.preauthDevice(authset)
      .then(() => {
        AppActions.setSnackbar('Device was successfully added to the preauthorization list', 5000);
        self._getDevices();
        self.props.refreshCount();

        if (close) {
          self._dialogToggle('openPreauth');
        } else {
          self._clearForm();
        }
      })
      .catch(err => {
        console.log(err);
        var errMsg = (err.res.body || {}).error || '';

        if (err.res.status === 409) {
          self.setState({ errortext: 'A device with a matching identity data set already exists', errortext1: ' ' });
        } else {
          AppActions.setSnackbar(preformatWithRequestID(err.res, `The device could not be added: ${errMsg}`), null, 'Copy to clipboard');
        }
      });
  }

  onDrop(acceptedFiles, rejectedFiles) {
    var self = this;
    if (acceptedFiles.length) {
      var reader = new FileReader();
      reader.readAsBinaryString(acceptedFiles[0]);
      reader.fileName = acceptedFiles[0].name;
      reader.onload = function() {
        var str = reader.result.replace(/\n|\r/g, '\n');
        self.setState({ public: str, filename: reader.fileName });
      };
      reader.onerror = function(error) {
        console.log('Error: ', error);
      };
    }
    if (rejectedFiles.length) {
      AppActions.setSnackbar(`File '${rejectedFiles[0].name}' was rejected.`);
    }
  }

  _removeKey() {
    this.setState({ public: null, filename: null });
  }

  render() {
    var self = this;
    var limitMaxed = self.props.deviceLimit && self.props.deviceLimit <= self.props.acceptedDevices;

    var devices = self.state.devices.map((device, index) => {
      var id_attribute =
        self.props.globalSettings.id_attribute && self.props.globalSettings.id_attribute !== 'Device ID'
          ? (device.identity_data || {})[self.props.globalSettings.id_attribute]
          : device.device_id || device.id;

      var expanded = '';
      if (self.state.expandRow === index) {
        expanded = (
          <ExpandedDevice
            id_attribute={(self.props.globalSettings || {}).id_attribute}
            _showKey={self._showKey}
            showKey={self.state.showKey}
            limitMaxed={limitMaxed}
            deviceId={self.state.deviceId}
            id_value={id_attribute}
            device={self.state.expandedDevice}
            unauthorized={true}
            pause={self.props.pause}
          />
        );
      }

      return (
        <TableRow
          className={expanded ? 'expand' : null}
          hover
          key={index}
          onClick={() => self._expandRow(index)}
          style={expanded ? { height: self.state.divHeight } : null}
        >
          <TableCell>{id_attribute}</TableCell>
          <TableCell className="no-click-cell">
            <Time value={device.created_ts} format="YYYY-MM-DD HH:mm" />
          </TableCell>
          <TableCell className="no-click-cell capitalized">{device.status}</TableCell>
          <TableCell style={{ width: '55px', paddingRight: '0', paddingLeft: '12px' }} className="expandButton">
            <IconButton className="float-right">
              <Icon className="material-icons">{expanded ? 'arrow_drop_up' : 'arrow_drop_down'}</Icon>
            </IconButton>
          </TableCell>
          <TableCell style={{ width: '0', padding: '0', overflow: 'visible' }}>
            <Collapse
              springConfig={{ stiffness: 210, damping: 20 }}
              onMeasure={measurements => self._adjustCellHeight(measurements.height)}
              className="expanded"
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
    });

    var deviceLimitWarning = limitMaxed ? (
      <p className="warning">
        <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
        You have reached your limit of authorized devices: {this.props.acceptedDevices} of {this.props.deviceLimit}
      </p>
    ) : null;

    var preauthActions = [
      <div key="auth-button-1" style={{ marginRight: '10px', display: 'inline-block' }}>
        <Button onClick={() => this._dialogToggle('openPreauth')}>Cancel</Button>
      </div>,
      <div key="auth-button-2" style={{ marginRight: '10px', display: 'inline-block' }}>
        <Button
          variant="contained"
          disabled={!this.state.public || isEmpty(this.state.json_identity) || !!limitMaxed}
          onClick={() => this._savePreauth(false)}
          color="primary"
        >
          Save and add another
        </Button>
      </div>,
      <Button
        variant="contained"
        key="auth-button-3"
        disabled={!this.state.public || isEmpty(this.state.json_identity) || !!limitMaxed}
        onClick={() => this._savePreauth(true)}
        color="secondary"
      >
        Save
      </Button>
    ];

    var inputs = this.state.inputs.map(function(input, index) {
      return (
        <div key={index}>
          <TextField
            placeholder="Key"
            id={`key-${index}`}
            value={input.key}
            style={{ marginRight: '15px', marginBottom: '15px', verticalAlign: 'top' }}
            onChange={e => this._updateKey(index, e)}
            errorstyle={{ color: 'rgb(171, 16, 0)' }}
            errortext={index === this.state.inputs.length - 1 ? this.state.errortext : ''}
          />
          <TextField
            placeholder="Value"
            id={`value-${index}`}
            style={{ verticalAlign: 'top' }}
            value={input.value}
            onChange={e => this._updateValue(index, e)}
            errorstyle={{ color: 'rgb(171, 16, 0)' }}
            errortext={index === this.state.inputs.length - 1 ? this.state.errortext1 : ''}
          />
          {this.state.inputs.length > 1 ? (
            <IconButton disabled={!this.state.inputs[index].key || !this.state.inputs[index].value} onClick={() => this._removeInput(index)}>
              <ClearIcon fontSize="small" />
            </IconButton>
          ) : null}
        </div>
      );
    }, this);

    return (
      <div>
        <Button color="secondary" variant="contained" disabled={!!limitMaxed} className="top-right-button" onClick={() => this._dialogToggle('openPreauth')}>
          Preauthorize devices
        </Button>

        <Loader show={this.state.authLoading === 'all'} />

        {this.state.devices.length && this.state.authLoading !== 'all' ? (
          <div className="padding-bottom">
            <h3 className="align-center">Preauthorized devices</h3>
            {deviceLimitWarning}

            <Table>
              <TableHead className="clickable">
                >
                <TableRow>
                  <TableCell className="columnHeader" tooltip={(this.props.globalSettings || {}).id_attribute || 'Device ID'}>
                    {(this.props.globalSettings || {}).id_attribute || 'Device ID'}
                    <Icon onClick={this.props.openSettingsDialog} style={{ fontSize: '16px' }} className="material-icons hover float-right">
                      settings
                    </Icon>
                  </TableCell>
                  <TableCell className="columnHeader" tooltip="Date added">
                    Date added
                  </TableCell>
                  <TableCell className="columnHeader" tooltip="Status">
                    Status
                  </TableCell>
                  <TableCell className="columnHeader" style={{ width: '55px', paddingRight: '12px', paddingLeft: '0' }} />
                </TableRow>
              </TableHead>
              <TableBody className="clickable">{devices}</TableBody>
            </Table>

            <div className="margin-top">
              <Pagination
                locale={_en_US}
                simple
                pageSize={this.state.pageLength}
                current={this.state.pageNo || 1}
                total={this.props.count}
                onChange={page => this._handlePageChange(page)}
              />
              {this.state.pageLoading ? (
                <div className="smallLoaderContainer">
                  <Loader show={true} />
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className={this.state.authLoading ? 'hidden' : 'dashboard-placeholder'}>
            <p>There are no preauthorized devices.</p>
            <p>
              {limitMaxed ? 'Preauthorize devices' : <a onClick={() => this._dialogToggle('openPreauth')}>Preauthorize devices</a>} so that when they come
              online, they will connect to the server immediately
            </p>
            <img src="assets/img/preauthorize.png" alt="preauthorize" />
          </div>
        )}

        <Dialog open={this.state.openPreauth}>
          <DialogTitle>Preauthorize devices</DialogTitle>
          <DialogContent style={{ overflow: 'hidden' }}>
            <p>You can preauthorize a device by adding its authentication dataset here.</p>
            <p>This means when a device with the matching key and identity data comes online, it will automatically be authorized to connect to the server.</p>

            <h4 className="margin-top margin-bottom-small">Public key</h4>
            {this.state.filename ? (
              <div>
                <TextField
                  id="keyfile"
                  value={this.state.filename}
                  disabled={true}
                  style={{ color: 'rgba(0, 0, 0, 0.8)', borderBottom: '1px solid rgb(224, 224, 224)' }}
                />
                <IconButton style={{ top: '6px' }} onClick={() => this._removeKey()}>
                  <ClearIcon />
                </IconButton>
              </div>
            ) : (
              <div>
                <Dropzone
                  activeClassName="active"
                  rejectClassName="active"
                  multiple={false}
                  onDrop={(accepted, rejected) => this.onDrop(accepted, rejected)}
                  style={{ width: '528px' }}
                >
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} style={{ width: '500px', fontSize: '16px', margin: 'auto' }} className="dropzone onboard dashboard-placeholder">
                      <input {...getInputProps()} />
                      <div className="icon inline-block">
                        <FileIcon style={{ height: '24px', width: '24px', verticalAlign: 'middle', marginTop: '-2px' }} />
                      </div>
                      <div className="dashboard-placeholder inline">
                        Drag here or <a>browse</a> to upload a public key file
                      </div>
                    </div>
                  )}
                </Dropzone>
              </div>
            )}

            <h4 className="margin-bottom-none margin-top">Identity data</h4>
            {inputs}

            <Fab
              disabled={!this.state.inputs[this.state.inputs.length - 1].key || !this.state.inputs[this.state.inputs.length - 1].value}
              style={{ marginTop: '10px' }}
              color="secondary"
              size="small"
              onClick={() => this._addKeyValue()}
            >
              <ContentAddIcon />
            </Fab>

            {deviceLimitWarning}
          </DialogContent>
          <DialogActions>{preauthActions}</DialogActions>
        </Dialog>
      </div>
    );
  }
}
