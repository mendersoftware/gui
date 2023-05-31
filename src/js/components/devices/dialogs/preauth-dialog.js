// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useState } from 'react';

// material ui
import { InfoOutlined as InfoIcon } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { isEmpty } from '../../../helpers';
import FileUpload from '../../common/forms/fileupload';
import KeyValueEditor from '../../common/forms/keyvalueeditor';

export const DeviceLimitWarning = ({ acceptedDevices, deviceLimit, hasContactInfo }) => (
  <div className="margin-bottom-small margin-top-small warning">
    <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
    You have reached your limit of authorized devices: {acceptedDevices} of {deviceLimit}
    {hasContactInfo && (
      <p>
        Contact us by email at <a href="mailto:support@mender.io">support@mender.io</a> to request a higher limit.
      </p>
    )}
  </div>
);

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
    <Dialog open>
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
        {!!limitMaxed && <DeviceLimitWarning acceptedDevices={acceptedDevices} deviceLimit={deviceLimit} />}
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
