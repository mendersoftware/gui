import React, { useState } from 'react';
import Dropzone from 'react-dropzone';

// material ui
import { IconButton, TextField } from '@material-ui/core';
import { Clear as ClearIcon, CloudUpload as FileIcon } from '@material-ui/icons';

export const FileUpload = ({ onFileChange, placeholder, setSnackbar }) => {
  const [filename, setFilename] = useState(null);

  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length) {
      let reader = new FileReader();
      reader.readAsBinaryString(acceptedFiles[0]);
      reader.fileName = acceptedFiles[0].name;
      reader.onload = () => {
        setFilename(reader.fileName);
        const str = reader.result.replace(/\n|\r/g, '\n');
        onFileChange(str);
      };
      reader.onerror = error => console.log('Error: ', error);
    }
    if (rejectedFiles.length) {
      setSnackbar(`File '${rejectedFiles[0].name}' was rejected.`);
    }
  };

  return filename ? (
    <div>
      <TextField id="keyfile" value={filename} disabled={true} style={{ color: 'rgba(0, 0, 0, 0.8)', borderBottom: '1px solid rgb(224, 224, 224)' }} />
      <IconButton
        style={{ top: '6px' }}
        onClick={() => {
          onFileChange();
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
