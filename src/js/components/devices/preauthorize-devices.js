import React from 'react';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import Time from 'react-time';

// material ui
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, FormControl, FormHelperText, IconButton, Input, TextField } from '@material-ui/core';
import { Add as ContentAddIcon, Clear as ClearIcon, CloudUpload as FileIcon, InfoOutlined as InfoIcon } from '@material-ui/icons';

import { getDeviceCount, getDevicesByStatus, preauthDevice } from '../../actions/deviceActions';
import { setSnackbar } from '../../actions/appActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import { isEmpty, preformatWithRequestID } from '../../helpers';
import Loader from '../common/loader';
import DeviceList from './devicelist';
import { refreshLength as refreshDeviceLength } from './devices';

export class Preauthorize extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      pageNo: 1,
      pageLength: 20,
      pageLoading: true,
      openPreauth: false,
      inputs: [{ key: '', value: '' }],
      public: '',
      devicesToRemove: []
    };
  }

  componentDidMount() {
    this.timer = setInterval(() => this._getDevices(), refreshDeviceLength);
    this._getDevices(true);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.count !== this.props.count) {
      this._getDevices();
    }
    const self = this;
    if (!self.state.pageLoading && !self.props.devices.length && self.props.count) {
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
    var self = this;
    Promise.all([
      self.props.getDevicesByStatus(DEVICE_STATES.preauth, this.state.pageNo, this.state.pageLength, shouldUpdate),
      self.props.getDeviceCount(DEVICE_STATES.preauth)
    ])
      .catch(error => {
        console.log(error);
        var errormsg = error.res.body.error || 'Please check your connection.';
        self.props.setSnackbar(preformatWithRequestID(error.res, `Preauthorized devices couldn't be loaded. ${errormsg}`), null, 'Copy to clipboard');
        console.log(errormsg);
      })
      .finally(() => self.setState({ pageLoading: false }));
  }

  _sortColumn() {
    console.log('sort');
  }

  _handlePageChange(pageNo) {
    var self = this;
    self.setState({ pageLoading: true, expandRow: null, pageNo: pageNo }, () => self._getDevices(true));
  }

  _togglePreauth(openPreauth = !this.state.openPreauth) {
    this.setState({ openPreauth });
    this._clearForm();
  }

  _clearForm() {
    this.setState({ public: '', filename: '', inputs: [{ key: '', value: '' }] });
  }

  _updateKey(index, event) {
    var inputs = this.state.inputs;
    inputs[index].key = event.target.value;
    this.setState({ inputs: inputs, errortext: '' });
    this._convertIdentityToJSON(inputs);
  }

  _updateValue(index, event) {
    var inputs = this.state.inputs;
    inputs[index].value = event.target.value;
    this.setState({ inputs: inputs, errortext: '' });
    this._convertIdentityToJSON(inputs);
  }

  _addKeyValue() {
    var inputs = this.state.inputs;
    inputs.push({ key: '', value: '' });
    this.setState({ inputs: inputs, errortext: '' });
  }

  _removeInput(index) {
    var inputs = this.state.inputs;
    inputs.splice(index, 1);
    this.setState({ inputs: inputs, errortext: '' });
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
    self.props
      .preauthDevice(authset)
      .then(() => {
        self.props.setSnackbar('Device was successfully added to the preauthorization list', 5000);
        self._getDevices();
        self._togglePreauth(!close);
      })
      .catch(err => {
        console.log(err);
        var errMsg = (err.res.body || {}).error || '';

        if (err.res.status === 409) {
          self.setState({ errortext: 'A device with a matching identity data set already exists' });
        } else {
          self.props.setSnackbar(preformatWithRequestID(err.res, `The device could not be added: ${errMsg}`), null, 'Copy to clipboard');
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
      self.props.setSnackbar(`File '${rejectedFiles[0].name}' was rejected.`);
    }
  }

  _removeKey() {
    this.setState({ public: null, filename: null });
  }

  render() {
    var self = this;
    var limitMaxed = self.props.deviceLimit && self.props.deviceLimit <= self.props.acceptedDevices;

    const columnHeaders = [
      {
        title: self.props.globalSettings.id_attribute || 'Device ID',
        name: 'device_id',
        customize: () => self.props.openSettingsDialog(),
        style: { flexGrow: 1 }
      },
      {
        title: 'Date added',
        name: 'date_added',
        render: device => (device.created_ts ? <Time value={device.created_ts} format="YYYY-MM-DD HH:mm" /> : '-')
      },
      {
        title: 'Status',
        name: 'status',
        render: device => (device.status ? <div className="capitalized">{device.status}</div> : '-')
      }
    ];

    var deviceLimitWarning = limitMaxed ? (
      <p className="warning">
        <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
        You have reached your limit of authorized devices: {this.props.acceptedDevices} of {this.props.deviceLimit}
      </p>
    ) : null;

    var preauthActions = [
      <div key="auth-button-1" style={{ marginRight: '10px', display: 'inline-block' }}>
        <Button onClick={() => this._togglePreauth(false)}>Cancel</Button>
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

    var inputs = self.state.inputs.map((input, index) => {
      const hasError = Boolean(index === self.state.inputs.length - 1 && self.state.errortext);
      return (
        <div className="key-value-container flexbox" key={index}>
          <FormControl error={hasError} style={{ marginRight: 15, marginTop: 10 }}>
            <Input id={`key-${index}`} value={input.key} placeholder="Key" onChange={e => self._updateKey(index, e)} type="text" />
            <FormHelperText>{self.state.errortext}</FormHelperText>
          </FormControl>
          <FormControl error={hasError} style={{ marginTop: 10 }}>
            <Input id={`value-${index}`} value={input.value} placeholder="Value" onChange={e => self._updateValue(index, e)} type="text" />
          </FormControl>
          {this.state.inputs.length > 1 ? (
            <IconButton disabled={!this.state.inputs[index].key || !this.state.inputs[index].value} onClick={() => this._removeInput(index)}>
              <ClearIcon fontSize="small" />
            </IconButton>
          ) : (
            <span style={{ minWidth: 44 }} />
          )}
        </div>
      );
    });

    return (
      <div className="tab-container">
        <Button
          style={{ position: 'absolute' }}
          color="secondary"
          variant="contained"
          disabled={!!limitMaxed}
          className="top-right-button"
          onClick={() => this._togglePreauth(true)}
        >
          Preauthorize devices
        </Button>

        <Loader show={this.state.pageLoading} />

        {this.props.devices.length && !this.state.pageLoading ? (
          <div className="padding-bottom">
            <h3 className="align-center">Preauthorized devices</h3>
            {deviceLimitWarning}
            <DeviceList
              {...self.props}
              {...self.state}
              columnHeaders={columnHeaders}
              limitMaxed={limitMaxed}
              onPageChange={e => self._handlePageChange(e)}
              onChangeRowsPerPage={pageLength => self.setState({ pageNo: 1, pageLength }, () => self._handlePageChange(1))}
              pageTotal={self.props.count}
              refreshDevices={shouldUpdate => self._getDevices(shouldUpdate)}
            />
          </div>
        ) : (
          <div className={this.state.pageLoading ? 'hidden' : 'dashboard-placeholder'}>
            <p>There are no preauthorized devices.</p>
            <p>
              {limitMaxed ? 'Preauthorize devices' : <a onClick={() => this._togglePreauth(true)}>Preauthorize devices</a>} so that when they come online, they
              will connect to the server immediately
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
                <Dropzone activeClassName="active" rejectClassName="active" multiple={false} onDrop={(accepted, rejected) => this.onDrop(accepted, rejected)}>
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} style={{ fontSize: '16px', margin: 'auto' }} className="dropzone onboard dashboard-placeholder">
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

const actionCreators = { getDeviceCount, getDevicesByStatus, preauthDevice, setSnackbar };

const mapStateToProps = state => {
  return {
    acceptedDevices: state.devices.byStatus.accepted.total || 0,
    count: state.devices.byStatus.preauthorized.total,
    devices: state.devices.selectedDeviceList,
    deviceLimit: state.devices.limit,
    globalSettings: state.users.globalSettings
  };
};

export default connect(mapStateToProps, actionCreators)(Preauthorize);
