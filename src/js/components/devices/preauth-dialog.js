import React, { useState } from 'react';

// material ui
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { InfoOutlined as InfoIcon } from '@material-ui/icons';

import FileUpload from '../common/forms/fileupload';
import KeyValueEditor from '../common/forms/keyvalueeditor';

import { isEmpty } from '../../helpers';

export const DeviceLimitWarning = ({ acceptedDevices, deviceLimit, hasContactInfo }) => {
  return (
    <p className="warning">
      <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
      You have reached your limit of authorized devices: {acceptedDevices} of {deviceLimit}
      {hasContactInfo && (
        <p>
          Contact us by email at <a href="mailto:support@mender.io">support@mender.io</a> to request a higher limit.
        </p>
      )}
    </p>
  );
};

export const PreauthDialog = ({ acceptedDevices, deviceLimit, limitMaxed, onCancel, onSubmit, preauthDevice, setSnackbar }) => {
  const [errortext, setErrortext] = useState(null);
  const [jsonIdentity, setJsonIdentity] = useState(null);
  const [publicKey, setPublicKey] = useState(null);

  const convertIdentityToJSON = jsonIdentity => {
    setErrortext(null);
    setJsonIdentity(jsonIdentity);
  };

  const onHandleSubmit = shouldClose => {
    const authset = {
      pubkey: publicKey,
      identity_data: jsonIdentity
    };
    return preauthDevice(authset)
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
        <FileUpload
          placeholder={
            <>
              Drag here or <a>browse</a> to upload a public key file
            </>
          }
          onFileChange={setPublicKey}
          setSnackbar={setSnackbar}
        />
        <h4 className="margin-bottom-none margin-top">Identity data</h4>
        <KeyValueEditor errortext={errortext} onInputChange={convertIdentityToJSON} />
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
