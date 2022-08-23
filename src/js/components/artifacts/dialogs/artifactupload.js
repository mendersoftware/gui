import React, { useRef, useState } from 'react';
import Dropzone from 'react-dropzone';

import { IconButton, TextField } from '@mui/material';
import { CloudUpload, Delete as DeleteIcon } from '@mui/icons-material';

import { onboardingSteps } from '../../../constants/onboardingConstants';
import { FileSize } from '../../../helpers';
import { getOnboardingComponentFor } from '../../../utils/onboardingmanager';
import useWindowSize from '../../../utils/resizehook';
import InfoHint from '../../common/info-hint';
import InfoText from '../../common/infotext';

const reFilename = new RegExp(/^[a-z0-9.,_-]+$/i);

export const ArtifactUpload = ({
  advanceOnboarding,
  destination: destinationProp = '',
  file,
  isValidDestination,
  onboardingState,
  releases,
  setSnackbar,
  updateCreation
}) => {
  const [acceptedFiles, setAcceptedFiles] = useState(file ? [file] : []);
  const [destination, setDestination] = useState(destinationProp);
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();

  const onboardingAnchor = useRef();

  const onDrop = acceptedFiles => {
    if (acceptedFiles.length === 1) {
      if (!reFilename.test(acceptedFiles[0].name)) {
        setAcceptedFiles([]);
        setSnackbar('Only letters, digits and characters in the set ".,_-" are allowed in the filename.', null);
      } else {
        if (releases.length && !onboardingState.complete) {
          advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_UPLOAD);
        }
        setAcceptedFiles(acceptedFiles);
        updateCreation({ file: acceptedFiles[0] });
      }
    } else {
      setAcceptedFiles([]);
      setSnackbar('The selected file is not supported.', null);
    }
  };

  const onChange = ({ target: { value } }) => {
    setDestination(value);
    updateCreation({ destination: value, file: acceptedFiles.length ? acceptedFiles[0] : null });
  };

  const { filesize, filename, isMenderArtifact } = acceptedFiles.length
    ? { filename: acceptedFiles[0].name, filesize: acceptedFiles[0].size, isMenderArtifact: acceptedFiles[0].name.endsWith('.mender') }
    : { filesize: 0, filename: 0, isMenderArtifact: false };
  let onboardingComponent = null;
  if (!onboardingState.complete && onboardingAnchor.current) {
    const anchor = {
      left: onboardingAnchor.current.offsetLeft + onboardingAnchor.current.clientWidth,
      top: onboardingAnchor.current.offsetTop + onboardingAnchor.current.clientHeight / 2
    };
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_UPLOAD, onboardingState, { anchor, place: 'right' });
    onboardingComponent = getOnboardingComponentFor(
      onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_DESTINATION,
      onboardingState,
      { anchor, place: 'right' },
      onboardingComponent
    );
  }
  return !acceptedFiles.length ? (
    <>
      <Dropzone activeClassName="active" rejectClassName="active" multiple={false} onDrop={onDrop}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps({ className: 'dashboard-placeholder fadeIn onboard dropzone', style: { top: 0 } })} ref={onboardingAnchor}>
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
      <InfoHint content="Upload a pre-built .mender Artifact OR any file to create a single-file update Artifact" style={{ marginTop: 10 }} />
    </>
  ) : (
    <div className="file-upload-form">
      <TextField label="File name" key="filename" disabled defaultValue={filename} />
      <IconButton style={{ margin: 'auto' }} onClick={() => setAcceptedFiles([])} size="large">
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
            onChange={onChange}
            placeholder="Example: /opt/installed-by-single-file"
            ref={onboardingAnchor}
            value={destination}
          />
          {!!onboardingComponent && onboardingComponent}
        </div>
      )}
      <div />
      <div className="info margin-top-large">
        {isMenderArtifact ? (
          <>
            <InfoText>Artifacts that share the same name but different device type compatibility will be grouped together as a Release.</InfoText>
            <InfoText>If no Release with the Artifact name exists, a new one will be created.</InfoText>
          </>
        ) : (
          <>
            <InfoText>
              This file will be converted to a .mender Artifact file before it is uploaded to the server, which requires some metadata to be entered.
            </InfoText>
            <InfoText>Click &apos;Next&apos; to continue</InfoText>
          </>
        )}
      </div>
    </div>
  );
};

export default ArtifactUpload;
