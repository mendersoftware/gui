// Copyright 2021 Northern.tech AS
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
import Dropzone from 'react-dropzone';

// material ui
import { Clear as ClearIcon, CloudUpload as FileIcon } from '@mui/icons-material';
import { IconButton, TextField } from '@mui/material';

export const FileUpload = ({
  enableContentReading = true,
  fileNameSelection,
  onFileChange,
  onFileSelect = () => undefined,
  placeholder,
  setSnackbar,
  style = {}
}) => {
  const [filename, setFilename] = useState(fileNameSelection);

  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length) {
      if (enableContentReading) {
        let reader = new FileReader();
        reader.readAsBinaryString(acceptedFiles[0]);
        reader.fileName = acceptedFiles[0].name;
        reader.onload = () => {
          const str = reader.result.replace(/\n|\r/g, '\n');
          onFileChange(str);
        };
        reader.onerror = error => {
          console.log('Error: ', error);
          setFilename();
        };
      }
      setFilename(acceptedFiles[0].name);
      onFileSelect(acceptedFiles[0]);
    }
    if (rejectedFiles.length) {
      setSnackbar(`File '${rejectedFiles[0].name}' was rejected.`);
    }
  };

  const onClear = () => {
    onFileChange();
    onFileSelect();
    setFilename();
  };

  return filename ? (
    <div style={style}>
      <TextField id="keyfile" value={filename} disabled={true} style={{ color: 'rgba(0, 0, 0, 0.8)', borderBottom: '1px solid rgb(224, 224, 224)' }} />
      <IconButton style={{ top: '6px' }} onClick={onClear} size="large">
        <ClearIcon />
      </IconButton>
    </div>
  ) : (
    <div style={style}>
      <Dropzone activeClassName="active" rejectClassName="active" multiple={false} onDrop={onDrop}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} style={{ padding: 15 }} className="dropzone onboard dashboard-placeholder flexbox centered">
            <input {...getInputProps()} />
            <FileIcon className="icon" style={{ height: 24, width: 24, verticalAlign: 'middle', marginTop: '-2px' }} />
            <div className="margin-left-small" style={{ fontSize: '11pt' }}>
              {placeholder}
            </div>
          </div>
        )}
      </Dropzone>
    </div>
  );
};

export default FileUpload;
