import React from 'react';
import Dropzone from 'react-dropzone';

// material ui
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, FormControl, FormHelperText, IconButton, Input, TextField } from '@material-ui/core';
import { Add as ContentAddIcon, Clear as ClearIcon, CloudUpload as FileIcon } from '@material-ui/icons';

import { isEmpty } from '../../helpers';

export default class PreauthDialog extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      filename: null,
      inputs: [{ key: '', value: '' }],
      json_identity: null,
      publicKey: null
    };
  }

  _updateKey(index, event) {
    let inputs = this.state.inputs;
    inputs[index].key = event.target.value;
    this.setState({ inputs });
    this._convertIdentityToJSON(inputs);
  }

  _updateValue(index, event) {
    let inputs = this.state.inputs;
    inputs[index].value = event.target.value;
    this.setState({ inputs });
    this._convertIdentityToJSON(inputs);
  }

  _addKeyValue() {
    let inputs = this.state.inputs;
    inputs.push({ key: '', value: '' });
    this.setState({ inputs });
  }

  _removeInput(index) {
    let inputs = this.state.inputs;
    inputs.splice(index, 1);
    this.setState({ inputs });
    this._convertIdentityToJSON(inputs);
  }

  _convertIdentityToJSON(arr) {
    const json_identity = arr.reduce((accu, item) => ({ ...accu, ...(item.value ? { [item.key]: item.value } : {}) }), {});
    this.props.onChange();
    this.setState({ json_identity });
  }

  onDrop(acceptedFiles, rejectedFiles) {
    const self = this;
    if (acceptedFiles.length) {
      let reader = new FileReader();
      reader.readAsBinaryString(acceptedFiles[0]);
      reader.fileName = acceptedFiles[0].name;
      reader.onload = function () {
        var str = reader.result.replace(/\n|\r/g, '\n');
        self.setState({ publicKey: str, filename: reader.fileName });
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
      };
    }
    if (rejectedFiles.length) {
      self.props.setSnackbar(`File '${rejectedFiles[0].name}' was rejected.`);
    }
  }

  _removeKey() {
    this.setState({ publicKey: null, filename: null });
  }

  onHandleSubmit(shouldClose) {
    const authset = {
      pubkey: this.state.publicKey,
      identity_data: this.state.json_identity
    };
    this.props.onSubmit(authset, shouldClose);
  }

  render() {
    const self = this;
    const { deviceLimitWarning, errortext, limitMaxed, onCancel } = self.props;
    const { filename, inputs, json_identity, publicKey } = self.state;

    return (
      <Dialog open={true}>
        <DialogTitle>Preauthorize devices</DialogTitle>
        <DialogContent style={{ overflow: 'hidden' }}>
          <p>You can preauthorize a device by adding its authentication dataset here.</p>
          <p>This means when a device with the matching key and identity data comes online, it will automatically be authorized to connect to the server.</p>

          <h4 className="margin-top margin-bottom-small">Public key</h4>
          {filename ? (
            <div>
              <TextField id="keyfile" value={filename} disabled={true} style={{ color: 'rgba(0, 0, 0, 0.8)', borderBottom: '1px solid rgb(224, 224, 224)' }} />
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
          {inputs.map((input, index) => {
            const hasError = Boolean(index === inputs.length - 1 && errortext);
            return (
              <div className="key-value-container flexbox" key={index}>
                <FormControl error={hasError} style={{ marginRight: 15, marginTop: 10 }}>
                  <Input id={`key-${index}`} value={input.key} placeholder="Key" onChange={e => self._updateKey(index, e)} type="text" />
                  <FormHelperText>{errortext}</FormHelperText>
                </FormControl>
                <FormControl error={hasError} style={{ marginTop: 10 }}>
                  <Input id={`value-${index}`} value={input.value} placeholder="Value" onChange={e => self._updateValue(index, e)} type="text" />
                </FormControl>
                {inputs.length > 1 ? (
                  <IconButton disabled={!inputs[index].key || !inputs[index].value} onClick={() => this._removeInput(index)}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <span style={{ minWidth: 44 }} />
                )}
              </div>
            );
          })}
          <Fab
            disabled={!inputs[inputs.length - 1].key || !inputs[inputs.length - 1].value}
            style={{ marginTop: '10px' }}
            color="secondary"
            size="small"
            onClick={() => self._addKeyValue()}
          >
            <ContentAddIcon />
          </Fab>
          {!!limitMaxed && deviceLimitWarning}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!publicKey || isEmpty(json_identity) || !!limitMaxed}
            onClick={() => self.onHandleSubmit(false)}
            color="primary"
            style={{ marginLeft: 10 }}
          >
            Save and add another
          </Button>
          <Button
            variant="contained"
            disabled={!publicKey || isEmpty(json_identity) || !!limitMaxed}
            onClick={() => self.onHandleSubmit(true)}
            color="secondary"
            style={{ marginLeft: 10 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
