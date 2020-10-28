import React from 'react';
import Dropzone from 'react-dropzone';

import { IconButton, TextField } from '@material-ui/core';
import { CloudUpload, Delete as DeleteIcon, InfoOutlined as InfoIcon } from '@material-ui/icons';

import { onboardingSteps } from '../../../constants/onboardingConstants';
import { FileSize } from '../../../helpers';
import { getOnboardingComponentFor } from '../../../utils/onboardingmanager';

const reFilename = new RegExp(/^[a-z0-9.,_-]+$/i);

export default class ArtifactUpload extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      acceptedFiles: props.file ? [props.file] : [],
      destination: props.destination || ''
    };
  }

  onDrop(acceptedFiles) {
    const { advanceOnboarding, releases, setSnackbar, updateCreation } = this.props;
    if (acceptedFiles.length === 1) {
      if (!reFilename.test(acceptedFiles[0].name)) {
        this.setState({ acceptedFiles: [] });
        setSnackbar('Only letters, digits and characters in the set ".,_-" are allowed in the filename.', null);
      } else {
        if (releases.length) {
          advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_UPLOAD);
        }
        this.setState({ acceptedFiles }, () => updateCreation({ file: acceptedFiles[0] }));
      }
    } else {
      this.setState({ acceptedFiles: [] });
      setSnackbar('The selected file is not supported.', null);
    }
  }

  onChange(event) {
    const destination = event.target.value;
    const { updateCreation } = this.props;
    const { acceptedFiles } = this.state;
    this.setState({ destination }, () => updateCreation({ destination, file: acceptedFiles.length ? acceptedFiles[0] : null }));
  }

  onRefSet(refTarget, ref) {
    if ((!this[refTarget] && ref) || (this[refTarget] && ref && this[refTarget].className !== ref.className)) {
      this[refTarget] = ref;
      this.setState({});
    }
  }

  render() {
    const self = this;
    const { acceptedFiles, destination } = self.state;
    const { onboardingState } = self.props;
    const { filesize, filename, isMenderArtifact } = acceptedFiles.length
      ? { filename: acceptedFiles[0].name, filesize: acceptedFiles[0].size, isMenderArtifact: acceptedFiles[0].name.endsWith('.mender') }
      : { filesize: 0, filename: 0, isMenderArtifact: false };

    let onboardingComponent = null;
    if (!onboardingState.complete && self.onboardingAnchor) {
      const anchor = {
        left: self.onboardingAnchor.offsetLeft + self.onboardingAnchor.clientWidth,
        top: self.onboardingAnchor.offsetTop + self.onboardingAnchor.clientHeight / 2
      };
      onboardingComponent = getOnboardingComponentFor(onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_UPLOAD, onboardingState, { anchor, place: 'right' });
      onboardingComponent = getOnboardingComponentFor(
        onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_DESTINATION,
        onboardingState,
        { anchor, place: 'right' },
        onboardingComponent
      );
    }
    const isValidDestination = destination.length ? /^(?:\/|[a-z]+:\/\/)/.test(destination) : true;
    return !acceptedFiles.length ? (
      <>
        <Dropzone activeClassName="active" rejectClassName="active" multiple={false} onDrop={(...args) => self.onDrop(...args)}>
          {({ getRootProps, getInputProps }) => (
            <div
              {...getRootProps({ className: 'dashboard-placeholder fadeIn onboard dropzone', style: { top: 0 } })}
              ref={ref => self.onRefSet('onboardingAnchor', ref)}
            >
              <input {...getInputProps()} />
              <span className="icon">
                <CloudUpload fontSize="small" />
              </span>{' '}
              <span>
                Drag here or <a>browse</a> to upload an Artifact file
              </span>
            </div>
          )}
        </Dropzone>
        {!!onboardingComponent && onboardingComponent}
        <p className="info flexbox centered" style={{ marginTop: '10px' }}>
          <InfoIcon fontSize="small" />
          Upload a pre-built .mender Artifact OR any file to create a single-file update Artifact
        </p>
      </>
    ) : (
      <div className="file-upload-form">
        <TextField label="File name" key="filename" disabled defaultValue={filename} />
        <IconButton style={{ margin: 'auto' }} onClick={() => self.setState({ acceptedFiles: [] })}>
          <DeleteIcon />
        </IconButton>
        <TextField
          disabled
          defaultValue={filesize}
          InputLabelProps={{ shrink: true }}
          InputProps={{ inputComponent: FileSize }}
          inputProps={{ fileSize: filesize, style: { padding: '6px 0 7px' } }}
          key="filesize"
          label="Size"
        />
        <div />
        {isMenderArtifact ? (
          <div />
        ) : (
          <div>
            <TextField
              autoFocus={true}
              error={!isValidDestination}
              fullWidth
              helperText={!isValidDestination && <div className="warning">Destination has to be an absolute path</div>}
              inputProps={{ style: { marginTop: 16 } }}
              InputLabelProps={{ shrink: true }}
              label="Destination directory where the file will be installed on your devices"
              onChange={e => self.onChange(e)}
              placeholder="Example: /opt/installed-by-single-file"
              ref={ref => self.onRefSet('onboardingAnchor', ref)}
              value={destination}
            />
            {!!onboardingComponent && onboardingComponent}
          </div>
        )}
        <div />
        <div className="info margin-top-large">
          {isMenderArtifact ? (
            <>
              <p className="info">Artifacts that share the same name but different device type compatibility will be grouped together as a Release.</p>
              <p className="info">If no Release with the Artifact name exists, a new one will be created.</p>
            </>
          ) : (
            <>
              <p className="info">
                This file will be converted to a .mender Artifact file before it is uploaded to the server, which requires some metadata to be entered.
              </p>
              <p className="info">Click &apos;Next&apos; to continue</p>
            </>
          )}
        </div>
      </div>
    );
  }
}
