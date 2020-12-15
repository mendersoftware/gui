import React, { useState } from 'react';
import Dropzone from 'react-dropzone';

// material ui
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, FormControl, FormHelperText, IconButton, Input, TextField } from '@material-ui/core';
import { Add as ContentAddIcon, Clear as ClearIcon, CloudUpload as FileIcon } from '@material-ui/icons';

import { isEmpty } from '../../helpers';

export const PreauthDialog = ({ deviceLimitWarning, limitMaxed, onCancel, onSubmit, preauthDevice, setSnackbar }) => {
  const [errortext, setErrortext] = useState(null);
  const [filename, setFilename] = useState(null);
  const [inputs, setInputs] = useState([{ key: '', value: '' }]);
  const [jsonIdentity, setJsonIdentity] = useState(null);
  const [publicKey, setPublicKey] = useState(null);

  const updateInputs = (key, index, event) => {
    let changedInputs = [...inputs];
    changedInputs[index][key] = event.target.value;
    convertIdentityToJSON(changedInputs);
  };

  const addKeyValue = () => {
    const changedInputs = [...inputs, { key: '', value: '' }];
    setInputs(changedInputs);
  };

  const removeInput = index => {
    let changedInputs = [...inputs];
    changedInputs.splice(index, 1);
    convertIdentityToJSON(changedInputs);
  };

  const convertIdentityToJSON = changedInputs => {
    const jsonIdentity = changedInputs.reduce((accu, item) => ({ ...accu, ...(item.value ? { [item.key]: item.value } : {}) }), {});
    setInputs(changedInputs);
    setErrortext(null);
    setJsonIdentity(jsonIdentity);
  };

  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length) {
      let reader = new FileReader();
      reader.readAsBinaryString(acceptedFiles[0]);
      reader.fileName = acceptedFiles[0].name;
      reader.onload = () => {
        const str = reader.result.replace(/\n|\r/g, '\n');
        setPublicKey(str);
        setFilename(reader.fileName);
      };
      reader.onerror = error => console.log('Error: ', error);
    }
    if (rejectedFiles.length) {
      setSnackbar(`File '${rejectedFiles[0].name}' was rejected.`);
    }
  };

  const onHandleSubmit = shouldClose => {
    const authset = {
      pubkey: publicKey,
      identity_data: jsonIdentity
    };
    preauthDevice(authset)
      .then(() => onSubmit(shouldClose))
      .catch(setErrortext);
  };

  const isSubmitDisabled = !publicKey || isEmpty(jsonIdentity) || !!limitMaxed;
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
            <IconButton
              style={{ top: '6px' }}
              onClick={() => {
                setPublicKey();
                setFilename();
              }}
            >
              <ClearIcon />
            </IconButton>
          </div>
        ) : (
          <div>
            <Dropzone activeClassName="active" rejectClassName="active" multiple={false} onDrop={onDrop}>
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
                <Input value={input.key} placeholder="Key" onChange={e => updateInputs('key', index, e)} type="text" />
                <FormHelperText>{errortext}</FormHelperText>
              </FormControl>
              <FormControl error={hasError} style={{ marginTop: 10 }}>
                <Input value={input.value} placeholder="Value" onChange={e => updateInputs('value', index, e)} type="text" />
              </FormControl>
              {inputs.length > 1 ? (
                <IconButton disabled={!inputs[index].key || !inputs[index].value} onClick={() => removeInput(index)}>
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
          onClick={addKeyValue}
        >
          <ContentAddIcon />
        </Fab>
        {!!limitMaxed && deviceLimitWarning}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" disabled={isSubmitDisabled} onClick={() => onHandleSubmit(false)} color="primary" style={{ marginLeft: 10 }}>
          Save and add another
        </Button>
        <Button variant="contained" disabled={isSubmitDisabled} onClick={() => onHandleSubmit(true)} color="secondary" style={{ marginLeft: 10 }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreauthDialog;
