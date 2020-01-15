import React from 'react';
import Dropzone from 'react-dropzone';

import { TextField } from '@material-ui/core';
import { CloudUpload, InfoOutlined as InfoIcon } from '@material-ui/icons';

import Form from '../../common/forms/form';
import TextInput from '../../common/forms/textinput';
import { FileSize } from '../../../helpers';

export default class ArtifactUpload extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      acceptedFiles: [],
      destination: '',
      uniqueId: new Date()
    };
  }

  onDrop(acceptedFiles, rejectedFiles) {
    if (acceptedFiles.length) {
      // this._onUploadSubmit(acceptedFiles);
      this.setState({ acceptedFiles });
    }
    if (rejectedFiles.length) {
      this.setState({ acceptedFiles: [] });
      this.props.setSnackbar(`File '${rejectedFiles[0].name}' was rejected. File must be of type .mender`, null);
    }
  }

  render() {
    const self = this;
    const { acceptedFiles, destination, uniqueId } = self.state;
    const { filesize, filename } = acceptedFiles.length ? { filename: acceptedFiles[0].name, filesize: acceptedFiles[0].size } : { filesize: 0, filename: 0 };
    return !acceptedFiles.length ? (
      <>
        <Dropzone
          activeClassName="active"
          rejectClassName="active"
          multiple={false}
          // accept=".mender"
          onDrop={(accepted, rejected) => this.onDrop(accepted, rejected)}
        >
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps({ className: 'dashboard-placeholder fadeIn onboard dropzone', style: { top: 0 } })} ref={ref => (this.dropzoneRef = ref)}>
              <input {...getInputProps()} />
              <span className="icon">
                <CloudUpload fontSize="small" />
              </span>
              <span>
                Drag here or <a>browse</a> to upload an Artifact file
              </span>
            </div>
          )}
        </Dropzone>
        <p className="info" style={{ marginTop: '10px' }}>
          <InfoIcon fontSize="small" />
          Upload a pre-built .mender Artifact OR any file to create single-file update Artifact
        </p>
      </>
    ) : (
      <Form showButtons={false} uniqueId={uniqueId}>
        <TextField label="File name" key="filename" disabled defaultValue={filename} />
        <TextField label="Size" key="filesize" disabled defaultValue={<FileSize fileSize={filesize} />} />
        <TextInput
          hint="Example: /opt/installed-by-single-file"
          id="destination"
          label="Destination directory where the file will be installed on your devices"
          disabled={false}
          value={destination}
          validations="isLength:1"
          focus={true}
          InputLabelProps={{ shrink: true }}
        />
        <p className="info">
          This file will be converted to a .mender Artifact file before itis uploaded to the server, which requires some metadata to be entered.
        </p>
        <p className="info">Click &apos;Next&apos; to continue</p>
      </Form>
    );
  }
}
