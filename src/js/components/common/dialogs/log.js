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
import CopyToClipboard from 'react-copy-to-clipboard';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { Code } from '../copy-code';

const wrapperStyle = { marginRight: 10, display: 'inline-block' };

const dialogTypes = {
  'deviceLog': {
    title: 'Deployment log for device',
    filename: 'deviceLog'
  },
  'configUpdateLog': {
    title: 'Config update log for device',
    filename: 'updateLog'
  },
  'monitorLog': {
    title: 'Alert log for device',
    filename: 'monitorLog'
  }
};

export const LogDialog = ({ logData = '', onClose, type = 'deviceLog' }) => {
  const [copied, setCopied] = useState(false);

  const exportLog = () => {
    const uriContent = `data:application/octet-stream,${encodeURIComponent(logData)}`;
    window.open(uriContent, dialogTypes[type].filename);
  };

  return (
    <Dialog open={true}>
      <DialogTitle>{dialogTypes[type].title}</DialogTitle>
      <DialogContent>
        <Code className="log">{logData}</Code>
        <p style={{ marginLeft: 24 }}>{copied && <span className="green fadeIn">Copied to clipboard.</span>}</p>
      </DialogContent>
      <DialogActions>
        <div style={wrapperStyle}>
          <Button onClick={onClose}>Cancel</Button>
        </div>
        <CopyToClipboard style={wrapperStyle} text={logData} onCopy={() => setCopied(true)}>
          <Button>Copy to clipboard</Button>
        </CopyToClipboard>
        <Button variant="contained" color="primary" onClick={exportLog}>
          Export log
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogDialog;
