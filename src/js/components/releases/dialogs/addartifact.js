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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Dropzone from 'react-dropzone';

import { CloudUpload, Delete as DeleteIcon, InsertDriveFile as InsertDriveFileIcon } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { onboardingSteps } from '../../../constants/onboardingConstants';
import { FileSize, unionizeStrings } from '../../../helpers';
import Tracking from '../../../tracking';
import { getOnboardingComponentFor } from '../../../utils/onboardingmanager';
import useWindowSize from '../../../utils/resizehook';
import InfoHint from '../../common/info-hint';
import ArtifactInformationForm from './artifactinformationform';
import ArtifactUploadConfirmation from './artifactupload';

const reFilename = new RegExp(/^[a-z0-9.,_-]+$/i);

const useStyles = makeStyles()(theme => ({
  dropzone: { ['&.dropzone']: { padding: theme.spacing(4) } },
  fileInfo: {
    alignItems: 'center',
    columnGap: theme.spacing(4),
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr max-content',
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(4)
  },
  fileSizeWrapper: { marginTop: 5 },
  infoIcon: { '> svg': { alignSelf: 'flex-start', marginTop: theme.spacing(0.5) } }
}));

const uploadTypes = {
  mender: {
    key: 'mender',
    component: ArtifactUploadConfirmation
  },
  singleFile: {
    key: 'singleFile',
    component: ArtifactInformationForm
  }
};

const fileInformationContent = {
  mender: {
    title: 'Mender Artifact',
    icon: InsertDriveFileIcon,
    info: (
      <>
        If there is no Release matching this Artifact’s name, a new Release will be created for this Artifact.
        <br />
        <br />
        If there is already a Release matching this Artifact’s name, the Artifact will be grouped in that Release.
      </>
    )
  },
  singleFile: {
    title: 'Single File',
    icon: InsertDriveFileIcon,
    info: `This will generate a single file application update Artifact, which requires some additional metadata to be entered.`
  }
};

export const FileInformation = ({ file, type, onRemove }) => {
  if (!file) {
    return <div />;
  }
  const { classes } = useStyles();
  const { icon: Icon, info, title } = fileInformationContent[type];
  return (
    <>
      <h4>Selected {title}</h4>
      <div className={classes.fileInfo}>
        <Icon size="large" />
        <div className="flexbox column">
          <div>{file.name}</div>
          <div className={`muted ${classes.fileSizeWrapper}`}>
            <FileSize fileSize={file.size} />
          </div>
        </div>
        <IconButton size="large" onClick={onRemove}>
          <DeleteIcon />
        </IconButton>
      </div>
      <Divider className="margin-right-large" />
      <InfoHint className={classes.infoIcon} content={info} />
    </>
  );
};

const commonExtensions = ['zip', 'txt', 'tar', 'html', 'tar.gzip', 'gzip'];
const shortenFileName = name => {
  const extension = commonExtensions.find(extension => name.endsWith(extension));
  if (extension) {
    const dotIndex = name.lastIndexOf(`.${extension}`);
    return name.substring(0, dotIndex);
  }
  return name;
};

export const ArtifactUpload = ({ advanceOnboarding, onboardingState, releases, setSnackbar, updateCreation }) => {
  const onboardingAnchor = useRef();
  const { classes } = useStyles();
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();

  const onDrop = acceptedFiles => {
    const emptyFileInfo = { file: undefined, name: '', type: uploadTypes.mender.key };
    if (acceptedFiles.length === 1) {
      if (!reFilename.test(acceptedFiles[0].name)) {
        updateCreation(emptyFileInfo);
        setSnackbar('Only letters, digits and characters in the set ".,_-" are allowed in the filename.', null);
      } else {
        if (releases.length && !onboardingState.complete) {
          advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_UPLOAD);
        }
        const { name } = acceptedFiles[0];
        updateCreation({
          file: acceptedFiles[0],
          name: onboardingState.complete ? shortenFileName(name) : '',
          type: name.endsWith('.mender') ? uploadTypes.mender.key : uploadTypes.singleFile.key
        });
      }
    } else {
      updateCreation(emptyFileInfo);
      setSnackbar('The selected file is not supported.', null);
    }
  };

  let onboardingComponent = null;
  if (!onboardingState.complete && onboardingAnchor.current) {
    const anchor = {
      left: onboardingAnchor.current.offsetLeft + onboardingAnchor.current.clientWidth,
      top: onboardingAnchor.current.offsetTop + onboardingAnchor.current.clientHeight / 2
    };
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_UPLOAD, onboardingState, { anchor, place: 'right' });
  }
  return (
    <>
      <div className="flexbox column centered margin">
        Upload a premade Mender Artifact
        <p className="muted">OR</p>
        Upload a file to generate a single file application update Artifact
      </div>
      <Dropzone multiple={false} onDrop={onDrop}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps({ className: `fadeIn onboard dropzone ${classes.dropzone}` })} ref={onboardingAnchor}>
            <input {...getInputProps()} />
            <CloudUpload fontSize="large" className="muted" />
            <div>
              Drag and drop here or <b>browse</b> to upload
            </div>
          </div>
        )}
      </Dropzone>
      {!!onboardingComponent && onboardingComponent}
    </>
  );
};

export const AddArtifactDialog = ({
  advanceOnboarding,
  createArtifact,
  deviceTypes = [],
  onboardingState,
  onCancel,
  onUploadStarted,
  pastCount,
  releases,
  selectedFile,
  setSnackbar,
  uploadArtifact
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [creation, setCreation] = useState({
    customDeviceTypes: '',
    destination: '',
    file: undefined,
    fileSystem: 'rootfs-image',
    finalStep: false,
    isValid: false,
    isValidDestination: false,
    name: '',
    selectedDeviceTypes: [],
    softwareName: '',
    softwareVersion: '',
    type: uploadTypes.mender.key
  });

  useEffect(() => {
    setCreation(current => ({ ...current, file: selectedFile }));
  }, [selectedFile]);

  const onUpload = useCallback(() => {
    const { customDeviceTypes, destination, file, fileSystem, name, selectedDeviceTypes, softwareName, softwareVersion } = creation;
    const { name: filename = '' } = file;
    let meta = { description: '' };
    if (filename.endsWith('.mender')) {
      return addArtifact(meta, file, 'upload');
    }
    const otherDeviceTypes = customDeviceTypes.split(',');
    const deviceTypes = unionizeStrings(selectedDeviceTypes, otherDeviceTypes);
    meta = {
      ...meta,
      device_types_compatible: deviceTypes,
      args: { dest_dir: destination, filename, software_filesystem: fileSystem, software_name: softwareName, software_version: softwareVersion },
      name
    };
    return addArtifact(meta, file, 'create');
  }, [JSON.stringify(creation)]);

  const addArtifact = (meta, file, type = 'upload') => {
    const upload = type === 'create' ? createArtifact(meta, file) : uploadArtifact(meta, file);
    onUploadStarted();
    return upload.then(() => {
      if (!onboardingState.complete && deviceTypes.length && pastCount) {
        advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_TIP);
        if (type === 'create') {
          advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_CLICK);
        }
      }
      // track in GA
      Tracking.event({ category: 'artifacts', action: 'create' });
    });
  };

  const onUpdateCreation = update => setCreation(current => ({ ...current, ...update }));

  const onNextClick = useCallback(() => {
    if (!onboardingState.complete && creation.destination) {
      advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_DEVICE_TYPE);
    }
    onUpdateCreation({ isValid: false });
    setActiveStep(activeStep + 1);
  }, [activeStep, creation.destination, onboardingState.complete]);

  const onRemove = () => onUpdateCreation({ file: undefined, isValid: false });
  const buttonRef = useRef();

  const { file, finalStep, isValid, type } = creation;
  const { component: ComponentToShow } = uploadTypes[type];
  const commonProps = { advanceOnboarding, onboardingState, releases, setSnackbar, updateCreation: onUpdateCreation };

  let onboardingComponent = null;
  if (!onboardingState.complete && buttonRef.current && finalStep && isValid) {
    const releaseNameAnchor = {
      left: buttonRef.current.offsetLeft - 15,
      top: buttonRef.current.offsetTop + buttonRef.current.clientHeight / 2
    };
    onboardingComponent = getOnboardingComponentFor(
      onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_CLICK,
      onboardingState,
      { anchor: releaseNameAnchor, place: 'left' },
      onboardingComponent
    );
  }
  return (
    <Dialog open={true} fullWidth={true} maxWidth="sm">
      <DialogTitle>Upload an Artifact</DialogTitle>
      <DialogContent className="dialog-content margin-top margin-left margin-right margin-bottom">
        {!file ? (
          <ArtifactUpload {...commonProps} />
        ) : (
          <ComponentToShow {...commonProps} activeStep={activeStep} creation={creation} deviceTypes={deviceTypes} onRemove={onRemove} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        {!!activeStep && <Button onClick={() => setActiveStep(activeStep - 1)}>Back</Button>}
        <div style={{ flexGrow: 1 }} />
        {file && (
          <Button variant="contained" color="primary" disabled={!isValid} onClick={() => (finalStep ? onUpload() : onNextClick())} ref={buttonRef}>
            {finalStep ? 'Upload artifact' : 'Next'}
          </Button>
        )}
        {onboardingComponent}
      </DialogActions>
    </Dialog>
  );
};

export default AddArtifactDialog;
